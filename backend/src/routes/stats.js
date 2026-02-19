import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { supabase } from '../db.js'
import { estimateCost } from '../utils/pricing.js'

const router = Router()

// GET /api/stats/usage
router.get('/usage', requireAuth, async (req, res, next) => {
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('model, tokens, created_at')
      .eq('user_id', req.user.id)
      .eq('role', 'assistant')
      .order('created_at', { ascending: true })
      .limit(1000)
    
    if (error) throw error

    // Calculate total stats
    let totalTokens = 0
    let totalCost = 0
    const modelBreakdown = {}
    const dailyStats = {}

    messages.forEach(msg => {
      totalTokens += msg.tokens || 0
      const cost = estimateCost(msg.model, msg.tokens || 0)
      totalCost += cost

      // Model breakdown
      if (!modelBreakdown[msg.model]) {
        modelBreakdown[msg.model] = { tokens: 0, cost: 0, count: 0 }
      }
      modelBreakdown[msg.model].tokens += msg.tokens || 0
      modelBreakdown[msg.model].cost += cost
      modelBreakdown[msg.model].count += 1

      // Daily stats
      const date = new Date(msg.created_at).toISOString().split('T')[0]
      if (!dailyStats[date]) {
        dailyStats[date] = { tokens: 0, cost: 0, count: 0 }
      }
      dailyStats[date].tokens += msg.tokens || 0
      dailyStats[date].cost += cost
      dailyStats[date].count += 1
    })

    // Convert to arrays for charts
    const dailyData = Object.entries(dailyStats)
      .map(([date, stats]) => ({ date, ...stats }))
      .slice(-30) // Last 30 days

    const modelData = Object.entries(modelBreakdown)
      .map(([model, stats]) => ({ model, ...stats }))

    res.json({
      total: {
        tokens: totalTokens,
        cost: totalCost,
        messages: messages.length,
      },
      daily: dailyData,
      models: modelData,
    })
  } catch (err) { next(err) }
})

export default router

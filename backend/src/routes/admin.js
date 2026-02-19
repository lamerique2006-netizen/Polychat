import { Router } from 'express'
import { requireAdmin } from '../middleware/auth.js'
import { supabase } from '../db.js'

const router = Router()

// GET /api/admin/stats
router.get('/stats', requireAdmin, async (req, res, next) => {
  try {
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
    
    const { count: totalMessages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
    
    const { data: planBreakdown } = await supabase
      .from('users')
      .select('plan')
    
    const plans = {}
    planBreakdown?.forEach(u => {
      plans[u.plan] = (plans[u.plan] || 0) + 1
    })
    
    res.json({
      totalUsers,
      totalMessages,
      planBreakdown: Object.entries(plans).map(([plan, count]) => ({ plan, count })),
    })
  } catch (err) { next(err) }
})

// GET /api/admin/users
router.get('/users', requireAdmin, async (req, res, next) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, plan, msg_count, created_at')
      .order('created_at', { ascending: false })
      .limit(100)
    
    if (error) throw error
    
    res.json(users || [])
  } catch (err) { next(err) }
})

export default router

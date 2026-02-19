import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { supabase } from '../db.js'

const router = Router()

// GET /api/user/me
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, plan, msg_count, msg_reset, created_at')
      .eq('id', req.user.id)
      .single()
    
    if (error || !user) return res.status(404).json({ message: 'User not found' })
    
    res.json(user)
  } catch (err) { next(err) }
})

// GET /api/user/usage
router.get('/usage', requireAuth, async (req, res, next) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('plan, msg_count, msg_reset')
      .eq('id', req.user.id)
      .single()
    
    if (error) throw error
    
    const limits = { free: 50, pro: 5000, enterprise: null }
    
    res.json({
      plan: user.plan,
      used: user.msg_count,
      limit: limits[user.plan],
      resetAt: user.msg_reset,
    })
  } catch (err) { next(err) }
})

// GET /api/user/history
router.get('/history', requireAuth, async (req, res, next) => {
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('id, role, content, model, tokens, created_at')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(100)
    
    if (error) throw error
    
    res.json(messages || [])
  } catch (err) { next(err) }
})

export default router

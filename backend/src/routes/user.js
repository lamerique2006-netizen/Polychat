import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { pool } from '../db.js'

const router = Router()

// GET /api/user/me
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, plan, msg_count, msg_reset, created_at FROM users WHERE id = $1',
      [req.user.id]
    )
    if (!rows.length) return res.status(404).json({ message: 'User not found' })
    res.json(rows[0])
  } catch (err) { next(err) }
})

// GET /api/user/usage
router.get('/usage', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT plan, msg_count, msg_reset FROM users WHERE id = $1',
      [req.user.id]
    )
    const user = rows[0]
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
    const { rows } = await pool.query(
      'SELECT id, role, content, model, tokens, created_at FROM messages WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100',
      [req.user.id]
    )
    res.json(rows)
  } catch (err) { next(err) }
})

export default router

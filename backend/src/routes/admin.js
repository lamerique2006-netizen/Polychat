import { Router } from 'express'
import { requireAdmin } from '../middleware/auth.js'
import { pool } from '../db.js'

const router = Router()

// GET /api/admin/stats
router.get('/stats', requireAdmin, async (req, res, next) => {
  try {
    const [users, messages, plans] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM messages'),
      pool.query('SELECT plan, COUNT(*) FROM users GROUP BY plan'),
    ])
    res.json({
      totalUsers: parseInt(users.rows[0].count),
      totalMessages: parseInt(messages.rows[0].count),
      planBreakdown: plans.rows,
    })
  } catch (err) { next(err) }
})

// GET /api/admin/users
router.get('/users', requireAdmin, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, plan, msg_count, created_at FROM users ORDER BY created_at DESC LIMIT 100'
    )
    res.json(rows)
  } catch (err) { next(err) }
})

export default router

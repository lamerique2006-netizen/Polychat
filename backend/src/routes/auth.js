import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from '../db.js'

const router = Router()

const signToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, plan: user.plan }, process.env.JWT_SECRET, { expiresIn: '7d' })

// POST /api/auth/signup
router.post('/signup', async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' })
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' })

    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()])
    if (exists.rows.length) return res.status(409).json({ message: 'Email already registered' })

    const hashed = await bcrypt.hash(password, 12)
    const { rows } = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, plan, created_at',
      [email.toLowerCase(), hashed]
    )
    const user = rows[0]
    res.status(201).json({ token: signToken(user), user })
  } catch (err) { next(err) }
})

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' })

    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()])
    const user = rows[0]
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' })

    const { password: _, ...safeUser } = user
    res.json({ token: signToken(safeUser), user: safeUser })
  } catch (err) { next(err) }
})

export default router

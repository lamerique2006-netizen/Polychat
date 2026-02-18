import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { rateLimit } from 'express-rate-limit'

import authRoutes from './routes/auth.js'
import chatRoutes from './routes/chat.js'
import userRoutes from './routes/user.js'
import adminRoutes from './routes/admin.js'
import { initDb } from './db.js'

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}))
app.use(express.json())

// Global rate limit
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, slow down.' }
}))

// Health check (before other routes)
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/user', userRoutes)
app.use('/api/admin', adminRoutes)

// 404
app.use((_, res) => res.status(404).json({ message: 'Not found' }))

// Error handler
app.use((err, req, res, _next) => {
  console.error(err)
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' })
})

// Start (DB disabled temporarily for initial deploy)
app.listen(PORT, () => console.log(`PolyChat backend running on port ${PORT}`))

// Uncomment when database is ready:
// initDb().then(() => {
//   app.listen(PORT, () => console.log(`PolyChat backend running on port ${PORT}`))
// }).catch(err => {
//   console.error('DB init failed:', err)
//   process.exit(1)
// })

import jwt from 'jsonwebtoken'

export function requireAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  try {
    const token = header.slice(7)
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}

export function requireAdmin(req, res, next) {
  const password = req.headers['x-admin-password']
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(403).json({ message: 'Forbidden' })
  }
  next()
}

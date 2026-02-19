import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api'

const MODELS = {
  'gpt-4o': { label: 'GPT-4o', icon: '🟢', color: 'text-green-400' },
  'claude-3-5-sonnet': { label: 'Claude 3.5', icon: '🟠', color: 'text-orange-400' },
  'grok-2': { label: 'Grok 2', icon: '🔵', color: 'text-blue-400' },
  'gpt-3-5-turbo': { label: 'GPT-3.5', icon: '🟢', color: 'text-green-300' },
  'claude-instant': { label: 'Claude Instant', icon: '🟠', color: 'text-orange-300' },
}

export default function Analytics() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/stats/usage')
      setStats(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const formatCost = (cost) => {
    if (cost < 0.001) return `$${(cost * 1000).toFixed(2)}/1k`
    if (cost < 1) return `$${cost.toFixed(4)}`
    return `$${cost.toFixed(2)}`
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-20 left-10 w-96 h-96 bg-brand-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-gray-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-gray-400 hover:text-white transition">
              ← Back
            </Link>
            <h1 className="text-xl font-bold">Usage Analytics</h1>
          </div>
          <button 
            onClick={() => { logout(); navigate('/'); }}
            className="text-sm text-gray-400 hover:text-red-400 transition"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="text-gray-400 text-sm mb-2">Total Messages</div>
            <div className="text-3xl font-bold text-white">{stats?.total.messages || 0}</div>
            <div className="text-xs text-gray-500 mt-1">All time</div>
          </motion.div>

          <motion.div 
            className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-gray-400 text-sm mb-2">Total Tokens</div>
            <div className="text-3xl font-bold text-white">
              {(stats?.total.tokens || 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">Input + Output</div>
          </motion.div>

          <motion.div 
            className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-gray-400 text-sm mb-2">Estimated Cost</div>
            <div className="text-3xl font-bold text-brand-400">
              {formatCost(stats?.total.cost || 0)}
            </div>
            <div className="text-xs text-gray-500 mt-1">All time</div>
          </motion.div>
        </div>

        {/* Model Breakdown */}
        <motion.div 
          className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-lg font-semibold mb-4">Usage by Model</h2>
          <div className="space-y-4">
            {stats?.models.map((model, i) => {
              const modelInfo = MODELS[model.model] || {}
              const percentage = (model.tokens / stats.total.tokens) * 100

              return (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span>{modelInfo.icon}</span>
                      <span className={modelInfo.color}>{modelInfo.label || model.model}</span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-400">
                      <span>{model.count} msgs</span>
                      <span>{model.tokens.toLocaleString()} tokens</span>
                      <span className="text-brand-400">{formatCost(model.cost)}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-brand-600 to-purple-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Daily Usage Chart */}
        <motion.div 
          className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-lg font-semibold mb-4">Daily Usage (Last 30 Days)</h2>
          {stats?.daily.length > 0 ? (
            <div className="space-y-2">
              {stats.daily.slice(-7).reverse().map((day, i) => {
                const maxTokens = Math.max(...stats.daily.map(d => d.tokens))
                const width = (day.tokens / maxTokens) * 100

                return (
                  <div key={i} className="flex items-center gap-4">
                    <div className="text-xs text-gray-500 w-20 text-right">
                      {new Date(day.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex-1 h-8 bg-gray-800 rounded-lg overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-brand-600 to-purple-600 flex items-center px-3"
                        initial={{ width: 0 }}
                        animate={{ width: `${width}%` }}
                        transition={{ duration: 0.8, delay: 0.6 + i * 0.05 }}
                      >
                        {width > 20 && (
                          <span className="text-xs text-white font-medium">
                            {day.tokens.toLocaleString()} tokens
                          </span>
                        )}
                      </motion.div>
                    </div>
                    <div className="text-xs text-gray-400 w-16 text-right">
                      {formatCost(day.cost)}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">No usage data yet</div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

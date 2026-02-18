import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const models = [
  { name: 'GPT-4o', color: 'from-green-400 to-emerald-600', desc: 'OpenAI flagship' },
  { name: 'Claude 3.5', color: 'from-orange-400 to-amber-600', desc: 'Anthropic' },
  { name: 'Grok 2', color: 'from-blue-400 to-cyan-600', desc: 'xAI' },
]

const features = [
  { icon: '⚡', title: 'Multi-Model Chat', desc: 'Talk to GPT-4, Claude, and Grok in one place.' },
  { icon: '🔍', title: 'Compare Mode', desc: 'Send one prompt, get answers from all models side by side.' },
  { icon: '🧠', title: 'Synthesis Engine', desc: 'Combine outputs from multiple AIs into one refined answer.' },
  { icon: '💬', title: 'Debate Mode', desc: 'Watch models argue a topic and form their own conclusions.' },
  { icon: '📊', title: 'Usage Analytics', desc: 'Track tokens, costs, and performance per model.' },
  { icon: '🔒', title: 'Secure & Private', desc: 'JWT auth, encrypted storage, zero data sharing.' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 max-w-7xl mx-auto">
        <span className="text-xl font-bold text-brand-500">PolyChat</span>
        <div className="flex items-center gap-4">
          <Link to="/pricing" className="text-sm text-gray-400 hover:text-white transition">Pricing</Link>
          <Link to="/login" className="text-sm text-gray-400 hover:text-white transition">Login</Link>
          <Link to="/signup" className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-block bg-brand-500/10 text-brand-400 text-xs font-semibold px-3 py-1 rounded-full mb-6 border border-brand-500/20">
            Multi-Model AI Platform
          </span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
            Chat with every<br />AI at once
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
            GPT-4, Claude, and Grok — all in one tab. Compare answers, synthesize insights, or let them debate.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/signup" className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-8 py-3 rounded-xl transition text-lg">
              Start for free
            </Link>
            <Link to="/pricing" className="text-gray-400 hover:text-white transition font-medium">
              View pricing →
            </Link>
          </div>
        </motion.div>

        {/* Model pills */}
        <motion.div
          className="flex items-center justify-center gap-4 mt-16 flex-wrap"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        >
          {models.map(m => (
            <div key={m.name} className={`bg-gradient-to-br ${m.color} p-px rounded-xl`}>
              <div className="bg-gray-900 rounded-xl px-5 py-3 text-left">
                <div className="font-semibold text-sm">{m.name}</div>
                <div className="text-xs text-gray-400">{m.desc}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(f => (
            <motion.div
              key={f.title}
              className="bg-gray-900 border border-white/5 rounded-2xl p-6 hover:border-brand-500/30 transition"
              whileHover={{ y: -4 }}
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-br from-brand-600/20 to-purple-600/20 border border-brand-500/20 rounded-3xl p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to go beyond one AI?</h2>
          <p className="text-gray-400 mb-8">Join PolyChat and unlock the full power of multi-model intelligence.</p>
          <Link to="/signup" className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-8 py-3 rounded-xl transition inline-block">
            Create free account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-sm text-gray-500">
        © 2026 PolyChat · Built by Scott & Serena
      </footer>
    </div>
  )
}

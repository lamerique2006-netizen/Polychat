import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'

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

function AnimatedText({ text, className }) {
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, 50)
      return () => clearTimeout(timeout)
    }
  }, [currentIndex, text])

  return <span className={className}>{displayText}<span className="animate-pulse">|</span></span>
}

function ScrollReveal({ children, delay = 0 }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  )
}

function FloatingOrb({ color, size, top, left, delay }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-20 ${color}`}
      style={{ width: size, height: size, top, left }}
      animate={{
        y: [0, -30, 0],
        x: [0, 20, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 8,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  )
}

export default function Landing() {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, 50])
  const y2 = useTransform(scrollY, [0, 300], [0, -50])
  const opacity = useTransform(scrollY, [0, 200], [1, 0])

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth'
    return () => { document.documentElement.style.scrollBehavior = 'auto' }
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
      {/* Animated background orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <FloatingOrb color="bg-brand-500" size="400px" top="10%" left="10%" delay={0} />
        <FloatingOrb color="bg-purple-500" size="300px" top="60%" left="70%" delay={2} />
        <FloatingOrb color="bg-cyan-500" size="350px" top="40%" left="80%" delay={4} />
      </div>

      {/* Navbar */}
      <motion.nav 
        className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5 max-w-7xl mx-auto backdrop-blur-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="text-xl font-bold bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
          PolyChat
        </span>
        <div className="flex items-center gap-4">
          <Link to="/pricing" className="text-sm text-gray-400 hover:text-white transition-all hover:scale-105">
            Pricing
          </Link>
          <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-all hover:scale-105">
            Login
          </Link>
          <Link 
            to="/signup" 
            className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-brand-500/50"
          >
            Get Started
          </Link>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
        <motion.div style={{ y: y1, opacity }}>
          <motion.span 
            className="inline-block bg-brand-500/10 text-brand-400 text-xs font-semibold px-3 py-1 rounded-full mb-6 border border-brand-500/20"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Multi-Model AI Platform
          </motion.span>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent animate-gradient">
              Chat with every
            </span>
            <br />
            <AnimatedText 
              text="AI at once" 
              className="bg-gradient-to-r from-brand-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"
            />
          </h1>
          
          <motion.p 
            className="text-lg text-gray-400 max-w-2xl mx-auto mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            GPT-4, Claude, and Grok — all in one tab. Compare answers, synthesize insights, or let them debate.
          </motion.p>
          
          <motion.div 
            className="flex items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.3 }}
          >
            <Link 
              to="/signup" 
              className="group relative bg-brand-600 hover:bg-brand-700 text-white font-semibold px-8 py-3 rounded-xl transition-all text-lg overflow-hidden"
            >
              <span className="relative z-10">Start for free</span>
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-purple-600 to-brand-600"
                initial={{ x: '100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </Link>
            <Link to="/pricing" className="text-gray-400 hover:text-white transition-all font-medium hover:scale-105">
              View pricing →
            </Link>
          </motion.div>
        </motion.div>

        {/* Model pills */}
        <motion.div
          style={{ y: y2 }}
          className="flex items-center justify-center gap-4 mt-16 flex-wrap"
        >
          {models.map((m, i) => (
            <motion.div 
              key={m.name} 
              className={`bg-gradient-to-br ${m.color} p-px rounded-xl cursor-pointer`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.5 + i * 0.1 }}
              whileHover={{ scale: 1.05, rotate: 2 }}
            >
              <div className="bg-gray-900 rounded-xl px-5 py-3 text-left hover:bg-gray-800 transition">
                <div className="font-semibold text-sm">{m.name}</div>
                <div className="text-xs text-gray-400">{m.desc}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative max-w-7xl mx-auto px-6 py-20">
        <ScrollReveal>
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Everything you need
          </h2>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <ScrollReveal key={f.title} delay={i * 0.1}>
              <motion.div
                className="group bg-gray-900 border border-white/5 rounded-2xl p-6 hover:border-brand-500/30 transition cursor-pointer"
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="text-3xl mb-3"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, delay: i * 0.2, repeat: Infinity, repeatDelay: 3 }}
                >
                  {f.icon}
                </motion.div>
                <h3 className="font-semibold text-lg mb-1 group-hover:text-brand-400 transition">{f.title}</h3>
                <p className="text-gray-400 text-sm">{f.desc}</p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative max-w-3xl mx-auto px-6 py-20 text-center">
        <ScrollReveal>
          <motion.div 
            className="bg-gradient-to-br from-brand-600/20 to-purple-600/20 border border-brand-500/20 rounded-3xl p-12 backdrop-blur-sm"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Ready to go beyond one AI?
            </h2>
            <p className="text-gray-400 mb-8">Join PolyChat and unlock the full power of multi-model intelligence.</p>
            <Link 
              to="/signup" 
              className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-semibold px-8 py-3 rounded-xl transition-all hover:scale-105 hover:shadow-xl hover:shadow-brand-500/50"
            >
              Create free account
            </Link>
          </motion.div>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/5 py-8 text-center text-sm text-gray-500">
        © 2026 PolyChat · Built by Scott & Serena
      </footer>

      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  )
}

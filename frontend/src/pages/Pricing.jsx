import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    desc: 'Try PolyChat with no commitment.',
    features: ['50 messages/month', 'GPT-3.5 + Claude Instant', 'Single-model chat', 'Basic history'],
    cta: 'Get started',
    href: '/signup',
    highlight: false,
    badge: null,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    desc: 'For power users who want it all.',
    features: ['5,000 messages/month', 'All models (GPT-4, Claude, Grok)', 'Compare Mode', 'Synthesis Engine', 'Usage analytics', 'Priority support'],
    cta: 'Start Pro',
    href: '/signup',
    highlight: true,
    badge: 'Most popular',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For teams and large-scale usage.',
    features: ['Unlimited messages', 'Custom model deployment', 'Team workspaces', 'SSO / SAML', 'REST API access', 'Dedicated support'],
    cta: 'Contact us',
    href: 'mailto:hello@polychat.ai',
    highlight: false,
    badge: null,
  },
]

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-20 left-10 w-96 h-96 bg-brand-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5 max-w-7xl mx-auto">
        <Link to="/" className="text-xl font-bold bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
          PolyChat
        </Link>
        <div className="flex gap-4">
          <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-all hover:scale-105">
            Login
          </Link>
          <Link to="/signup" className="bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-700 hover:to-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all hover:scale-105 shadow-lg">
            Get Started
          </Link>
        </div>
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.span 
            className="inline-block bg-brand-500/10 text-brand-400 text-xs font-semibold px-3 py-1 rounded-full mb-6 border border-brand-500/20"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Simple pricing
          </motion.span>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Choose your plan
          </h1>
          <p className="text-gray-400 text-lg">Start free. Upgrade when you need more.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              className={`relative rounded-3xl p-8 flex flex-col ${
                plan.highlight
                  ? 'bg-gradient-to-br from-brand-600/20 to-purple-600/20 border-2 border-brand-500 shadow-2xl shadow-brand-500/20'
                  : 'bg-gray-900/50 border border-white/10 backdrop-blur-xl'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ 
                y: -8, 
                boxShadow: plan.highlight 
                  ? '0 20px 60px rgba(99, 102, 241, 0.4)' 
                  : '0 20px 40px rgba(0, 0, 0, 0.3)'
              }}
            >
              {plan.badge && (
                <motion.div 
                  className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-600 to-purple-600 px-4 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                >
                  {plan.badge}
                </motion.div>
              )}
              
              <div className="mb-6">
                <h2 className="font-bold text-xl mb-1">{plan.name}</h2>
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {plan.price}
                  </span>
                  <span className="text-sm text-gray-400 mb-2">{plan.period}</span>
                </div>
                <p className="text-sm text-gray-400">{plan.desc}</p>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((f, idx) => (
                  <motion.li 
                    key={f} 
                    className="flex items-start gap-3 text-sm"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + idx * 0.05 }}
                  >
                    <span className="text-green-400 text-lg flex-shrink-0">✓</span>
                    <span className="text-gray-300">{f}</span>
                  </motion.li>
                ))}
              </ul>

              <Link
                to={plan.href}
                className={`block text-center font-semibold py-3.5 rounded-xl transition-all ${
                  plan.highlight
                    ? 'bg-white text-brand-700 hover:bg-gray-100 shadow-lg hover:shadow-xl'
                    : 'bg-gray-800 hover:bg-gray-700 text-white border border-white/10'
                }`}
              >
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="block"
                >
                  {plan.cta}
                </motion.span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div 
          className="mt-20 max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h2 className="text-3xl font-bold text-center mb-10 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {[
              { q: 'Can I switch plans later?', a: 'Yes! You can upgrade or downgrade at any time. Changes take effect immediately.' },
              { q: 'What happens when I hit my message limit?', a: 'Your account will pause until the next billing cycle. You can upgrade anytime to continue.' },
              { q: 'Do you offer refunds?', a: 'Yes, we offer a 30-day money-back guarantee on all paid plans.' },
              { q: 'Can I use my own API keys?', a: 'Not yet, but this feature is coming in Enterprise plans soon.' },
            ].map((faq, i) => (
              <motion.details
                key={i}
                className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 cursor-pointer group"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + i * 0.1 }}
                whileHover={{ borderColor: 'rgba(99, 102, 241, 0.3)' }}
              >
                <summary className="font-semibold text-lg list-none flex items-center justify-between">
                  {faq.q}
                  <span className="text-brand-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-gray-400 text-sm mt-3">{faq.a}</p>
              </motion.details>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

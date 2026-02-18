import { Link } from 'react-router-dom'

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
  },
]

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 max-w-7xl mx-auto">
        <Link to="/" className="text-xl font-bold text-brand-500">PolyChat</Link>
        <div className="flex gap-4">
          <Link to="/login" className="text-sm text-gray-400 hover:text-white transition">Login</Link>
          <Link to="/signup" className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">Get Started</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Simple, honest pricing</h1>
          <p className="text-gray-400">Start free. Upgrade when you need more.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 flex flex-col ${
                plan.highlight
                  ? 'bg-brand-600 border border-brand-500'
                  : 'bg-gray-900 border border-white/5'
              }`}
            >
              <div className="mb-6">
                <h2 className="font-bold text-lg mb-1">{plan.name}</h2>
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-sm text-gray-300 mb-1">{plan.period}</span>
                </div>
                <p className="text-sm text-gray-300">{plan.desc}</p>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <span className="text-green-400">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to={plan.href}
                className={`block text-center font-medium py-2.5 rounded-xl transition ${
                  plan.highlight
                    ? 'bg-white text-brand-700 hover:bg-gray-100'
                    : 'bg-gray-800 hover:bg-gray-700 text-white'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api'

const MODELS = [
  { id: 'gpt-4o', label: 'GPT-4o', color: 'text-green-400', bg: 'bg-green-500/10', icon: '🟢', desc: 'Most capable' },
  { id: 'claude-3-5-sonnet', label: 'Claude 3.5', color: 'text-orange-400', bg: 'bg-orange-500/10', icon: '🟠', desc: 'Best reasoning' },
  { id: 'grok-2', label: 'Grok 2', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: '🔵', desc: 'Real-time data' },
]

function Message({ msg, isLast }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div 
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${isUser ? 'bg-gradient-to-br from-brand-600 to-purple-600' : 'bg-gray-700'}`}
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {isUser ? 'Y' : '🤖'}
      </motion.div>
      <motion.div 
        className={`group max-w-[75%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed relative ${
          isUser 
            ? 'bg-gradient-to-br from-brand-600 to-brand-700 text-white' 
            : 'bg-gray-800 text-gray-100 border border-white/5'
        }`}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <div className="relative z-10">
          {msg.content}
          {msg.model && (
            <motion.div 
              className="text-xs opacity-50 mt-2 flex items-center gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.2 }}
            >
              <span>{MODELS.find(m => m.id === msg.model)?.icon}</span>
              {MODELS.find(m => m.id === msg.model)?.label}
            </motion.div>
          )}
        </div>
        {!isUser && (
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-brand-500/0 via-brand-500/5 to-brand-500/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
          />
        )}
      </motion.div>
    </motion.div>
  )
}

function ModelSelector({ models, selected, onSelect }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 px-1">
      {models.map(m => (
        <motion.button
          key={m.id}
          onClick={() => onSelect(m.id)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
            selected === m.id
              ? `${m.bg} ${m.color} border border-current/20 shadow-lg`
              : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800 border border-white/5'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <span>{m.icon}</span>
          <div className="text-left">
            <div className="font-semibold">{m.label}</div>
            {selected === m.id && <div className="text-xs opacity-70">{m.desc}</div>}
          </div>
          {selected === m.id && (
            <motion.div 
              layoutId="activeModel"
              className="w-1.5 h-1.5 rounded-full bg-current"
            />
          )}
        </motion.button>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [model, setModel] = useState(MODELS[0].id)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || sending) return
    const userMsg = { role: 'user', content: input.trim() }
    setMessages(m => [...m, userMsg])
    setInput('')
    setSending(true)
    try {
      const { data } = await api.post('/chat', {
        model,
        messages: [...messages, userMsg],
      })
      setMessages(m => [...m, { role: 'assistant', content: data.content, model: data.model }])
    } catch (err) {
      setMessages(m => [...m, { role: 'assistant', content: '⚠️ ' + (err.response?.data?.message || 'Something went wrong. Try again.'), model }])
    } finally {
      setSending(false)
    }
  }

  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const activeModel = MODELS.find(m => m.id === model)

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-20 left-10 w-96 h-96 bg-brand-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside 
            className="relative z-10 w-72 flex-shrink-0 bg-gray-900/80 backdrop-blur-xl border-r border-white/5 flex flex-col"
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 25 }}
          >
            <div className="p-5 border-b border-white/5">
              <span className="font-bold text-xl bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
                PolyChat
              </span>
            </div>

            <div className="p-4">
              <motion.button
                onClick={() => setMessages([])}
                className="w-full bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-700 hover:to-purple-700 text-white text-sm font-medium py-3 rounded-xl transition-all shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ✨ New Chat
              </motion.button>
            </div>

            {/* Model Selector in Sidebar */}
            <div className="px-4 py-3">
              <p className="text-xs text-gray-500 mb-3 px-1 uppercase tracking-wider">Select Model</p>
              <div className="space-y-2">
                {MODELS.map(m => (
                  <motion.button
                    key={m.id}
                    onClick={() => setModel(m.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                      model === m.id 
                        ? `${m.bg} ${m.color} border border-current/20` 
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent'
                    }`}
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <span className="text-xl">{m.icon}</span>
                    <div className="flex-1 text-left">
                      <div className="font-semibold">{m.label}</div>
                      <div className="text-xs opacity-60">{m.desc}</div>
                    </div>
                    {model === m.id && (
                      <motion.div 
                        layoutId="activeSidebar"
                        className="w-2 h-2 rounded-full bg-current"
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="mt-auto p-5 border-t border-white/5 space-y-3">
              <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-purple-600 flex items-center justify-center font-bold text-sm">
                  {user?.email?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{user?.email}</div>
                  <div className="text-xs text-gray-500">Free Plan</div>
                </div>
              </div>
              <motion.button 
                onClick={handleLogout}
                className="w-full text-xs text-gray-400 hover:text-red-400 transition py-2 px-3 rounded-lg hover:bg-red-500/10"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Sign out →
              </motion.button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center gap-4 px-5 py-4 border-b border-white/5 bg-gray-900/50 backdrop-blur-xl">
          <motion.button 
            onClick={() => setSidebarOpen(s => !s)} 
            className="text-gray-400 hover:text-white transition p-2 rounded-lg hover:bg-gray-800"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </motion.button>
          <div className="flex items-center gap-2">
            <span className="text-xl">{activeModel?.icon}</span>
            <div>
              <div className={`text-sm font-semibold ${activeModel?.color}`}>{activeModel?.label}</div>
              <div className="text-xs text-gray-500">{activeModel?.desc}</div>
            </div>
          </div>
          <div className="ml-auto text-xs text-gray-600 bg-gray-800/50 px-3 py-1.5 rounded-full border border-white/5">
            Free: 50 msg/mo
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
          {messages.length === 0 && (
            <motion.div 
              className="flex flex-col items-center justify-center h-full text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div 
                className="text-6xl mb-6"
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
              >
                🤖
              </motion.div>
              <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Start a conversation
              </h2>
              <p className="text-gray-400 text-sm max-w-md mb-6">
                Select a model and ask anything. Switch models mid-conversation to compare answers.
              </p>
              <div className="flex gap-2 flex-wrap justify-center max-w-lg">
                {['Explain quantum computing', 'Write a poem about AI', 'Debug my code'].map((prompt, i) => (
                  <motion.button
                    key={i}
                    onClick={() => setInput(prompt)}
                    className="text-xs px-4 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-full border border-white/5 transition"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
          <AnimatePresence>
            {messages.map((msg, i) => <Message key={i} msg={msg} isLast={i === messages.length - 1} />)}
          </AnimatePresence>
          {sending && (
            <motion.div 
              className="flex gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-sm">🤖</div>
              <div className="bg-gray-800 border border-white/5 rounded-2xl px-5 py-4 flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <motion.span 
                    key={i} 
                    className="w-2 h-2 bg-gray-500 rounded-full"
                    animate={{ y: [-3, 0, -3] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-5 py-5 border-t border-white/5 bg-gray-900/50 backdrop-blur-xl">
          <motion.div 
            className="flex items-end gap-3 bg-gray-800 border border-white/10 rounded-2xl px-5 py-4 focus-within:border-brand-500 focus-within:shadow-lg focus-within:shadow-brand-500/20 transition-all"
            whileFocus={{ scale: 1.01 }}
          >
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={`Ask ${activeModel?.label} anything...`}
              rows={1}
              className="flex-1 bg-transparent text-sm resize-none focus:outline-none max-h-40 overflow-y-auto placeholder:text-gray-500"
              style={{ minHeight: '24px' }}
            />
            <motion.button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              className="bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-700 hover:to-purple-700 disabled:opacity-30 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all flex-shrink-0 shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </motion.button>
          </motion.div>
          <p className="text-center text-xs text-gray-600 mt-3">
            Press <kbd className="px-2 py-0.5 bg-gray-800 rounded border border-white/10">Enter</kbd> to send · <kbd className="px-2 py-0.5 bg-gray-800 rounded border border-white/10">Shift+Enter</kbd> for new line
          </p>
        </div>
      </div>
    </div>
  )
}

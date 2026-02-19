import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api'

const MODELS = [
  { id: 'gpt-4o', label: 'GPT-4o', color: 'text-emerald-600', icon: '🟢', desc: 'Most capable' },
  { id: 'claude-3-5-sonnet', label: 'Claude 3.5', color: 'text-orange-600', icon: '🟠', desc: 'Best reasoning' },
  { id: 'grok-2', label: 'Grok 2', color: 'text-blue-600', icon: '🔵', desc: 'Real-time' },
]

const TOOLS = [
  { id: 'compare', icon: '🔍', label: 'Compare Mode', desc: 'Side-by-side answers' },
  { id: 'synthesis', icon: '🧠', label: 'Synthesis', desc: 'Combine outputs' },
  { id: 'debate', icon: '💬', label: 'Debate', desc: 'Models argue' },
  { id: 'analytics', icon: '📊', label: 'Analytics', desc: 'Usage stats' },
]

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div 
      className={`flex gap-2 md:gap-3 mb-4 md:mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {!isUser && (
        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs md:text-sm font-bold flex-shrink-0">
          AI
        </div>
      )}
      <div 
        className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-3 md:px-5 py-2.5 md:py-3 ${
          isUser 
            ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white' 
            : 'bg-white/80 backdrop-blur-sm text-gray-800 border border-gray-200'
        }`}
      >
        <p className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
        {msg.model && !isUser && (
          <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
            <span>{MODELS.find(m => m.id === msg.model)?.icon}</span>
            <span className="hidden sm:inline">{MODELS.find(m => m.id === msg.model)?.label}</span>
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white text-xs md:text-sm font-bold flex-shrink-0">
          {msg.user?.[0]?.toUpperCase() || 'Y'}
        </div>
      )}
    </motion.div>
  )
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [model, setModel] = useState(MODELS[0].id)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const bottomRef = useRef(null)

  // Open sidebar on desktop by default
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || sending) return
    const userMsg = { role: 'user', content: input.trim(), user: user?.email }
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
      setMessages(m => [...m, { role: 'assistant', content: '⚠️ ' + (err.response?.data?.message || 'Something went wrong.'), model }])
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

  const activeModel = MODELS.find(m => m.id === model)

  return (
    <div className="flex h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 overflow-hidden">
      {/* Holographic background effect */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,182,193,0.2)_50%,transparent_100%)]" />
      </div>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside 
            className="fixed md:relative z-50 w-64 h-full flex-shrink-0 bg-white/90 md:bg-white/60 backdrop-blur-2xl border-r border-gray-200/50 flex flex-col shadow-xl"
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 25 }}
          >
            {/* Logo */}
            <div className="p-6 border-b border-gray-200/50">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                PolyChat
              </h1>
            </div>

            {/* Menu */}
            <nav className="flex-1 p-4 space-y-2">
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg">
                <span className="text-lg">💬</span>
                <span className="font-medium text-sm">AI Chat</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-white/50 transition">
                <span className="text-lg">🎨</span>
                <span className="font-medium text-sm">Compare Mode</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-white/50 transition">
                <span className="text-lg">🧠</span>
                <span className="font-medium text-sm">Synthesis</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-white/50 transition">
                <span className="text-lg">💬</span>
                <span className="font-medium text-sm">Debate Mode</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-white/50 transition">
                <span className="text-lg">📊</span>
                <span className="font-medium text-sm">Analytics</span>
              </button>
            </nav>

            {/* User info & plan */}
            <div className="p-4 border-t border-gray-200/50 space-y-3">
              <div className="bg-white/50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Your Plan</p>
                <p className="text-sm font-semibold text-gray-700 mb-2">Free</p>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="font-medium">Quota:</span>
                  <span className="font-bold text-indigo-600">50 / 50</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 px-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                  {user?.email?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{user?.email}</p>
                </div>
              </div>
              
              <button 
                onClick={() => { logout(); navigate('/'); }}
                className="w-full text-xs text-gray-500 hover:text-red-500 transition py-2"
              >
                Sign out
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white/40 backdrop-blur-2xl border-b border-gray-200/50">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(s => !s)}
              className="p-2 hover:bg-white/60 rounded-lg transition"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h2 className="text-base md:text-lg font-semibold text-gray-800">PolyChat</h2>
              <p className="text-xs text-gray-500 hidden sm:block">Multi-Model AI Assistant</p>
            </div>
          </div>
          <button 
            onClick={() => setShowSettings(s => !s)}
            className="p-2 hover:bg-white/60 rounded-lg transition"
          >
            <span className="text-gray-600">⚙️</span>
          </button>
        </header>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-8">
          <div className="max-w-3xl mx-auto">
            {messages.length === 0 ? (
              <motion.div 
                className="flex flex-col items-center justify-center h-full text-center pt-10 md:pt-20 px-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h1 className="text-2xl md:text-4xl font-bold text-gray-700 mb-4">
                  How can I help you today?
                </h1>
                <p className="text-gray-500 text-xs md:text-sm mb-8">
                  Feel free to ask any questions or choose a model to start
                </p>
              </motion.div>
            ) : (
              <AnimatePresence>
                {messages.map((msg, i) => <Message key={i} msg={msg} />)}
              </AnimatePresence>
            )}
            
            {sending && (
              <motion.div 
                className="flex gap-3 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                  AI
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-5 py-4 border border-gray-200">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map(i => (
                      <motion.span 
                        key={i} 
                        className="w-2 h-2 bg-indigo-400 rounded-full"
                        animate={{ y: [-3, 0, -3] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="px-4 md:px-6 pb-4 md:pb-6">
          <div className="max-w-3xl mx-auto space-y-3 md:space-y-4">
            {/* Model & Tools */}
            <div className="flex items-center gap-2 md:gap-3 justify-center flex-wrap">
              {/* Model selector */}
              <div className="relative">
                <select
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  className="appearance-none bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl px-3 md:px-4 py-2 md:py-2.5 pr-8 md:pr-10 text-xs md:text-sm font-medium text-gray-700 hover:bg-white transition cursor-pointer shadow-sm"
                >
                  {MODELS.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.icon} {m.label}
                    </option>
                  ))}
                </select>
                <span className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">
                  ▼
                </span>
              </div>

              {/* Tool buttons - hide labels on mobile */}
              {TOOLS.slice(0, 3).map(tool => (
                <motion.button
                  key={tool.id}
                  className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-white/60 backdrop-blur-sm hover:bg-white border border-gray-200 rounded-xl text-xs md:text-sm font-medium text-gray-600 transition shadow-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  title={tool.label}
                >
                  <span>{tool.icon}</span>
                  <span className="hidden md:inline">{tool.label}</span>
                </motion.button>
              ))}
              
              <button className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-white/60 backdrop-blur-sm hover:bg-white border border-gray-200 rounded-xl text-xs md:text-sm font-medium text-gray-600 transition shadow-sm">
                <span>⚡</span>
                <span className="hidden md:inline">More Tools</span>
              </button>
            </div>

            {/* Input box */}
            <div className="relative">
              <div className="flex items-center gap-2 md:gap-3 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-2xl px-3 md:px-5 py-3 md:py-4 shadow-lg hover:shadow-xl transition-shadow focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-200">
                <button className="text-gray-400 hover:text-gray-600 transition hidden sm:block">
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder={`Ask ${activeModel?.label}...`}
                  className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
                />
                
                <button className="text-gray-400 hover:text-gray-600 transition hidden sm:block">
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
                
                <motion.button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-40 text-white p-2.5 md:p-3 rounded-xl transition shadow-md disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

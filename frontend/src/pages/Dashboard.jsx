import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api'

const MODELS = [
  { id: 'gpt-4o', label: 'GPT-4o', color: 'text-green-400', icon: '🟢', desc: 'Most capable' },
  { id: 'claude-3-5-sonnet', label: 'Claude 3.5', color: 'text-orange-400', icon: '🟠', desc: 'Best reasoning' },
  { id: 'grok-2', label: 'Grok 2', color: 'text-blue-400', icon: '🔵', desc: 'Real-time' },
]

function Message({ msg }) {
  const isUser = msg.role === 'user'
  const isComparison = msg.role === 'comparison'
  
  if (isComparison) {
    return (
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-xs text-gray-500 mb-2">Compare Mode Results:</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {msg.results.map((result, i) => {
            const model = MODELS.find(m => m.id === result.model)
            return (
              <motion.div
                key={i}
                className="bg-gray-800 border border-white/10 rounded-xl p-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{model?.icon}</span>
                    <span className={`font-semibold text-sm ${model?.color}`}>
                      {model?.label}
                    </span>
                  </div>
                  {result.error && (
                    <span className="text-xs text-red-400">Error</span>
                  )}
                </div>
                
                {result.error ? (
                  <p className="text-xs text-red-400">{result.error}</p>
                ) : (
                  <>
                    <p className="text-xs text-gray-300 leading-relaxed mb-3 whitespace-pre-wrap">
                      {result.content}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 pt-3 border-t border-white/5">
                      <span>🪙 {result.tokens} tokens</span>
                      <span>⚡ {result.responseTime}ms</span>
                    </div>
                  </>
                )}
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    )
  }
  
  return (
    <motion.div 
      className={`flex gap-2 md:gap-3 mb-4 md:mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {!isUser && (
        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-brand-600 to-purple-600 flex items-center justify-center text-white text-xs md:text-sm font-bold flex-shrink-0">
          AI
        </div>
      )}
      <div 
        className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-3 md:px-5 py-2.5 md:py-3 ${
          isUser 
            ? 'bg-gradient-to-br from-brand-600 to-purple-600 text-white' 
            : 'bg-gray-800 text-gray-100 border border-white/5'
        }`}
      >
        <p className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
        {msg.model && !isUser && (
          <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <span>{MODELS.find(m => m.id === msg.model)?.icon}</span>
            <span className="hidden sm:inline">{MODELS.find(m => m.id === msg.model)?.label}</span>
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-brand-600 to-purple-600 flex items-center justify-center text-white text-xs md:text-sm font-bold flex-shrink-0">
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
  const [compareMode, setCompareMode] = useState(false)
  const [selectedModels, setSelectedModels] = useState([MODELS[0].id, MODELS[1].id])
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
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

  const toggleModel = (modelId) => {
    if (selectedModels.includes(modelId)) {
      if (selectedModels.length > 1) {
        setSelectedModels(selectedModels.filter(m => m !== modelId))
      }
    } else {
      setSelectedModels([...selectedModels, modelId])
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || sending) return
    const userMsg = { role: 'user', content: input.trim(), user: user?.email }
    setMessages(m => [...m, userMsg])
    setInput('')
    setSending(true)
    
    try {
      if (compareMode) {
        // Compare mode - send to multiple models
        const { data } = await api.post('/compare', {
          models: selectedModels,
          messages: [...messages, userMsg],
        })
        setMessages(m => [...m, { role: 'comparison', results: data.results }])
      } else {
        // Single model mode
        const { data } = await api.post('/chat', {
          model,
          messages: [...messages, userMsg],
        })
        setMessages(m => [...m, { role: 'assistant', content: data.content, model: data.model }])
      }
    } catch (err) {
      setMessages(m => [...m, { 
        role: 'assistant', 
        content: '⚠️ ' + (err.response?.data?.message || 'Something went wrong.'), 
        model 
      }])
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
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-20 left-10 w-96 h-96 bg-brand-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
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
            className="fixed md:relative z-50 w-64 h-full flex-shrink-0 bg-gray-900/90 md:bg-gray-900/80 backdrop-blur-2xl border-r border-white/5 flex flex-col shadow-xl"
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 25 }}
          >
            <div className="p-6 border-b border-white/5">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
                PolyChat
              </h1>
            </div>

            {/* Compare Mode Toggle */}
            <div className="p-4 border-b border-white/5">
              <motion.button
                onClick={() => setCompareMode(!compareMode)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition ${
                  compareMode 
                    ? 'bg-gradient-to-r from-brand-600 to-purple-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔍</span>
                  <span className="text-sm font-medium">Compare Mode</span>
                </div>
                <div className={`w-10 h-6 rounded-full transition ${compareMode ? 'bg-white/20' : 'bg-gray-700'} relative`}>
                  <motion.div
                    className="w-4 h-4 bg-white rounded-full absolute top-1"
                    animate={{ x: compareMode ? 20 : 4 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </div>
              </motion.button>
            </div>

            {/* Model Selection */}
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-xs text-gray-500 mb-3 px-1 uppercase tracking-wider">
                {compareMode ? 'Select Models' : 'Select Model'}
              </p>
              <div className="space-y-2">
                {MODELS.map(m => {
                  const isSelected = compareMode 
                    ? selectedModels.includes(m.id)
                    : model === m.id
                  
                  return (
                    <motion.button
                      key={m.id}
                      onClick={() => compareMode ? toggleModel(m.id) : setModel(m.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
                        isSelected
                          ? 'bg-gray-800 text-white border border-white/10' 
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
                      {isSelected && (
                        <motion.div 
                          layoutId={compareMode ? undefined : "activeSidebar"}
                          className={`w-2 h-2 rounded-full ${compareMode ? 'bg-green-400' : 'bg-brand-500'}`}
                        />
                      )}
                    </motion.button>
                  )
                })}
              </div>
              
              {compareMode && (
                <motion.div 
                  className="mt-3 text-xs text-gray-500 px-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {selectedModels.length} model{selectedModels.length !== 1 ? 's' : ''} selected
                </motion.div>
              )}
            </div>

            {/* User info */}
            <div className="p-4 border-t border-white/5 space-y-3">
              <div className="bg-gray-800/50 rounded-xl p-4 border border-white/5">
                <p className="text-xs text-gray-500 mb-1">Your Plan</p>
                <p className="text-sm font-semibold text-white mb-2">Free</p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="font-medium">Quota:</span>
                  <span className="font-bold text-brand-400">50 / 50</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 px-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                  {user?.email?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                </div>
              </div>
              
              <button 
                onClick={() => { logout(); navigate('/'); }}
                className="w-full text-xs text-gray-400 hover:text-red-400 transition py-2"
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
        <header className="flex items-center justify-between px-6 py-4 bg-gray-900/50 backdrop-blur-2xl border-b border-white/5">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(s => !s)}
              className="p-2 hover:bg-gray-800 rounded-lg transition"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h2 className="text-base md:text-lg font-semibold text-white flex items-center gap-2">
                {compareMode ? (
                  <>
                    🔍 Compare Mode
                    <span className="text-xs text-gray-400">({selectedModels.length} models)</span>
                  </>
                ) : (
                  <>
                    {activeModel?.icon} {activeModel?.label}
                  </>
                )}
              </h2>
              <p className="text-xs text-gray-400 hidden sm:block">
                {compareMode ? 'Send to multiple models at once' : 'Single model chat'}
              </p>
            </div>
          </div>
        </header>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-8">
          <div className="max-w-6xl mx-auto">
            {messages.length === 0 ? (
              <motion.div 
                className="flex flex-col items-center justify-center h-full text-center pt-10 md:pt-20 px-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <motion.div 
                  className="text-5xl md:text-6xl mb-6"
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
                  {compareMode ? '🔍' : '🤖'}
                </motion.div>
                <h1 className="text-2xl md:text-4xl font-bold text-white mb-4">
                  {compareMode ? 'Compare Multiple Models' : 'How can I help you today?'}
                </h1>
                <p className="text-gray-400 text-xs md:text-sm mb-8">
                  {compareMode 
                    ? `Send your prompt to ${selectedModels.length} models and see responses side-by-side`
                    : 'Select a model and ask anything'
                  }
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
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                  AI
                </div>
                <div className="bg-gray-800 backdrop-blur-sm rounded-2xl px-5 py-4 border border-white/5">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map(i => (
                      <motion.span 
                        key={i} 
                        className="w-2 h-2 bg-brand-400 rounded-full"
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
          <div className="max-w-6xl mx-auto">
            <div className="relative">
              <div className="flex items-center gap-2 md:gap-3 bg-gray-800 backdrop-blur-sm border border-white/10 rounded-2xl px-3 md:px-5 py-3 md:py-4 shadow-lg hover:shadow-xl transition-shadow focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder={compareMode ? `Compare ${selectedModels.length} models...` : `Ask ${activeModel?.label}...`}
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none"
                />
                
                <motion.button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-700 hover:to-purple-700 disabled:opacity-40 text-white p-2.5 md:p-3 rounded-xl transition shadow-md disabled:cursor-not-allowed"
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

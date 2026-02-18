import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const MODELS = [
  { id: 'gpt-4o', label: 'GPT-4o', color: 'text-green-400', icon: '🟢' },
  { id: 'claude-3-5-sonnet', label: 'Claude 3.5', color: 'text-orange-400', icon: '🟠' },
  { id: 'grok-2', label: 'Grok 2', color: 'text-blue-400', icon: '🔵' },
]

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`msg-enter flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isUser ? 'bg-brand-600' : 'bg-gray-700'}`}>
        {isUser ? 'Y' : '🤖'}
      </div>
      <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${isUser ? 'bg-brand-600 text-white' : 'bg-gray-800 text-gray-100'}`}>
        {msg.content}
        {msg.model && <div className="text-xs opacity-50 mt-1">{msg.model}</div>}
      </div>
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
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} flex-shrink-0 transition-all duration-300 overflow-hidden bg-gray-900 border-r border-white/5 flex flex-col`}>
        <div className="p-4 border-b border-white/5">
          <span className="font-bold text-brand-500 text-lg">PolyChat</span>
        </div>

        <div className="p-3">
          <button
            onClick={() => setMessages([])}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium py-2 rounded-lg transition"
          >
            + New Chat
          </button>
        </div>

        {/* Model Selector */}
        <div className="px-3 py-2">
          <p className="text-xs text-gray-500 mb-2 px-1">MODEL</p>
          {MODELS.map(m => (
            <button
              key={m.id}
              onClick={() => setModel(m.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition mb-1 ${model === m.id ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
            >
              <span>{m.icon}</span>
              <span>{m.label}</span>
              {model === m.id && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500" />}
            </button>
          ))}
        </div>

        <div className="mt-auto p-4 border-t border-white/5">
          <div className="text-xs text-gray-500 mb-2 truncate">{user?.email}</div>
          <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-red-400 transition">
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-gray-900/50">
          <button onClick={() => setSidebarOpen(s => !s)} className="text-gray-400 hover:text-white transition p-1">
            ☰
          </button>
          <span className={`text-sm font-medium ${activeModel?.color}`}>{activeModel?.label}</span>
          <span className="text-gray-600 text-xs ml-auto">Free tier · 50 msg/mo</span>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-4xl mb-4">🤖</div>
              <h2 className="text-xl font-semibold mb-2">Start a conversation</h2>
              <p className="text-gray-400 text-sm max-w-sm">
                Select a model from the sidebar and ask anything. Switch models mid-conversation to compare answers.
              </p>
            </div>
          )}
          {messages.map((msg, i) => <Message key={i} msg={msg} />)}
          {sending && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs">🤖</div>
              <div className="bg-gray-800 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <span key={i} className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-4 border-t border-white/5 bg-gray-900/50">
          <div className="flex items-end gap-3 bg-gray-800 border border-white/10 rounded-2xl px-4 py-3 focus-within:border-brand-500 transition">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={`Message ${activeModel?.label}...`}
              rows={1}
              className="flex-1 bg-transparent text-sm resize-none focus:outline-none max-h-40 overflow-y-auto"
              style={{ minHeight: '24px' }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              className="bg-brand-600 hover:bg-brand-700 disabled:opacity-30 text-white p-2 rounded-xl transition flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="text-center text-xs text-gray-600 mt-2">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  )
}

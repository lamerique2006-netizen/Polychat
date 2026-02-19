import { Router } from 'express'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { requireAuth } from '../middleware/auth.js'
import { supabase } from '../db.js'
import { estimateCost } from '../utils/pricing.js'

const router = Router()

const PLAN_LIMITS = { free: 50, pro: 5000, enterprise: Infinity }

const MODEL_MAP = {
  'gpt-4o':            { provider: 'openai',    model: 'gpt-4o' },
  'gpt-3-5-turbo':     { provider: 'openai',    model: 'gpt-3.5-turbo' },
  'claude-3-5-sonnet': { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022' },
  'claude-instant':    { provider: 'anthropic', model: 'claude-instant-1.2' },
  'grok-2':            { provider: 'xai',       model: 'grok-2-latest' },
}

async function callOpenAI(messages, model) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const res = await client.chat.completions.create({ model, messages, max_tokens: 1024 })
  return {
    content: res.choices[0].message.content,
    tokens: res.usage?.total_tokens || 0,
  }
}

async function callAnthropic(messages, model) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const res = await client.messages.create({ model, max_tokens: 1024, messages })
  return {
    content: res.content[0].text,
    tokens: res.usage?.input_tokens + res.usage?.output_tokens || 0,
  }
}

async function callXAI(messages, model) {
  const client = new OpenAI({
    apiKey: process.env.XAI_API_KEY,
    baseURL: 'https://api.x.ai/v1',
  })
  const res = await client.chat.completions.create({ model, messages, max_tokens: 1024 })
  return {
    content: res.choices[0].message.content,
    tokens: res.usage?.total_tokens || 0,
  }
}

// POST /api/chat
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { model: modelId, messages, conversationId } = req.body
    if (!modelId || !messages?.length) {
      return res.status(400).json({ message: 'model and messages are required' })
    }

    const modelConfig = MODEL_MAP[modelId]
    if (!modelConfig) return res.status(400).json({ message: `Unknown model: ${modelId}` })

    // Check usage limit
    const { data: user, error } = await supabase
      .from('users')
      .select('plan, msg_count, msg_reset')
      .eq('id', req.user.id)
      .single()
    
    if (error) throw error

    // Reset monthly count if needed
    const resetDate = new Date(user.msg_reset)
    const now = new Date()
    if (now.getFullYear() !== resetDate.getFullYear() || now.getMonth() !== resetDate.getMonth()) {
      await supabase
        .from('users')
        .update({ msg_count: 0, msg_reset: now.toISOString() })
        .eq('id', req.user.id)
      user.msg_count = 0
    }

    const limit = PLAN_LIMITS[user.plan] || 50
    if (user.msg_count >= limit) {
      return res.status(429).json({ message: `Monthly limit reached (${limit} messages). Upgrade to Pro for more.` })
    }

    // Call the right provider
    let result
    if (modelConfig.provider === 'openai') result = await callOpenAI(messages, modelConfig.model)
    else if (modelConfig.provider === 'anthropic') result = await callAnthropic(messages, modelConfig.model)
    else if (modelConfig.provider === 'xai') result = await callXAI(messages, modelConfig.model)
    else return res.status(400).json({ message: 'Unknown provider' })

    // Save to DB + increment counter
    await supabase.from('messages').insert({
      user_id: req.user.id,
      conversation_id: conversationId || null,
      role: 'assistant',
      content: result.content,
      model: modelId,
      tokens: result.tokens
    })
    
    await supabase
      .from('users')
      .update({ msg_count: user.msg_count + 1 })
      .eq('id', req.user.id)

    const cost = estimateCost(modelId, result.tokens)
    res.json({ content: result.content, model: modelId, tokens: result.tokens, cost })
  } catch (err) { next(err) }
})

export default router

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

async function callModel(messages, modelId, modelConfig) {
  const startTime = Date.now()
  let result

  try {
    if (modelConfig.provider === 'openai') {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      const res = await client.chat.completions.create({
        model: modelConfig.model,
        messages,
        max_tokens: 1024,
      })
      result = {
        content: res.choices[0].message.content,
        tokens: res.usage?.total_tokens || 0,
      }
    } else if (modelConfig.provider === 'anthropic') {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      const res = await client.messages.create({
        model: modelConfig.model,
        max_tokens: 1024,
        messages,
      })
      result = {
        content: res.content[0].text,
        tokens: res.usage?.input_tokens + res.usage?.output_tokens || 0,
      }
    } else if (modelConfig.provider === 'xai') {
      const client = new OpenAI({
        apiKey: process.env.XAI_API_KEY,
        baseURL: 'https://api.x.ai/v1',
      })
      const res = await client.chat.completions.create({
        model: modelConfig.model,
        messages,
        max_tokens: 1024,
      })
      result = {
        content: res.choices[0].message.content,
        tokens: res.usage?.total_tokens || 0,
      }
    } else {
      throw new Error('Unknown provider')
    }

    const responseTime = Date.now() - startTime
    const cost = estimateCost(modelId, result.tokens)

    return {
      model: modelId,
      content: result.content,
      tokens: result.tokens,
      cost,
      responseTime,
      error: null,
    }
  } catch (error) {
    return {
      model: modelId,
      content: null,
      tokens: 0,
      responseTime: Date.now() - startTime,
      error: error.message || 'Failed to get response',
    }
  }
}

// POST /api/compare
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { models, messages, conversationId } = req.body
    
    if (!models?.length || !messages?.length) {
      return res.status(400).json({ message: 'models and messages are required' })
    }

    if (models.length < 2) {
      return res.status(400).json({ message: 'Compare mode requires at least 2 models' })
    }

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
    
    // Check if user has enough quota (each model counts as 1 message)
    if (user.msg_count + models.length > limit) {
      return res.status(429).json({ 
        message: `Not enough quota. Need ${models.length} messages, have ${limit - user.msg_count} remaining.` 
      })
    }

    // Validate all models exist
    const modelConfigs = models.map(m => {
      const config = MODEL_MAP[m]
      if (!config) throw new Error(`Unknown model: ${m}`)
      return { id: m, config }
    })

    // Call all models in parallel
    const results = await Promise.all(
      modelConfigs.map(({ id, config }) => callModel(messages, id, config))
    )

    // Save all responses to DB
    for (const result of results) {
      if (!result.error) {
        await supabase.from('messages').insert({
          user_id: req.user.id,
          conversation_id: conversationId || null,
          role: 'assistant',
          content: result.content,
          model: result.model,
          tokens: result.tokens
        })
      }
    }

    // Increment message count
    await supabase
      .from('users')
      .update({ msg_count: user.msg_count + models.length })
      .eq('id', req.user.id)

    res.json({ results })
  } catch (err) { next(err) }
})

export default router

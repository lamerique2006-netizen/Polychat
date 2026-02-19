import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { supabase } from '../db.js'

const router = Router()

// GET /api/conversations - List user's conversations
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('id, title, created_at')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (error) throw error

    // Get message count for each conversation
    const conversationsWithCounts = await Promise.all(
      conversations.map(async (conv) => {
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
        
        return { ...conv, messageCount: count || 0 }
      })
    )

    res.json(conversationsWithCounts)
  } catch (err) { next(err) }
})

// POST /api/conversations - Create new conversation
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { title } = req.body
    
    const { data: conversation, error } = await supabase
      .from('conversations')
      .insert({
        user_id: req.user.id,
        title: title || 'New Chat'
      })
      .select()
      .single()
    
    if (error) throw error

    res.status(201).json(conversation)
  } catch (err) { next(err) }
})

// GET /api/conversations/:id/messages - Get conversation messages
router.get('/:id/messages', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params

    // Verify ownership
    const { data: conversation } = await supabase
      .from('conversations')
      .select('user_id')
      .eq('id', id)
      .single()
    
    if (!conversation || conversation.user_id !== req.user.id) {
      return res.status(404).json({ message: 'Conversation not found' })
    }

    const { data: messages, error } = await supabase
      .from('messages')
      .select('id, role, content, model, tokens, created_at')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true })
    
    if (error) throw error

    res.json(messages)
  } catch (err) { next(err) }
})

// PATCH /api/conversations/:id - Update conversation title
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params
    const { title } = req.body

    if (!title) {
      return res.status(400).json({ message: 'Title is required' })
    }

    // Verify ownership
    const { data: conversation } = await supabase
      .from('conversations')
      .select('user_id')
      .eq('id', id)
      .single()
    
    if (!conversation || conversation.user_id !== req.user.id) {
      return res.status(404).json({ message: 'Conversation not found' })
    }

    const { data: updated, error } = await supabase
      .from('conversations')
      .update({ title })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error

    res.json(updated)
  } catch (err) { next(err) }
})

// DELETE /api/conversations/:id - Delete conversation
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params

    // Verify ownership
    const { data: conversation } = await supabase
      .from('conversations')
      .select('user_id')
      .eq('id', id)
      .single()
    
    if (!conversation || conversation.user_id !== req.user.id) {
      return res.status(404).json({ message: 'Conversation not found' })
    }

    // Delete messages first (CASCADE should handle this, but being explicit)
    await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', id)

    // Delete conversation
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id)
    
    if (error) throw error

    res.json({ success: true })
  } catch (err) { next(err) }
})

export default router

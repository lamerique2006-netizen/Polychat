import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null

export async function initDb() {
  // Check if tables exist
  const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true })
  
  if (error?.code === '42P01') {
    console.log('⚠️  Tables not found. Run POST /setup to create them.')
    console.log('   You need SUPABASE_SERVICE_KEY in your env vars.')
    return
  }
  
  console.log('✓ Supabase connection verified')
}

export async function createTables() {
  if (!supabaseAdmin) {
    throw new Error('SUPABASE_SERVICE_KEY required to create tables')
  }

  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      plan TEXT DEFAULT 'free',
      msg_count INTEGER DEFAULT 0,
      msg_reset TIMESTAMP DEFAULT NOW(),
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      model TEXT,
      tokens INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title TEXT DEFAULT 'New Chat',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `

  // Execute via REST API (requires service role key)
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`
    },
    body: JSON.stringify({ query: sql })
  })

  if (!response.ok) {
    // Fallback: log SQL for manual execution
    console.log('⚠️  Auto-create failed. Run this SQL in Supabase SQL Editor:')
    console.log(sql)
    throw new Error('Table creation failed. See console for SQL.')
  }

  console.log('✓ Tables created successfully')
}

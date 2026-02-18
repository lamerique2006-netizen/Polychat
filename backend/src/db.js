import pg from 'pg'

const { Pool } = pg

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id          SERIAL PRIMARY KEY,
      email       TEXT UNIQUE NOT NULL,
      password    TEXT NOT NULL,
      plan        TEXT DEFAULT 'free',
      msg_count   INTEGER DEFAULT 0,
      msg_reset   TIMESTAMP DEFAULT NOW(),
      created_at  TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS messages (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
      role       TEXT NOT NULL,
      content    TEXT NOT NULL,
      model      TEXT,
      tokens     INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title      TEXT DEFAULT 'New Chat',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `)
  console.log('Database initialized ✓')
}

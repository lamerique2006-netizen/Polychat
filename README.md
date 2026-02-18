# PolyChat 🤖

Multi-model AI chat platform. Talk to GPT-4, Claude, and Grok — all in one place.

## Stack

- **Frontend:** React 18 + Vite + Tailwind CSS + Framer Motion
- **Backend:** Node.js + Express (coming next)
- **Database:** Supabase (PostgreSQL)
- **Auth:** JWT
- **Deploy:** Vercel (frontend) + Render (backend)

## Getting Started

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Set VITE_API_URL to your backend URL
npm run dev
```

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

## Environment Variables

### Frontend (`frontend/.env.local`)

```
VITE_API_URL=https://your-backend.onrender.com
```

### Backend (`backend/.env`)

```
PORT=5000
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
XAI_API_KEY=xai-...
STRIPE_SECRET_KEY=sk_...
ADMIN_PASSWORD=your-admin-password
```

## Roadmap

- [x] Frontend scaffold (Landing, Auth, Dashboard, Pricing)
- [ ] Backend API (auth, chat, usage tracking)
- [ ] Supabase database setup
- [ ] OpenAI + Anthropic + Grok integration
- [ ] Stripe subscriptions
- [ ] Compare Mode (side-by-side)
- [ ] Synthesis Engine

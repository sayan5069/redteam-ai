# ⚔ RedTeam AI — LLM Red-Teaming Assistant

**[🔴 Live Demo Available Here](https://your-vercel-link-here.vercel.app)**

A production-grade visual platform for testing AI systems against adversarial attacks. Built for students, researchers, and AI builders who need to identify vulnerabilities in their LLM-powered applications.

RedTeam AI uses advanced AI models to generate realistic adversarial attack prompts based on the **MITRE ATLAS** framework and **OWASP Top 10 for LLMs (2025)**.

---

## Features

- **Adversarial Analysis** — Paste any system prompt and generate 5 targeted attack vectors instantly
- **AI Target Auto-Generation** — Type a topic (e.g., "Banking Bot") and let the LLM auto-generate a realistic, highly-vulnerable target system prompt to test against
- **Multiple AI Models** — Select between different attacker models (simulating Claude Opus, Sonnet, Gemini)
- **Risk Visualization** — Interactive bar charts (risk distribution) and pie charts (category coverage)
- **Session History & Export** — Review past analyses and download JSON reports for compliance 
- **Premium UI/UX** — Sophisticated "Obsidian & Ruby" glassmorphism design system with backdrop blurs, animated attack cards, and minimalist SVG iconography

---

## Tech Stack

| Layer       | Technology                              |
|-------------|----------------------------------------|
| Frontend    | React, Vite, Tailwind CSS, Recharts    |
| Backend     | Python, FastAPI, Pydantic              |
| Database    | Supabase (PostgreSQL)                  |
| Auth        | Supabase Auth + JWT (httpOnly cookies) |
| AI Models   | Antigravity API (OpenAI-compatible)    |
| Deployment  | Vercel (frontend) + Render (backend)   |

---

## Project Structure

```
redteam-ai/
├── backend/
│   ├── main.py              # FastAPI app, routes, CORS
│   ├── auth.py              # Signup/login, JWT handling
│   ├── database.py          # Supabase client + DB helpers
│   ├── redteam.py           # AI API calls + response parsing
│   ├── models.py            # Pydantic request/response models
│   ├── rate_limiter.py      # 10 runs/user/hour limiter
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/client.js    # Axios API client
│   │   ├── context/         # Auth context
│   │   ├── components/      # 11 React components
│   │   └── pages/           # 4 page components
│   ├── package.json
│   └── .env.example
├── database/
│   └── migration.sql        # Supabase tables + RLS
└── README.md
```

---

## Setup

### Prerequisites

- Node.js 18+
- Python 3.10+
- Supabase project (free tier works)
- Antigravity API key

### 1. Database Setup

1. Create a new project on [Supabase](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `database/migration.sql`
3. Note your **Project URL** and **Service Role Key** from Settings → API

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your actual keys

# Start development server
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your backend URL

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Environment Variables

### Backend (`.env`)

| Variable              | Description                     |
|----------------------|--------------------------------|
| `ANTIGRAVITY_API_KEY` | Your Antigravity API key        |
| `ANTIGRAVITY_BASE_URL`| `https://api.antigravity.ai/v1` |
| `SUPABASE_URL`        | Supabase project URL            |
| `SUPABASE_SERVICE_KEY`| Supabase service role key       |
| `JWT_SECRET`          | Random string (min 32 chars)    |
| `ALLOWED_ORIGIN`      | Frontend URL for CORS           |

### Frontend (`.env`)

| Variable            | Description          |
|---------------------|---------------------|
| `VITE_API_BASE_URL` | Backend API URL      |

---

## API Documentation

### Auth Routes

| Method | Endpoint        | Body                       | Response          |
|--------|----------------|---------------------------|-------------------|
| POST   | `/auth/signup`  | `{email, password}`       | `{message, email}`|
| POST   | `/auth/login`   | `{email, password}`       | `{message, email}` + httpOnly cookie |
| POST   | `/auth/logout`  | —                         | `{message}`       |

### Red Team Routes (Protected)

| Method | Endpoint                  | Body / Params                            | Response              |
|--------|--------------------------|------------------------------------------|-----------------------|
| POST   | `/redteam/run`           | `{target_system_prompt, attack_category, intensity, model}` | `{session_id, attacks[], ...}` |
| GET    | `/redteam/history`       | —                                        | `SessionSummary[]`    |
| GET    | `/redteam/session/:id`   | —                                        | `SessionDetail`       |
| DELETE | `/redteam/session/:id`   | —                                        | `{message}`           |
| GET    | `/redteam/generate-target`| `?topic=string` (optional)              | `{prompt}`            |

### Rate Limiting

- Maximum **10 red team runs per user per hour**
- Returns `429 Too Many Requests` with retry time when exceeded

---

## Deployment

### Frontend → Vercel

1. Push `frontend/` to GitHub
2. Import in Vercel, set root directory to `frontend`
3. Add env var: `VITE_API_BASE_URL=https://your-backend.onrender.com`
4. Deploy

### Backend → Render

1. Push `backend/` to GitHub
2. Create a new Web Service on Render
3. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add all env vars from `.env.example`
5. Update `ALLOWED_ORIGIN` to your Vercel URL
6. Deploy

---

## Security

- API keys stored server-side only (never in frontend)
- JWT tokens in httpOnly, secure, SameSite cookies
- CORS restricted to frontend domain
- Rate limiting on computationally expensive endpoints
- Input sanitization via Bleach
- Row Level Security (RLS) on all Supabase tables

---

## References

- [MITRE ATLAS](https://atlas.mitre.org/) — Adversarial Threat Landscape for AI Systems
- [OWASP Top 10 for LLMs (2025)](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
- [Antigravity API](https://api.antigravity.ai)

---

## License

MIT

-- ============================================================
-- RedTeam AI — Supabase Database Migration
-- Run this SQL in your Supabase SQL Editor
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Users table ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email       TEXT UNIQUE NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ── Sessions table ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS sessions (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_system_prompt  TEXT NOT NULL,
    attack_category       TEXT NOT NULL,
    intensity             TEXT NOT NULL,
    model_used            TEXT NOT NULL,
    created_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at DESC);

-- ── Attacks table ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS attacks (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id    UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    technique     TEXT NOT NULL,
    category      TEXT NOT NULL,
    risk          TEXT NOT NULL CHECK (risk IN ('HIGH', 'MEDIUM', 'LOW')),
    attack_prompt TEXT NOT NULL,
    goal          TEXT NOT NULL,
    mitigation    TEXT NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attacks_session_id ON attacks(session_id);
CREATE INDEX IF NOT EXISTS idx_attacks_risk ON attacks(risk);

-- ── Row Level Security (RLS) ────────────────────────────

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attacks ENABLE ROW LEVEL SECURITY;

-- Users can only read their own record
CREATE POLICY "Users can view own record"
    ON users FOR SELECT
    USING (auth.uid() = id);

-- Users can only access their own sessions
CREATE POLICY "Users can view own sessions"
    ON sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
    ON sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
    ON sessions FOR DELETE
    USING (auth.uid() = user_id);

-- Users can access attacks belonging to their sessions
CREATE POLICY "Users can view attacks for own sessions"
    ON attacks FOR SELECT
    USING (
        session_id IN (
            SELECT id FROM sessions WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert attacks for own sessions"
    ON attacks FOR INSERT
    WITH CHECK (
        session_id IN (
            SELECT id FROM sessions WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete attacks for own sessions"
    ON attacks FOR DELETE
    USING (
        session_id IN (
            SELECT id FROM sessions WHERE user_id = auth.uid()
        )
    );

-- ── Service role bypass (for backend) ───────────────────
-- Note: The service role key used by the backend automatically
-- bypasses RLS. The policies above apply to client-side access.

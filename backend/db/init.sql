-- LLM-GOAT Database Schema

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    challenge_id VARCHAR(100) NOT NULL,
    flag_type VARCHAR(100) NOT NULL,
    flag_value TEXT NOT NULL,
    points_earned INT DEFAULT 0,
    captured_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, challenge_id, flag_type)
);

CREATE TABLE IF NOT EXISTS challenge_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    challenge_id VARCHAR(100) NOT NULL,
    session_key VARCHAR(200) NOT NULL,
    tokens_used INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    challenge_id VARCHAR(100),
    event_type VARCHAR(50),
    details JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_progress_user ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);

-- Default users (passwords are bcrypt hashed)
INSERT INTO users (username, password_hash, role) VALUES
    ('admin', '$2b$12$placeholder_admin_hash', 'admin'),
    ('player', '$2b$12$placeholder_player_hash', 'user')
ON CONFLICT (username) DO NOTHING;

-- Aetheria Cloudflare D1 Production Schema
-- Safe, Normalized, High-Speed Edge Database

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    salt TEXT,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT DEFAULT 'user', -- 'user', 'creator', 'admin'
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. OAuth Social Logins (Google, Microsoft)
CREATE TABLE IF NOT EXISTS oauth_accounts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    provider TEXT NOT NULL, -- 'google', 'microsoft'
    provider_user_id TEXT NOT NULL,
    email TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(provider, provider_user_id)
);

CREATE INDEX IF NOT EXISTS idx_oauth_user ON oauth_accounts(user_id);

-- 3. Sessions & Auth Tokens
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token_hash TEXT UNIQUE NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- 4. Password Reset Requests
CREATE TABLE IF NOT EXISTS password_resets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    reset_code TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    used INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_resets_user ON password_resets(user_id);

-- 5. Star Wallets (Micro-Economy)
CREATE TABLE IF NOT EXISTS wallets (
    user_id TEXT PRIMARY KEY,
    stars_balance INTEGER DEFAULT 10, -- 10 Free Stars on signup!
    creator_earnings INTEGER DEFAULT 0, -- Earnings from selling/tipping
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Cloud Chat Sessions (Persistent across Clear Cache)
CREATE TABLE IF NOT EXISTS cloud_chats (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    character_id TEXT NOT NULL,
    title TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_chats_user ON cloud_chats(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_updated ON cloud_chats(updated_at DESC);

-- 7. Cloud Chat Messages (Full Story History)
CREATE TABLE IF NOT EXISTS cloud_messages (
    id TEXT PRIMARY KEY,
    chat_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL, -- 'user', 'assistant', 'system'
    text TEXT NOT NULL,
    media_type TEXT, -- 'image', 'video', 'audio', null
    media_url TEXT,
    branch_id TEXT DEFAULT 'main',
    created_at INTEGER NOT NULL,
    FOREIGN KEY (chat_id) REFERENCES cloud_chats(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_messages_chat ON cloud_messages(chat_id, created_at ASC);

-- 8. Community Characters & Marketplace Cards
CREATE TABLE IF NOT EXISTS community_characters (
    id TEXT PRIMARY KEY,
    creator_id TEXT NOT NULL,
    name TEXT NOT NULL,
    tagline TEXT,
    description TEXT,
    greeting TEXT,
    system_prompt TEXT,
    category TEXT DEFAULT 'Anime',
    avatar_url TEXT,
    price_stars INTEGER DEFAULT 0, -- 0 = Free, > 0 = Premium
    rating REAL DEFAULT 5.0,
    total_chats INTEGER DEFAULT 0,
    total_stars_earned INTEGER DEFAULT 0,
    is_published INTEGER DEFAULT 1,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_comm_chars_rating ON community_characters(rating DESC);
CREATE INDEX IF NOT EXISTS idx_comm_chars_stars ON community_characters(total_stars_earned DESC);

-- 9. Financial Ledger & Star Transactions
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    from_user_id TEXT, -- NULL if system gift or platform reward
    to_user_id TEXT,   -- NULL if spent on platform feature
    character_id TEXT,
    amount_stars INTEGER NOT NULL,
    platform_fee_stars INTEGER DEFAULT 0,
    creator_share_stars INTEGER DEFAULT 0,
    type TEXT NOT NULL, -- 'signup_bonus', 'tip', 'unlock_card', 'payout'
    note TEXT,
    created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tx_from ON transactions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_tx_to ON transactions(to_user_id);

-- 10. Moderation & Bug Reports (Crowdsourced Monitoring)
CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    reporter_id TEXT, -- user ID if logged in, or 'guest'
    reporter_email TEXT,
    target_type TEXT NOT NULL, -- 'message', 'character', 'bug'
    target_id TEXT NOT NULL,   -- msg identifier, character id, or feature
    target_name TEXT,          -- character name or snippet title
    category TEXT NOT NULL,    -- 'legal', 'safety', 'bug', 'copyright', 'spam', 'other'
    details TEXT,              -- user description
    snippet TEXT,              -- reported text snippet or context
    metadata TEXT,             -- JSON string of device / model / platform context
    status TEXT DEFAULT 'pending', -- 'pending', 'investigating', 'resolved', 'rewarded', 'dismissed'
    stars_rewarded INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_target ON reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_reports_created ON reports(created_at DESC);


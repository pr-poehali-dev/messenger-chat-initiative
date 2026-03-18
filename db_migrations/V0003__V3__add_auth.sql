ALTER TABLE t_p32382310_messenger_chat_initi.users
  ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) DEFAULT '';

CREATE TABLE IF NOT EXISTS t_p32382310_messenger_chat_initi.sessions (
  token VARCHAR(128) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON t_p32382310_messenger_chat_initi.sessions(user_id);

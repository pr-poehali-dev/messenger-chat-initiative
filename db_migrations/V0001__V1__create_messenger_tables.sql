CREATE TABLE IF NOT EXISTS t_p32382310_messenger_chat_initi.users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  avatar VARCHAR(10) NOT NULL,
  status VARCHAR(20) DEFAULT 'offline',
  bio TEXT DEFAULT '',
  phone VARCHAR(50) DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p32382310_messenger_chat_initi.chats (
  id VARCHAR(64) PRIMARY KEY,
  user1_id VARCHAR(64) NOT NULL,
  user2_id VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p32382310_messenger_chat_initi.messages (
  id BIGSERIAL PRIMARY KEY,
  chat_id VARCHAR(64) NOT NULL REFERENCES t_p32382310_messenger_chat_initi.chats(id),
  sender_id VARCHAR(64) NOT NULL,
  text TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'text',
  duration INTEGER DEFAULT 0,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON t_p32382310_messenger_chat_initi.messages(chat_id, created_at);

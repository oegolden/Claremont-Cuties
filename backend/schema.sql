-- Enable UUID extension if needed (though services currently use SERIAL/integers mostly)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Forms Table
CREATE TABLE IF NOT EXISTS forms (
    id SERIAL PRIMARY KEY,
    form_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    age INTEGER,
    home_location TEXT,
    campus TEXT,
    year TEXT,
    gender TEXT,
    sexual_orientation TEXT,
    social_media_accounts JSONB,
    form_id INTEGER REFERENCES forms(id) ON DELETE SET NULL,
    user_photo_key TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Matches Table
CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    user_id_1 INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_id_2 INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id_1, user_id_2)
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    sequence INTEGER DEFAULT 0,
    status TEXT DEFAULT 'sent',
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_matches_user_id_1 ON matches(user_id_1);
CREATE INDEX IF NOT EXISTS idx_matches_user_id_2 ON matches(user_id_2);
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id);

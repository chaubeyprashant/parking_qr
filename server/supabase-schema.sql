-- Parking QR Database Schema for Supabase

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  upgraded_at TIMESTAMP WITH TIME ZONE
);

-- Create qr_codes table
CREATE TABLE IF NOT EXISTS qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT NOT NULL,
  qr_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_qr_codes_user_id ON qr_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_email ON qr_codes(email);
CREATE INDEX IF NOT EXISTS idx_qr_codes_id ON qr_codes(id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a public API)
-- For users table - allow read access to all, insert/update for authenticated or service role
CREATE POLICY "Allow public read access to users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert to users" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to users" ON users
  FOR UPDATE USING (true);

-- For qr_codes table - allow public read access, insert for all
CREATE POLICY "Allow public read access to qr_codes" ON qr_codes
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert to qr_codes" ON qr_codes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to qr_codes" ON qr_codes
  FOR UPDATE USING (true);


-- Biometric Authentication Schema
-- Tables for WebAuthn credentials, device trust, and session management

-- User biometric credentials (WebAuthn public keys)
CREATE TABLE IF NOT EXISTS user_biometric_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  credential_id TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  counter BIGINT DEFAULT 0,
  device_type TEXT NOT NULL,
  device_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes for biometric credentials
CREATE INDEX idx_biometric_user_id ON user_biometric_credentials(user_id);
CREATE INDEX idx_biometric_credential_id ON user_biometric_credentials(credential_id);
CREATE INDEX idx_biometric_last_used ON user_biometric_credentials(last_used DESC);

-- Trusted devices
CREATE TABLE IF NOT EXISTS trusted_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  device_fingerprint TEXT NOT NULL,
  device_name TEXT NOT NULL,
  device_type TEXT NOT NULL,
  user_agent TEXT,
  ip_address TEXT,
  location TEXT,
  trusted BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days',

  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes for trusted devices
CREATE INDEX idx_device_user_id ON trusted_devices(user_id);
CREATE INDEX idx_device_fingerprint ON trusted_devices(device_fingerprint);
CREATE INDEX idx_device_trusted ON trusted_devices(trusted);
CREATE INDEX idx_device_expires_at ON trusted_devices(expires_at);

-- User sessions
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  device_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days',

  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_device FOREIGN KEY (device_id) REFERENCES trusted_devices(id) ON DELETE SET NULL
);

-- Indexes for sessions
CREATE INDEX idx_session_user_id ON user_sessions(user_id);
CREATE INDEX idx_session_token ON user_sessions(session_token);
CREATE INDEX idx_session_device_id ON user_sessions(device_id);
CREATE INDEX idx_session_expires_at ON user_sessions(expires_at);

-- Magic link tokens (for email authentication)
CREATE TABLE IF NOT EXISTS magic_link_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '15 minutes'
);

-- Indexes for magic links
CREATE INDEX idx_magic_link_token ON magic_link_tokens(token);
CREATE INDEX idx_magic_link_email ON magic_link_tokens(email);
CREATE INDEX idx_magic_link_expires_at ON magic_link_tokens(expires_at);

-- Authentication challenges (for WebAuthn)
CREATE TABLE IF NOT EXISTS auth_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  email TEXT,
  challenge TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL, -- 'registration' or 'authentication'
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '5 minutes'
);

-- Indexes for challenges
CREATE INDEX idx_challenge_challenge ON auth_challenges(challenge);
CREATE INDEX idx_challenge_user_id ON auth_challenges(user_id);
CREATE INDEX idx_challenge_email ON auth_challenges(email);
CREATE INDEX idx_challenge_expires_at ON auth_challenges(expires_at);

-- Add biometric_enabled column to users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'biometric_enabled'
  ) THEN
    ALTER TABLE auth.users ADD COLUMN biometric_enabled BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Cleanup function for expired tokens and challenges
CREATE OR REPLACE FUNCTION cleanup_expired_auth_data()
RETURNS void AS $$
BEGIN
  -- Delete expired sessions
  DELETE FROM user_sessions WHERE expires_at < NOW();

  -- Delete expired magic links
  DELETE FROM magic_link_tokens WHERE expires_at < NOW();

  -- Delete expired challenges
  DELETE FROM auth_challenges WHERE expires_at < NOW();

  -- Untrust expired devices
  UPDATE trusted_devices SET trusted = false WHERE expires_at < NOW() AND trusted = true;
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (requires pg_cron extension)
-- Run cleanup every hour
-- SELECT cron.schedule('cleanup-expired-auth', '0 * * * *', 'SELECT cleanup_expired_auth_data()');

-- Row Level Security policies

-- Biometric credentials: Users can only see their own
ALTER TABLE user_biometric_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own biometric credentials"
  ON user_biometric_credentials FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own biometric credentials"
  ON user_biometric_credentials FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own biometric credentials"
  ON user_biometric_credentials FOR DELETE
  USING (auth.uid() = user_id);

-- Trusted devices: Users can only see their own
ALTER TABLE trusted_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own devices"
  ON trusted_devices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own devices"
  ON trusted_devices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own devices"
  ON trusted_devices FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own devices"
  ON trusted_devices FOR DELETE
  USING (auth.uid() = user_id);

-- Sessions: Users can only see their own
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON user_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON user_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON user_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON user_biometric_credentials TO authenticated;
GRANT ALL ON trusted_devices TO authenticated;
GRANT ALL ON user_sessions TO authenticated;
GRANT ALL ON magic_link_tokens TO authenticated;
GRANT ALL ON auth_challenges TO authenticated;

COMMENT ON TABLE user_biometric_credentials IS 'Stores WebAuthn public keys for biometric authentication';
COMMENT ON TABLE trusted_devices IS 'Tracks trusted devices for seamless authentication';
COMMENT ON TABLE user_sessions IS 'Active user sessions with token management';
COMMENT ON TABLE magic_link_tokens IS 'Temporary tokens for email-based magic link authentication';
COMMENT ON TABLE auth_challenges IS 'WebAuthn challenges for registration and authentication';
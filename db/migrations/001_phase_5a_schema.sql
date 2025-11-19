-- ================================================================
-- PHASE 5A — THE VOID POSTGRES SCHEMA
-- Base Sepolia + Mainnet Infrastructure
-- ================================================================

-- ============================================================
-- TABLE: world_events
-- Primary analytics table for all world events
-- ============================================================

CREATE TABLE IF NOT EXISTS world_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  wallet_address VARCHAR(42),
  session_id VARCHAR(100),
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Indexes for analytics queries
  CONSTRAINT world_events_timestamp_wallet_idx UNIQUE (timestamp, wallet_address, event_type)
);

CREATE INDEX IF NOT EXISTS idx_world_events_event_type ON world_events(event_type);
CREATE INDEX IF NOT EXISTS idx_world_events_wallet_address ON world_events(wallet_address);
CREATE INDEX IF NOT EXISTS idx_world_events_session_id ON world_events(session_id);
CREATE INDEX IF NOT EXISTS idx_world_events_timestamp ON world_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_world_events_created_at ON world_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_world_events_payload_gin ON world_events USING gin(payload);

COMMENT ON TABLE world_events IS 'Raw event log for all world interactions and analytics';
COMMENT ON COLUMN world_events.payload IS 'Full event payload as JSONB for flexible queries';

-- ============================================================
-- TABLE: parcel_entries
-- Optimized table for parcel visit analytics
-- ============================================================

CREATE TABLE IF NOT EXISTS parcel_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address VARCHAR(42) NOT NULL,
  parcel_id VARCHAR(100) NOT NULL,
  parcel_x INTEGER NOT NULL,
  parcel_z INTEGER NOT NULL,
  district_id VARCHAR(100),
  world_x FLOAT NOT NULL,
  world_y FLOAT NOT NULL,
  world_z FLOAT NOT NULL,
  is_first_visit BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Prevent duplicate entries (idempotency)
  CONSTRAINT parcel_entries_unique UNIQUE (wallet_address, parcel_id, timestamp)
);

CREATE INDEX IF NOT EXISTS idx_parcel_entries_wallet ON parcel_entries(wallet_address);
CREATE INDEX IF NOT EXISTS idx_parcel_entries_parcel_id ON parcel_entries(parcel_id);
CREATE INDEX IF NOT EXISTS idx_parcel_entries_coords ON parcel_entries(parcel_x, parcel_z);
CREATE INDEX IF NOT EXISTS idx_parcel_entries_district ON parcel_entries(district_id);
CREATE INDEX IF NOT EXISTS idx_parcel_entries_timestamp ON parcel_entries(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_parcel_entries_first_visit ON parcel_entries(is_first_visit) WHERE is_first_visit = TRUE;

COMMENT ON TABLE parcel_entries IS 'Parcel visit tracking for heatmaps and exploration analytics';

-- ============================================================
-- TABLE: district_entries
-- Optimized table for district visit analytics
-- ============================================================

CREATE TABLE IF NOT EXISTS district_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address VARCHAR(42) NOT NULL,
  district_id VARCHAR(100) NOT NULL,
  district_name VARCHAR(255),
  parcel_id VARCHAR(100),
  is_first_visit BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Prevent duplicate entries (idempotency)
  CONSTRAINT district_entries_unique UNIQUE (wallet_address, district_id, timestamp)
);

CREATE INDEX IF NOT EXISTS idx_district_entries_wallet ON district_entries(wallet_address);
CREATE INDEX IF NOT EXISTS idx_district_entries_district_id ON district_entries(district_id);
CREATE INDEX IF NOT EXISTS idx_district_entries_timestamp ON district_entries(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_district_entries_first_visit ON district_entries(is_first_visit) WHERE is_first_visit = TRUE;

COMMENT ON TABLE district_entries IS 'District visit tracking for zone popularity analytics';

-- ============================================================
-- TABLE: player_sessions
-- Session tracking for retention and engagement metrics
-- ============================================================

CREATE TABLE IF NOT EXISTS player_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address VARCHAR(42) NOT NULL,
  session_id VARCHAR(100) NOT NULL UNIQUE,
  device VARCHAR(50),
  user_agent TEXT,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  parcels_visited INTEGER DEFAULT 0,
  districts_visited INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT player_sessions_duration_check CHECK (duration_seconds IS NULL OR duration_seconds >= 0)
);

CREATE INDEX IF NOT EXISTS idx_player_sessions_wallet ON player_sessions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_player_sessions_session_id ON player_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_player_sessions_started_at ON player_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_player_sessions_ended_at ON player_sessions(ended_at DESC) WHERE ended_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_player_sessions_active ON player_sessions(wallet_address, started_at) WHERE ended_at IS NULL;

COMMENT ON TABLE player_sessions IS 'Player session tracking for DAU/MAU and retention analytics';
COMMENT ON COLUMN player_sessions.duration_seconds IS 'Session duration in seconds, NULL if session still active';

-- ============================================================
-- TABLE: beta_users
-- Beta access control and tracking
-- ============================================================

CREATE TABLE IF NOT EXISTS beta_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address VARCHAR(42) NOT NULL UNIQUE,
  email VARCHAR(255),
  access_granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  access_tier VARCHAR(50) DEFAULT 'beta',
  is_active BOOLEAN DEFAULT TRUE,
  first_login_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  total_sessions INTEGER DEFAULT 0,
  referral_code VARCHAR(50),
  referred_by VARCHAR(42),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_beta_users_wallet ON beta_users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_beta_users_access_tier ON beta_users(access_tier);
CREATE INDEX IF NOT EXISTS idx_beta_users_is_active ON beta_users(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_beta_users_referral_code ON beta_users(referral_code) WHERE referral_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_beta_users_referred_by ON beta_users(referred_by) WHERE referred_by IS NOT NULL;

COMMENT ON TABLE beta_users IS 'Beta user access control and referral tracking';
COMMENT ON COLUMN beta_users.access_tier IS 'User access level: beta, founder, admin';

-- ============================================================
-- MATERIALIZED VIEW: player_activity_summary
-- Pre-computed player stats for dashboards
-- ============================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS player_activity_summary AS
SELECT 
  wallet_address,
  COUNT(DISTINCT session_id) as total_sessions,
  COUNT(DISTINCT DATE(started_at)) as unique_days_active,
  SUM(duration_seconds) as total_time_seconds,
  AVG(duration_seconds) as avg_session_duration,
  MAX(started_at) as last_active_at,
  MIN(started_at) as first_active_at,
  SUM(parcels_visited) as total_parcels_explored,
  SUM(districts_visited) as total_districts_explored
FROM player_sessions
WHERE ended_at IS NOT NULL
GROUP BY wallet_address;

CREATE UNIQUE INDEX IF NOT EXISTS idx_player_activity_summary_wallet 
  ON player_activity_summary(wallet_address);

COMMENT ON MATERIALIZED VIEW player_activity_summary IS 'Pre-computed player engagement metrics (refresh periodically)';

-- ============================================================
-- FUNCTION: refresh_player_activity_summary
-- Refresh materialized view (call via cron or manually)
-- ============================================================

CREATE OR REPLACE FUNCTION refresh_player_activity_summary()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY player_activity_summary;
END;
$$;

COMMENT ON FUNCTION refresh_player_activity_summary IS 'Refresh player activity summary view (run via cron)';

-- ============================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- Enable when moving to production
-- ============================================================

-- Enable RLS (commented out for development)
-- ALTER TABLE world_events ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE parcel_entries ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE district_entries ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE player_sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE beta_users ENABLE ROW LEVEL SECURITY;

-- Example RLS policy (users can only read their own data)
-- CREATE POLICY world_events_user_read ON world_events
--   FOR SELECT
--   USING (auth.uid()::text = wallet_address);

-- ============================================================
-- GRANTS (adjust based on your auth setup)
-- ============================================================

-- Grant access to authenticated users (adjust role as needed)
-- GRANT SELECT, INSERT ON world_events TO authenticated;
-- GRANT SELECT, INSERT ON parcel_entries TO authenticated;
-- GRANT SELECT, INSERT ON district_entries TO authenticated;
-- GRANT SELECT, INSERT, UPDATE ON player_sessions TO authenticated;
-- GRANT SELECT ON beta_users TO authenticated;

-- ================================================================
-- END OF SCHEMA
-- ================================================================

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE '✅ The Void Phase 5A schema created successfully';
END $$;

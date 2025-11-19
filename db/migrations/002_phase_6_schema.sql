-- PHASE 6 DATABASE SCHEMA
-- XP, Achievements, Interactions, Airdrop Scoring
-- Run after 001_phase_5a_schema.sql

-- =====================================================
-- XP EVENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS xp_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  session_id TEXT,
  amount INTEGER NOT NULL,
  new_total INTEGER NOT NULL,
  source TEXT NOT NULL, -- XP_SOURCE enum value
  source_details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for xp_events
CREATE INDEX idx_xp_events_wallet ON xp_events(wallet_address);
CREATE INDEX idx_xp_events_session ON xp_events(session_id);
CREATE INDEX idx_xp_events_source ON xp_events(source);
CREATE INDEX idx_xp_events_created ON xp_events(created_at DESC);

-- =====================================================
-- ACHIEVEMENT UNLOCKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS achievement_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  session_id TEXT,
  achievement_id TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  xp_bonus INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate unlocks
  UNIQUE(wallet_address, achievement_id)
);

-- Indexes for achievement_unlocks
CREATE INDEX idx_achievement_unlocks_wallet ON achievement_unlocks(wallet_address);
CREATE INDEX idx_achievement_unlocks_achievement ON achievement_unlocks(achievement_id);
CREATE INDEX idx_achievement_unlocks_created ON achievement_unlocks(created_at DESC);

-- =====================================================
-- INTERACTION EVENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS interaction_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  session_id TEXT,
  interaction_type TEXT NOT NULL,
  interactable_id TEXT,
  parcel_id TEXT,
  district_id TEXT,
  duration_ms INTEGER,
  success BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for interaction_events
CREATE INDEX idx_interaction_events_wallet ON interaction_events(wallet_address);
CREATE INDEX idx_interaction_events_type ON interaction_events(interaction_type);
CREATE INDEX idx_interaction_events_created ON interaction_events(created_at DESC);

-- =====================================================
-- AIRDROP SCORES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS airdrop_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL UNIQUE,
  base_score INTEGER NOT NULL DEFAULT 0,
  total_score INTEGER NOT NULL DEFAULT 0,
  
  -- Breakdown
  xp_points NUMERIC(10,2) DEFAULT 0,
  achievement_points NUMERIC(10,2) DEFAULT 0,
  exploration_points NUMERIC(10,2) DEFAULT 0,
  session_points NUMERIC(10,2) DEFAULT 0,
  interaction_points NUMERIC(10,2) DEFAULT 0,
  creator_terminal_points NUMERIC(10,2) DEFAULT 0,
  social_points NUMERIC(10,2) DEFAULT 0,
  
  -- Multipliers (JSON array)
  multipliers JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  rank INTEGER,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for airdrop_scores
CREATE INDEX idx_airdrop_scores_wallet ON airdrop_scores(wallet_address);
CREATE INDEX idx_airdrop_scores_total ON airdrop_scores(total_score DESC);
CREATE INDEX idx_airdrop_scores_rank ON airdrop_scores(rank ASC) WHERE rank IS NOT NULL;

-- =====================================================
-- UPDATE MATERIALIZED VIEW (from Phase 5A)
-- =====================================================
DROP MATERIALIZED VIEW IF EXISTS player_activity_summary CASCADE;

CREATE MATERIALIZED VIEW player_activity_summary AS
SELECT 
  wallet_address,
  
  -- XP & Level
  COALESCE(MAX(xp.new_total), 0) AS total_xp,
  -- Simple level calculation: level = floor(sqrt(total_xp / 100))
  FLOOR(SQRT(COALESCE(MAX(xp.new_total), 0) / 100.0)) AS level,
  
  -- Achievements
  COALESCE(COUNT(DISTINCT ach.achievement_id), 0) AS achievements_count,
  COALESCE(SUM(ach.xp_bonus), 0) AS achievement_xp_bonus,
  
  -- Exploration
  COUNT(DISTINCT pe.parcel_x || ',' || pe.parcel_z) AS unique_parcels,
  COUNT(DISTINCT de.district_id) AS unique_districts,
  
  -- Sessions
  COUNT(DISTINCT ps.session_id) AS total_sessions,
  COALESCE(SUM(ps.duration_seconds), 0) AS total_session_time_seconds,
  
  -- Interactions
  COUNT(DISTINCT ie.id) AS total_interactions,
  COUNT(DISTINCT ie.id) FILTER (WHERE ie.interaction_type = 'CREATOR_TERMINAL') AS creator_terminal_uses,
  
  -- Airdrop Score
  COALESCE(ads.total_score, 0) AS airdrop_score,
  ads.rank AS airdrop_rank,
  
  -- Timestamps
  MIN(ps.started_at) AS first_session,
  MAX(ps.started_at) AS last_session,
  NOW() AS last_updated

FROM (
  -- Get all unique wallet addresses
  SELECT DISTINCT wallet_address FROM player_sessions
  UNION
  SELECT DISTINCT wallet_address FROM xp_events
  UNION
  SELECT DISTINCT wallet_address FROM achievement_unlocks
) AS wallets

LEFT JOIN xp_events xp ON wallets.wallet_address = xp.wallet_address
LEFT JOIN achievement_unlocks ach ON wallets.wallet_address = ach.wallet_address
LEFT JOIN parcel_entries pe ON wallets.wallet_address = pe.wallet_address
LEFT JOIN district_entries de ON wallets.wallet_address = de.wallet_address
LEFT JOIN player_sessions ps ON wallets.wallet_address = ps.wallet_address
LEFT JOIN interaction_events ie ON wallets.wallet_address = ie.wallet_address
LEFT JOIN airdrop_scores ads ON wallets.wallet_address = ads.wallet_address

GROUP BY wallets.wallet_address, ads.total_score, ads.rank;

-- Index on materialized view
CREATE UNIQUE INDEX idx_player_activity_summary_wallet ON player_activity_summary(wallet_address);
CREATE INDEX idx_player_activity_summary_xp ON player_activity_summary(total_xp DESC);
CREATE INDEX idx_player_activity_summary_score ON player_activity_summary(airdrop_score DESC);

-- =====================================================
-- REFRESH FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION refresh_player_activity_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY player_activity_summary;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- GRANTS (uncomment for production)
-- =====================================================
-- GRANT SELECT, INSERT ON xp_events TO anon, authenticated;
-- GRANT SELECT, INSERT ON achievement_unlocks TO anon, authenticated;
-- GRANT SELECT, INSERT ON interaction_events TO anon, authenticated;
-- GRANT SELECT, INSERT, UPDATE ON airdrop_scores TO anon, authenticated;
-- GRANT SELECT ON player_activity_summary TO anon, authenticated;

-- =====================================================
-- RLS POLICIES (uncomment for production)
-- =====================================================
-- ALTER TABLE xp_events ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view their own XP events" ON xp_events FOR SELECT USING (auth.uid()::text = wallet_address);
-- CREATE POLICY "Users can insert their own XP events" ON xp_events FOR INSERT WITH CHECK (auth.uid()::text = wallet_address);

-- ALTER TABLE achievement_unlocks ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view their own achievements" ON achievement_unlocks FOR SELECT USING (auth.uid()::text = wallet_address);
-- CREATE POLICY "Users can unlock their own achievements" ON achievement_unlocks FOR INSERT WITH CHECK (auth.uid()::text = wallet_address);

-- ALTER TABLE interaction_events ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view their own interactions" ON interaction_events FOR SELECT USING (auth.uid()::text = wallet_address);
-- CREATE POLICY "Users can insert their own interactions" ON interaction_events FOR INSERT WITH CHECK (auth.uid()::text = wallet_address);

-- ALTER TABLE airdrop_scores ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view all airdrop scores" ON airdrop_scores FOR SELECT USING (true);
-- CREATE POLICY "Users can update their own airdrop score" ON airdrop_scores FOR UPDATE USING (auth.uid()::text = wallet_address);

COMMENT ON TABLE xp_events IS 'Phase 6.0 - XP gain events for analytics and tracking';
COMMENT ON TABLE achievement_unlocks IS 'Phase 6.1 - Achievement unlock records';
COMMENT ON TABLE interaction_events IS 'Phase 6.x - User interaction tracking';
COMMENT ON TABLE airdrop_scores IS 'Phase 6.2 - Offchain airdrop scoring (pre-claim)';
COMMENT ON MATERIALIZED VIEW player_activity_summary IS 'Phase 6 - Aggregated player statistics including XP, achievements, and airdrop scores';

-- ============================================================================
-- VOID Land Grid Setup - 40×40 Grid (1,600 Parcels)
-- ============================================================================
-- Run: psql $DATABASE_URL -f migrations/001_land_grid_setup.sql

-- Create districts enum
CREATE TYPE district_type AS ENUM (
  'DEFI_DISTRICT',
  'CREATOR_QUARTER',
  'AI_OPS_ZONE',
  'VOID_WASTES',
  'SIGNAL_PEAKS',
  'UNASSIGNED'
);

-- Create land parcels table
CREATE TABLE IF NOT EXISTS land_parcels (
  id SERIAL PRIMARY KEY,
  
  -- Grid coordinates (0-39, 0-39)
  x INTEGER NOT NULL CHECK (x >= 0 AND x < 40),
  y INTEGER NOT NULL CHECK (y >= 0 AND y < 40),
  
  -- On-chain reference
  token_id INTEGER UNIQUE, -- NFT token ID from LandRegistry
  
  -- District assignment
  district district_type NOT NULL DEFAULT 'UNASSIGNED',
  
  -- Ownership & State
  owner_address VARCHAR(42), -- Ethereum address (0x...)
  is_claimed BOOLEAN DEFAULT FALSE,
  claimed_at TIMESTAMP,
  
  -- Economic Data
  base_price DECIMAL(20, 6) DEFAULT 100.0, -- USDC
  current_yield_apy DECIMAL(5, 2), -- APR %
  total_earned DECIMAL(20, 6) DEFAULT 0.0, -- USDC
  
  -- Metadata
  name VARCHAR(100),
  description TEXT,
  image_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(x, y)
);

-- Create indexes for performance
CREATE INDEX idx_land_parcels_coordinates ON land_parcels(x, y);
CREATE INDEX idx_land_parcels_district ON land_parcels(district);
CREATE INDEX idx_land_parcels_owner ON land_parcels(owner_address);
CREATE INDEX idx_land_parcels_claimed ON land_parcels(is_claimed);

-- ============================================================================
-- District Mapping (40×40 grid divided into 5 districts)
-- ============================================================================

-- DeFi District (bottom-left, 20×15 = 300 parcels)
-- x: 0-19, y: 0-14
INSERT INTO land_parcels (x, y, district, base_price)
SELECT 
  x, 
  y, 
  'DEFI_DISTRICT'::district_type,
  150.0 -- Premium pricing
FROM generate_series(0, 19) AS x
CROSS JOIN generate_series(0, 14) AS y;

-- Creator Quarter (bottom-right, 20×15 = 300 parcels)
-- x: 20-39, y: 0-14
INSERT INTO land_parcels (x, y, district, base_price)
SELECT 
  x, 
  y, 
  'CREATOR_QUARTER'::district_type,
  100.0 -- Standard pricing
FROM generate_series(20, 39) AS x
CROSS JOIN generate_series(0, 14) AS y;

-- AI Ops Zone (top-left, 20×15 = 300 parcels)
-- x: 0-19, y: 15-29
INSERT INTO land_parcels (x, y, district, base_price)
SELECT 
  x, 
  y, 
  'AI_OPS_ZONE'::district_type,
  200.0 -- High-value (data centers)
FROM generate_series(0, 19) AS x
CROSS JOIN generate_series(15, 29) AS y;

-- VOID Wastes (top-right, 20×10 = 200 parcels)
-- x: 20-39, y: 15-24
INSERT INTO land_parcels (x, y, district, base_price)
SELECT 
  x, 
  y, 
  'VOID_WASTES'::district_type,
  50.0 -- Low-cost (experimental zone)
FROM generate_series(20, 39) AS x
CROSS JOIN generate_series(15, 24) AS y;

-- SIGNAL Peaks (top-center, 20×10 = 200 parcels)
-- x: 20-39, y: 25-34
INSERT INTO land_parcels (x, y, district, base_price)
SELECT 
  x, 
  y, 
  'SIGNAL_PEAKS'::district_type,
  120.0 -- Mid-tier
FROM generate_series(20, 39) AS x
CROSS JOIN generate_series(25, 34) AS y;

-- Unassigned (top strip, 40×5 = 200 parcels - future expansion)
-- x: 0-39, y: 35-39
INSERT INTO land_parcels (x, y, district, base_price)
SELECT 
  x, 
  y, 
  'UNASSIGNED'::district_type,
  100.0 -- Standard pricing
FROM generate_series(0, 39) AS x
CROSS JOIN generate_series(35, 39) AS y;

-- ============================================================================
-- Verify Parcel Counts
-- ============================================================================

DO $$
DECLARE
  total_count INTEGER;
  district_counts JSON;
BEGIN
  -- Total count
  SELECT COUNT(*) INTO total_count FROM land_parcels;
  RAISE NOTICE 'Total parcels created: %', total_count;
  
  -- Per-district counts
  SELECT json_object_agg(district, count)
  INTO district_counts
  FROM (
    SELECT district, COUNT(*) as count
    FROM land_parcels
    GROUP BY district
  ) AS counts;
  
  RAISE NOTICE 'District distribution: %', district_counts;
  
  -- Expected: 1600 total
  IF total_count != 1600 THEN
    RAISE WARNING 'Expected 1600 parcels, got %', total_count;
  END IF;
END $$;

-- ============================================================================
-- Sample Queries
-- ============================================================================

-- Get all DeFi District parcels
-- SELECT * FROM land_parcels WHERE district = 'DEFI_DISTRICT' ORDER BY x, y;

-- Get parcel at specific coordinate
-- SELECT * FROM land_parcels WHERE x = 10 AND y = 5;

-- Get unclaimed parcels in Creator Quarter
-- SELECT * FROM land_parcels WHERE district = 'CREATOR_QUARTER' AND is_claimed = FALSE;

-- Get owner's parcels
-- SELECT * FROM land_parcels WHERE owner_address = '0x...' ORDER BY x, y;

-- District statistics
-- SELECT 
--   district, 
--   COUNT(*) as total_parcels,
--   COUNT(*) FILTER (WHERE is_claimed) as claimed_parcels,
--   AVG(base_price) as avg_price
-- FROM land_parcels
-- GROUP BY district;

-- ============================================================================
-- Cleanup (CAUTION: Drops all data)
-- ============================================================================
-- DROP TABLE IF EXISTS land_parcels CASCADE;
-- DROP TYPE IF EXISTS district_type CASCADE;

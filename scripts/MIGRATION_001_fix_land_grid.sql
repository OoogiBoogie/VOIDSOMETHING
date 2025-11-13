-- ============================================================================
-- MIGRATION 001: Fix Land Grid Mismatch
-- ============================================================================
-- Purpose: Standardize on Genesis 40×40 grid (1,600 parcels)
-- Previous: 4,444 parcels across scattered districts
-- New: 1,600 parcels in standardized 40×40 grid
-- ============================================================================

-- Drop existing property data (TESTNET ONLY - do not run on mainnet without backup)
TRUNCATE TABLE property_activity;
TRUNCATE TABLE properties;

-- Reset sequence
ALTER SEQUENCE IF EXISTS properties_id_seq RESTART WITH 1;

-- ============================================================================
-- GENESIS 40×40 GRID (1,600 PARCELS)
-- ============================================================================
-- Grid layout: -800 to +800 world coords (40 parcels × 40 units each)
-- Parcel size: 40×40 world units
-- Total: 1,600 parcels (40 rows × 40 cols)
-- ============================================================================

-- Generate 1,600 parcels in 40×40 grid
INSERT INTO properties (
  parcel_id, 
  district_id, 
  property_type, 
  center_x, 
  center_z, 
  size_x, 
  size_z, 
  base_price, 
  current_price, 
  price_multiplier,
  status,
  for_sale
)
SELECT 
  (row_num * 40 + col_num) as parcel_id,  -- 0 to 1599
  
  -- District assignment based on position
  CASE 
    -- Center 10×10 = CORE (premium)
    WHEN row_num BETWEEN 15 AND 24 AND col_num BETWEEN 15 AND 24 THEN 'core-district'
    
    -- Ring around core = COMMERCIAL
    WHEN row_num BETWEEN 12 AND 27 AND col_num BETWEEN 12 AND 27 THEN 'commercial-district'
    
    -- Gaming quadrant (NW)
    WHEN row_num < 20 AND col_num < 20 THEN 'gaming-district'
    
    -- Creator quadrant (NE)
    WHEN row_num < 20 AND col_num >= 20 THEN 'creator-district'
    
    -- DeFi quadrant (SW)
    WHEN row_num >= 20 AND col_num < 20 THEN 'defi-district'
    
    -- Social/Residential quadrant (SE)
    WHEN row_num >= 20 AND col_num >= 20 THEN 'social-district'
    
    ELSE 'frontier'
  END as district_id,
  
  -- Property type based on district
  CASE 
    WHEN row_num BETWEEN 15 AND 24 AND col_num BETWEEN 15 AND 24 THEN 'commercial'  -- Core
    WHEN row_num BETWEEN 12 AND 27 AND col_num BETWEEN 12 AND 27 THEN 'commercial'  -- Commercial ring
    WHEN row_num < 20 AND col_num < 20 THEN 'commercial'  -- Gaming
    WHEN row_num < 20 AND col_num >= 20 THEN 'commercial' -- Creator
    WHEN row_num >= 20 AND col_num < 20 THEN 'commercial' -- DeFi
    ELSE 'residential'  -- Social/Frontier
  END as property_type,
  
  -- Center coordinates (world units)
  -- Grid spans -800 to +800 (1600 units / 40 parcels = 40 units per parcel)
  (-800 + (col_num * 40) + 20)::DECIMAL(10,2) as center_x,
  (-800 + (row_num * 40) + 20)::DECIMAL(10,2) as center_z,
  
  -- Standard parcel size
  40 as size_x,
  40 as size_z,
  
  -- Base price (10k VOID standard)
  10000 as base_price,
  
  -- Current price (multiplier based on district)
  (10000 * CASE 
    -- Core 10×10 = 10x multiplier
    WHEN row_num BETWEEN 15 AND 24 AND col_num BETWEEN 15 AND 24 THEN 10.0
    
    -- Commercial ring = 5x
    WHEN row_num BETWEEN 12 AND 27 AND col_num BETWEEN 12 AND 27 THEN 5.0
    
    -- Specialty districts = 3x
    WHEN row_num < 20 AND col_num < 20 THEN 3.0  -- Gaming
    WHEN row_num < 20 AND col_num >= 20 THEN 3.0 -- Creator
    WHEN row_num >= 20 AND col_num < 20 THEN 3.0 -- DeFi
    
    -- Residential/Frontier = 1x
    ELSE 1.0
  END)::DECIMAL(20,2) as current_price,
  
  -- Price multiplier
  CASE 
    WHEN row_num BETWEEN 15 AND 24 AND col_num BETWEEN 15 AND 24 THEN 10.0
    WHEN row_num BETWEEN 12 AND 27 AND col_num BETWEEN 12 AND 27 THEN 5.0
    WHEN row_num < 20 AND col_num < 20 THEN 3.0
    WHEN row_num < 20 AND col_num >= 20 THEN 3.0
    WHEN row_num >= 20 AND col_num < 20 THEN 3.0
    ELSE 1.0
  END as price_multiplier,
  
  -- All parcels start available
  'available' as status,
  true as for_sale
  
FROM 
  generate_series(0, 39) as row_num,
  generate_series(0, 39) as col_num;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Should return 1600
SELECT COUNT(*) as total_parcels FROM properties;

-- District breakdown
SELECT 
  district_id,
  COUNT(*) as parcel_count,
  property_type,
  AVG(price_multiplier) as avg_multiplier
FROM properties
GROUP BY district_id, property_type
ORDER BY AVG(price_multiplier) DESC;

-- Grid bounds check
SELECT 
  MIN(center_x) as min_x,
  MAX(center_x) as max_x,
  MIN(center_z) as min_z,
  MAX(center_z) as max_z
FROM properties;
-- Expected: min_x=-780, max_x=780, min_z=-780, max_z=780

COMMENT ON TABLE properties IS 'Genesis 40×40 grid (1,600 parcels) - aligned with GRID_SIZE: 40 in TypeScript';

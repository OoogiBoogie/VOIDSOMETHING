-- ============================================================================
-- PSX-VOID GENESIS LAND SYSTEM - 40×40 GRID (1,600 PARCELS)
-- Aligned with TypeScript land system (lib/land/types.ts)
-- ============================================================================

-- Drop old property system if exists
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS real_estate_tracking CASCADE;

-- ============================================================================
-- PARCELS TABLE (Core Land NFTs)
-- ============================================================================
CREATE TABLE parcels (
  -- IDs & Identification
  parcel_id VARCHAR(50) PRIMARY KEY,        -- "VOID-GENESIS-0" to "VOID-GENESIS-1599"
  token_id INTEGER UNIQUE NOT NULL,         -- ERC-721 token ID (0-1599)
  grid_index INTEGER NOT NULL,              -- 0-1599 (gridY * 40 + gridX)
  
  -- Multi-Region Support
  world_id VARCHAR(50) NOT NULL DEFAULT 'VOID',           -- "VOID", "PARTNER-NIKE", etc.
  region_id VARCHAR(50) NOT NULL DEFAULT 'VOID-GENESIS',  -- "VOID-GENESIS", "VOID-EXPANSION-1", etc.
  
  -- Grid Coordinates (40×40 genesis)
  grid_x INTEGER NOT NULL CHECK (grid_x >= 0 AND grid_x < 40),
  grid_y INTEGER NOT NULL CHECK (grid_y >= 0 AND grid_y < 40),
  layer_z INTEGER DEFAULT 0,                -- Future: underground/sky layers
  
  -- Tier & District System
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('CORE', 'RING', 'FRONTIER')),
  district VARCHAR(20) NOT NULL CHECK (district IN ('GAMING', 'BUSINESS', 'SOCIAL', 'DEFI', 'RESIDENTIAL', 'DAO', 'PUBLIC')),
  
  -- Ownership
  owner_address VARCHAR(100),               -- Wallet address or NULL if unowned
  status VARCHAR(20) NOT NULL DEFAULT 'FOR_SALE' CHECK (status IN ('OWNED', 'FOR_SALE', 'NOT_FOR_SALE', 'DAO_OWNED', 'RESERVED')),
  
  -- Scarcity Bonuses
  is_founder_plot BOOLEAN DEFAULT false,
  is_corner_lot BOOLEAN DEFAULT false,
  is_main_street BOOLEAN DEFAULT false,
  
  -- Pricing (in wei, 18 decimals)
  base_price_void BIGINT NOT NULL,
  listing_price_void BIGINT,                -- NULL if not for sale
  last_sale_price BIGINT,
  
  -- Building Link
  building_id VARCHAR(50),                  -- Links to buildings table
  
  -- Creation Source
  creation_source VARCHAR(30) DEFAULT 'GENESIS' CHECK (creation_source IN ('GENESIS', 'EXPANSION', 'PARTNER_MINT', 'USER_MINT')),
  
  -- Metadata
  metadata JSONB,                           -- {rarity, traits, description, image}
  
  -- Timestamps
  acquired_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  UNIQUE(grid_x, grid_y, region_id)
);

-- ============================================================================
-- BUILDINGS TABLE (3D Visual Structures)
-- ============================================================================
CREATE TABLE buildings (
  building_id VARCHAR(50) PRIMARY KEY,
  parcel_id VARCHAR(50) REFERENCES parcels(parcel_id) ON DELETE CASCADE,
  
  -- Architecture Type
  archetype VARCHAR(30) CHECK (archetype IN ('CORPORATE_TOWER', 'RESIDENTIAL_HIVE', 'INDUSTRIAL_COMPLEX', 'DATA_CENTER', 'ABANDONED_SHELL', 'MIXED_USE', 'NIGHTCLUB', 'ARCADE', 'GALLERY')),
  visual_variant INTEGER DEFAULT 0,
  
  -- Dimensions
  height_class VARCHAR(10) CHECK (height_class IN ('LOW', 'MID', 'HIGH', 'MEGA')),
  floors INTEGER CHECK (floors >= 1 AND floors <= 100),
  base_width NUMERIC DEFAULT 20,
  base_depth NUMERIC DEFAULT 20,
  total_height NUMERIC,
  
  -- Visual Features
  has_balconies BOOLEAN DEFAULT false,
  has_paneling BOOLEAN DEFAULT false,
  has_vents BOOLEAN DEFAULT false,
  has_data_screens BOOLEAN DEFAULT false,
  has_rooftop_features BOOLEAN DEFAULT false,
  vertical_features JSONB,                  -- ["spire", "landing_pad", "observation_deck"]
  
  -- Materials & Lighting
  color_scheme JSONB,                       -- {base: "#...", accent: "#...", secondary: "#..."}
  lighting_density NUMERIC DEFAULT 0.5 CHECK (lighting_density >= 0 AND lighting_density <= 1),
  decay_level NUMERIC DEFAULT 0 CHECK (decay_level >= 0 AND decay_level <= 1),
  
  -- Business Link
  business_id VARCHAR(50),                  -- Links to businesses table
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- UNITS TABLE (Leasable Spaces within Buildings)
-- ============================================================================
CREATE TABLE units (
  unit_id VARCHAR(50) PRIMARY KEY,
  building_id VARCHAR(50) REFERENCES buildings(building_id) ON DELETE CASCADE,
  
  -- Unit Info
  unit_number VARCHAR(20),                  -- "1A", "201", "PENTHOUSE", etc.
  floor INTEGER,
  unit_type VARCHAR(30) CHECK (unit_type IN ('STUDIO', 'OFFICE', 'STOREFRONT', 'PENTHOUSE', 'WAREHOUSE', 'GALLERY', 'CLUB_SPACE')),
  size_sqm NUMERIC,
  
  -- Rental Status
  status VARCHAR(20) DEFAULT 'VACANT' CHECK (status IN ('VACANT', 'OCCUPIED', 'PENDING', 'RESERVED')),
  tenant_address VARCHAR(100),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- LEASES TABLE (Rental Agreements)
-- ============================================================================
CREATE TABLE leases (
  lease_id VARCHAR(50) PRIMARY KEY,
  unit_id VARCHAR(50) REFERENCES units(unit_id) ON DELETE CASCADE,
  
  -- Parties
  landlord_address VARCHAR(100) NOT NULL,   -- Building/parcel owner
  tenant_address VARCHAR(100) NOT NULL,
  
  -- Terms
  rent_amount_void BIGINT NOT NULL,         -- Rent in VOID tokens (wei)
  rent_period_days INTEGER NOT NULL,        -- 30, 90, 365, etc.
  revenue_split_landlord NUMERIC DEFAULT 0.80 CHECK (revenue_split_landlord >= 0 AND revenue_split_landlord <= 1),
  revenue_split_ecosystem NUMERIC DEFAULT 0.20,
  
  -- Status
  status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'TERMINATED', 'PENDING')),
  
  -- Timestamps
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- BUSINESSES TABLE (Commerce Layer)
-- ============================================================================
CREATE TABLE businesses (
  business_id VARCHAR(50) PRIMARY KEY,
  owner_address VARCHAR(100) NOT NULL,
  
  -- License & Type
  license_type VARCHAR(20) CHECK (license_type IN ('NONE', 'RETAIL', 'ENTERTAINMENT', 'SERVICES', 'GAMING')),
  sector VARCHAR(30) CHECK (sector IN ('retail', 'entertainment', 'services', 'gaming', 'food_beverage', 'nightlife', 'technology')),
  
  -- Location (can span multiple parcels/buildings)
  primary_parcel_id VARCHAR(50) REFERENCES parcels(parcel_id),
  linked_parcel_ids JSONB,                  -- ["VOID-GENESIS-0", "VOID-GENESIS-1"]
  linked_building_ids JSONB,
  linked_unit_ids JSONB,
  
  -- Branding
  brand_name VARCHAR(200) NOT NULL,
  tagline TEXT,
  logo_url TEXT,
  brand_colors JSONB,                       -- {primary: "#...", secondary: "#..."}
  
  -- Status & Performance
  status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'EXPIRED', 'UNDER_CONSTRUCTION')),
  opened_at TIMESTAMP,
  total_revenue_wei BIGINT DEFAULT 0,
  monthly_revenue_wei BIGINT DEFAULT 0,
  customer_count INTEGER DEFAULT 0,
  
  -- Features
  features JSONB,                           -- {hasJukebox: true, hasCasino: false, hasRetail: true, hasTipping: true}
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SKUS TABLE (Products/Services sold by Businesses)
-- ============================================================================
CREATE TABLE skus (
  sku_id VARCHAR(50) PRIMARY KEY,
  token_id INTEGER,                         -- ERC-1155 token ID (if applicable)
  
  -- Ownership
  business_id VARCHAR(50) REFERENCES businesses(business_id) ON DELETE CASCADE,
  creator_address VARCHAR(100) NOT NULL,
  
  -- Product Info
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(30) CHECK (category IN ('virtual_item', 'digital_content', 'service', 'physical', 'collectible')),
  
  -- Pricing & Supply
  price_wei BIGINT NOT NULL,
  currency VARCHAR(10) DEFAULT 'VOID' CHECK (currency IN ('VOID', 'ETH')),
  max_supply INTEGER NOT NULL,
  current_supply INTEGER DEFAULT 0,
  available_stock INTEGER,
  
  -- Media
  image_url TEXT,
  animation_url TEXT,
  external_url TEXT,
  attributes JSONB,                         -- [{trait_type: "...", value: "..."}]
  
  -- Sales Data
  total_sales INTEGER DEFAULT 0,
  total_revenue_wei BIGINT DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_limited_edition BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_sale_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- REGIONS TABLE (Expansion System)
-- ============================================================================
CREATE TABLE regions (
  region_id VARCHAR(50) PRIMARY KEY,
  world_id VARCHAR(50) NOT NULL,
  
  -- Grid Config
  grid_width INTEGER NOT NULL,
  grid_height INTEGER NOT NULL,
  total_parcels INTEGER NOT NULL,
  
  -- Expansion Info
  expansion_number INTEGER,
  launch_date TIMESTAMP,
  launch_mechanism VARCHAR(30) CHECK (launch_mechanism IN ('DAO_VOTE', 'AUCTION', 'WHITELIST', 'PUBLIC_MINT', 'PARTNER_ALLOCATION')),
  
  -- Status
  status VARCHAR(20) DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'ACTIVE', 'SOLD_OUT', 'DEPRECATED')),
  
  -- Metadata
  description TEXT,
  theme VARCHAR(100),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX idx_parcels_owner ON parcels(owner_address);
CREATE INDEX idx_parcels_status ON parcels(status);
CREATE INDEX idx_parcels_region ON parcels(region_id);
CREATE INDEX idx_parcels_tier_district ON parcels(tier, district);
CREATE INDEX idx_parcels_grid ON parcels(grid_x, grid_y);

CREATE INDEX idx_buildings_parcel ON buildings(parcel_id);
CREATE INDEX idx_buildings_business ON buildings(business_id);

CREATE INDEX idx_units_building ON units(building_id);
CREATE INDEX idx_units_status ON units(status);
CREATE INDEX idx_units_tenant ON units(tenant_address);

CREATE INDEX idx_leases_unit ON leases(unit_id);
CREATE INDEX idx_leases_tenant ON leases(tenant_address);
CREATE INDEX idx_leases_status ON leases(status);

CREATE INDEX idx_businesses_owner ON businesses(owner_address);
CREATE INDEX idx_businesses_parcel ON businesses(primary_parcel_id);

CREATE INDEX idx_skus_business ON skus(business_id);
CREATE INDEX idx_skus_creator ON skus(creator_address);

-- ============================================================================
-- SEED GENESIS REGION (VOID-GENESIS 40×40)
-- ============================================================================
INSERT INTO regions (region_id, world_id, grid_width, grid_height, total_parcels, expansion_number, launch_date, launch_mechanism, status, description, theme)
VALUES (
  'VOID-GENESIS',
  'VOID',
  40,
  40,
  1600,
  0,
  CURRENT_TIMESTAMP,
  'PUBLIC_MINT',
  'ACTIVE',
  'The genesis 40×40 grid of the VOID metaverse. Prime land with tier-based pricing and district zoning.',
  'Dark Cyberpunk Emo Y2K'
);

-- ============================================================================
-- SEED 1,600 GENESIS PARCELS
-- ============================================================================
-- This generates all parcels with proper tier/district assignments
-- Tier calculation: distance from center (20,20)
-- District calculation: quadrant-based + center DAO zone

WITH parcel_grid AS (
  SELECT 
    grid_x,
    grid_y,
    (grid_y * 40 + grid_x) as grid_index,
    -- Calculate distance from center for tier
    SQRT(POWER(grid_x - 19.5, 2) + POWER(grid_y - 19.5, 2)) as dist_from_center
  FROM generate_series(0, 39) as grid_x,
       generate_series(0, 39) as grid_y
)
INSERT INTO parcels (
  parcel_id,
  token_id,
  grid_index,
  world_id,
  region_id,
  grid_x,
  grid_y,
  tier,
  district,
  is_founder_plot,
  is_corner_lot,
  is_main_street,
  base_price_void,
  status,
  creation_source
)
SELECT 
  'VOID-GENESIS-' || grid_index as parcel_id,
  grid_index as token_id,
  grid_index,
  'VOID' as world_id,
  'VOID-GENESIS' as region_id,
  grid_x,
  grid_y,
  -- Tier based on distance from center
  CASE 
    WHEN dist_from_center < 8 THEN 'CORE'
    WHEN dist_from_center < 16 THEN 'RING'
    ELSE 'FRONTIER'
  END as tier,
  -- District based on quadrant + center DAO + ring RESIDENTIAL
  CASE
    -- Center DAO plaza (4×4)
    WHEN grid_x >= 18 AND grid_x <= 21 AND grid_y >= 18 AND grid_y <= 21 THEN 'DAO'
    -- Middle ring RESIDENTIAL (distance 8-16 from center)
    WHEN dist_from_center >= 8 AND dist_from_center < 16 THEN 'RESIDENTIAL'
    -- NW quadrant GAMING
    WHEN grid_x < 20 AND grid_y < 20 THEN 'GAMING'
    -- NE quadrant BUSINESS
    WHEN grid_x >= 20 AND grid_y < 20 THEN 'BUSINESS'
    -- SW quadrant SOCIAL
    WHEN grid_x < 20 AND grid_y >= 20 THEN 'SOCIAL'
    -- SE quadrant DEFI
    WHEN grid_x >= 20 AND grid_y >= 20 THEN 'DEFI'
    -- Outer edges PUBLIC
    ELSE 'PUBLIC'
  END as district,
  -- Founder plots: every 10th parcel in CORE tier
  (grid_index % 10 = 0 AND dist_from_center < 8) as is_founder_plot,
  -- Corner lots
  ((grid_x = 0 OR grid_x = 39) AND (grid_y = 0 OR grid_y = 39)) as is_corner_lot,
  -- Main streets (center lines)
  (grid_x = 20 OR grid_y = 20) as is_main_street,
  -- Base price calculation: 1 ETH base × tier multiplier × district multiplier
  (1000000000000000000::BIGINT *  -- 1 ETH in wei
    CASE 
      WHEN dist_from_center < 8 THEN 3  -- CORE: 3x
      WHEN dist_from_center < 16 THEN 2 -- RING: 2x
      ELSE 1                            -- FRONTIER: 1x
    END *
    CASE
      -- District price multipliers
      WHEN grid_x >= 18 AND grid_x <= 21 AND grid_y >= 18 AND grid_y <= 21 THEN 5 -- DAO: 5x
      WHEN grid_x >= 20 AND grid_y >= 20 THEN 2 -- DEFI: 2x
      WHEN grid_x < 20 AND grid_y < 20 THEN 2   -- GAMING: 2x
      WHEN grid_x >= 20 AND grid_y < 20 THEN 2  -- BUSINESS: 2x
      WHEN grid_x < 20 AND grid_y >= 20 THEN 2  -- SOCIAL: 2x
      WHEN dist_from_center >= 8 AND dist_from_center < 16 THEN 1.5 -- RESIDENTIAL: 1.5x
      ELSE 1                                     -- PUBLIC: 1x
    END
  ) as base_price_void,
  'FOR_SALE' as status,
  'GENESIS' as creation_source
FROM parcel_grid;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to confirm data integrity:

-- Total parcels (should be 1,600)
-- SELECT COUNT(*) FROM parcels;

-- Tier distribution
-- SELECT tier, COUNT(*) FROM parcels GROUP BY tier;

-- District distribution
-- SELECT district, COUNT(*) FROM parcels GROUP BY district;

-- Founder plots (should be ~16-20)
-- SELECT COUNT(*) FROM parcels WHERE is_founder_plot = true;

-- Price range
-- SELECT 
--   tier,
--   MIN(base_price_void / 1000000000000000000::NUMERIC) as min_eth,
--   MAX(base_price_void / 1000000000000000000::NUMERIC) as max_eth
-- FROM parcels
-- GROUP BY tier;

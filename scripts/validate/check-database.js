#!/usr/bin/env node

/**
 * @title Database Validation Helper
 * @notice Validates PostgreSQL/Supabase database setup for VOID deployment
 * @dev Part of Week 4 deployment automation
 * 
 * Usage:
 *   node scripts/validate/check-database.js          # Full validation
 *   node scripts/validate/check-database.js --quick  # Quick check only
 */

const { execSync } = require('child_process');
require('dotenv').config();

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  expectedParcelCount: 1600,
  expectedDistricts: 5,
  districtCounts: {
    'DEFI_DISTRICT': 300,
    'CREATOR_QUARTER': 300,
    'AI_OPS_ZONE': 300,
    'VOID_WASTES': 200,
    'SIGNAL_PEAKS': 200,
    'UNASSIGNED': 300
  }
};

// ============================================================================
// UTILITIES
// ============================================================================

function log(msg, type = 'info') {
  const icons = {
    info: 'ℹ️ ',
    success: '✅',
    warn: '⚠️ ',
    error: '❌'
  };
  console.log(`${icons[type] || ''} ${msg}`);
}

function section(title) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  ${title.toUpperCase()}`);
  console.log(`${'═'.repeat(60)}\n`);
}

function runQuery(query, silent = false) {
  try {
    const command = `psql "${process.env.DATABASE_URL}" -t -c "${query}"`;
    const output = execSync(command, { 
      encoding: 'utf-8',
      stdio: silent ? 'pipe' : 'inherit'
    });
    return { success: true, output: output.trim() };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================================================
// VALIDATION CHECKS
// ============================================================================

async function checkDatabaseConnection() {
  section('1. Database Connection Test');
  
  if (!process.env.DATABASE_URL) {
    log('DATABASE_URL not set in .env file', 'error');
    log('Add: DATABASE_URL=postgresql://...', 'info');
    return false;
  }
  
  log('Testing connection...');
  
  const result = runQuery('SELECT version();', true);
  
  if (result.success) {
    log('Database connection successful', 'success');
    log(`PostgreSQL version: ${result.output.split('\n')[0]}`);
    return true;
  } else {
    log('Database connection failed', 'error');
    log('Check DATABASE_URL format and credentials', 'info');
    return false;
  }
}

async function checkLandParcelsTable() {
  section('2. Land Parcels Table Check');
  
  log('Checking if land_parcels table exists...');
  
  const result = runQuery(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = 'land_parcels'
    );
  `, true);
  
  if (!result.success) {
    log('Failed to check table existence', 'error');
    return false;
  }
  
  const exists = result.output.includes('t');
  
  if (exists) {
    log('land_parcels table exists', 'success');
    return true;
  } else {
    log('land_parcels table does not exist', 'warn');
    log('Run migration: psql $DATABASE_URL -f migrations/001_land_grid_setup.sql', 'info');
    return false;
  }
}

async function checkParcelCount() {
  section('3. Parcel Count Validation');
  
  log(`Expected: ${CONFIG.expectedParcelCount} parcels`);
  
  const result = runQuery('SELECT COUNT(*) FROM land_parcels;', true);
  
  if (!result.success) {
    log('Failed to count parcels', 'error');
    return false;
  }
  
  const count = parseInt(result.output.trim());
  log(`Found: ${count} parcels`);
  
  if (count === CONFIG.expectedParcelCount) {
    log('Parcel count correct', 'success');
    return true;
  } else if (count === 0) {
    log('No parcels found - migration not run', 'warn');
    log('Run migration: psql $DATABASE_URL -f migrations/001_land_grid_setup.sql', 'info');
    return false;
  } else {
    log(`Unexpected count (expected ${CONFIG.expectedParcelCount})`, 'warn');
    return false;
  }
}

async function checkDistrictDistribution() {
  section('4. District Distribution Check');
  
  const result = runQuery(`
    SELECT district, COUNT(*) as count
    FROM land_parcels
    GROUP BY district
    ORDER BY district;
  `, true);
  
  if (!result.success) {
    log('Failed to check district distribution', 'error');
    return false;
  }
  
  const lines = result.output.split('\n').filter(l => l.trim());
  
  log('District breakdown:');
  
  let allCorrect = true;
  
  lines.forEach(line => {
    const [district, countStr] = line.split('|').map(s => s.trim());
    const count = parseInt(countStr);
    const expected = CONFIG.districtCounts[district];
    
    if (expected === count) {
      log(`  ${district}: ${count} parcels ✅`, 'info');
    } else {
      log(`  ${district}: ${count} parcels (expected ${expected}) ⚠️`, 'warn');
      allCorrect = false;
    }
  });
  
  if (allCorrect) {
    log('All districts have correct parcel counts', 'success');
    return true;
  } else {
    log('Some districts have incorrect counts', 'warn');
    return false;
  }
}

async function checkGridCoordinates() {
  section('5. Grid Coordinate Validation');
  
  log('Checking coordinate bounds (0-39, 0-39)...');
  
  const result = runQuery(`
    SELECT 
      MIN(x) as min_x, MAX(x) as max_x,
      MIN(y) as min_y, MAX(y) as max_y
    FROM land_parcels;
  `, true);
  
  if (!result.success) {
    log('Failed to check coordinates', 'error');
    return false;
  }
  
  const [header, values] = result.output.split('\n').filter(l => l.trim());
  const [minX, maxX, minY, maxY] = values.split('|').map(s => parseInt(s.trim()));
  
  log(`X range: ${minX} to ${maxX}`);
  log(`Y range: ${minY} to ${maxY}`);
  
  if (minX === 0 && maxX === 39 && minY === 0 && maxY === 39) {
    log('Grid coordinates correct (40×40)', 'success');
    return true;
  } else {
    log('Grid coordinates out of bounds', 'warn');
    return false;
  }
}

async function checkIndexes() {
  section('6. Index Validation');
  
  log('Checking database indexes...');
  
  const result = runQuery(`
    SELECT indexname 
    FROM pg_indexes 
    WHERE tablename = 'land_parcels';
  `, true);
  
  if (!result.success) {
    log('Failed to check indexes', 'error');
    return false;
  }
  
  const indexes = result.output.split('\n').filter(l => l.trim());
  
  const expectedIndexes = [
    'idx_land_parcels_coordinates',
    'idx_land_parcels_district',
    'idx_land_parcels_owner',
    'idx_land_parcels_claimed'
  ];
  
  log(`Found ${indexes.length} indexes:`);
  
  let allPresent = true;
  
  expectedIndexes.forEach(expected => {
    const present = indexes.some(idx => idx.includes(expected));
    if (present) {
      log(`  ${expected} ✅`, 'info');
    } else {
      log(`  ${expected} ❌`, 'warn');
      allPresent = false;
    }
  });
  
  if (allPresent) {
    log('All indexes present', 'success');
    return true;
  } else {
    log('Some indexes missing', 'warn');
    log('Indexes improve query performance for HUD', 'info');
    return false;
  }
}

async function checkSampleParcels() {
  section('7. Sample Parcel Data');
  
  log('Fetching sample parcels...');
  
  const result = runQuery(`
    SELECT x, y, district, base_price, is_claimed
    FROM land_parcels
    ORDER BY RANDOM()
    LIMIT 5;
  `, true);
  
  if (!result.success) {
    log('Failed to fetch sample parcels', 'error');
    return false;
  }
  
  console.log(result.output);
  
  return true;
}

async function generateReport() {
  section('8. Validation Summary');
  
  const checks = [
    { name: 'Database Connection', fn: checkDatabaseConnection },
    { name: 'Land Parcels Table', fn: checkLandParcelsTable },
    { name: 'Parcel Count', fn: checkParcelCount },
    { name: 'District Distribution', fn: checkDistrictDistribution },
    { name: 'Grid Coordinates', fn: checkGridCoordinates },
    { name: 'Database Indexes', fn: checkIndexes },
    { name: 'Sample Data', fn: checkSampleParcels }
  ];
  
  const results = {};
  let passedCount = 0;
  
  for (const check of checks) {
    const passed = await check.fn();
    results[check.name] = passed;
    if (passed) passedCount++;
  }
  
  section('Final Report');
  
  log(`Checks passed: ${passedCount}/${checks.length}`);
  log(`Checks failed: ${checks.length - passedCount}/${checks.length}`);
  
  if (passedCount === checks.length) {
    log('\n✅ DATABASE READY FOR DEPLOYMENT', 'success');
    log('Land grid fully configured and validated');
    return true;
  } else if (passedCount >= 2) {
    log('\n⚠️  DATABASE PARTIALLY READY', 'warn');
    log('Some non-critical checks failed');
    log('Review failures above and fix if needed');
    return false;
  } else {
    log('\n❌ DATABASE NOT READY', 'error');
    log('Critical checks failed');
    log('Run migration: psql $DATABASE_URL -f migrations/001_land_grid_setup.sql');
    return false;
  }
}

// ============================================================================
// QUICK CHECK
// ============================================================================

async function quickCheck() {
  section('Quick Database Check');
  
  if (!process.env.DATABASE_URL) {
    log('DATABASE_URL not set', 'error');
    return false;
  }
  
  const result = runQuery('SELECT COUNT(*) FROM land_parcels;', true);
  
  if (!result.success) {
    log('Database connection failed or table missing', 'error');
    log('Run full check: node scripts/validate/check-database.js', 'info');
    return false;
  }
  
  const count = parseInt(result.output.trim());
  
  if (count === CONFIG.expectedParcelCount) {
    log(`✅ Database OK (${count} parcels)`, 'success');
    return true;
  } else if (count === 0) {
    log('⚠️  Table exists but empty (migration not run)', 'warn');
    return false;
  } else {
    log(`⚠️  Unexpected parcel count: ${count}`, 'warn');
    return false;
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const quick = args.includes('--quick') || args.includes('-q');
  
  console.log('VOID Database Validation Tool\n');
  
  if (quick) {
    await quickCheck();
  } else {
    await generateReport();
  }
}

// Run
if (require.main === module) {
  main().catch(error => {
    log(`Fatal error: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = { 
  checkDatabaseConnection,
  checkLandParcelsTable,
  checkParcelCount,
  checkDistrictDistribution 
};

/**
 * Fee Distribution Simulation - Week 1 Economic Validation
 * 
 * Simulates 10,000 cosmetic purchases @ $10 USDC each
 * Validates finalized fee split accuracy
 * Outputs: FeeDistributionReport_Week1_Sim.json
 */

import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

// ============ SIMULATION PARAMETERS ============
const SIMULATION_PARAMS = {
  totalPurchases: 10000,
  avgPurchasePrice: 10, // $10 USDC
  usdcDecimals: 6,
  simulationName: 'Week 1 Economic Validation',
  timestamp: new Date().toISOString(),
};

// ============ FEE CONSTANTS (MATCH CONTRACT) ============
const FEE_SPLITS = {
  CREATOR: 0.40,      // 40%
  STAKERS: 0.20,      // 20%
  PSX_TREASURY: 0.10, // 10%
  CREATE_TREASURY: 0.10, // 10%
  AGENCY: 0.10,       // 10%
  GRANTS: 0.05,       // 5%
  SECURITY: 0.05,     // 5%
};

// ============ RECIPIENT CATEGORIES ============
const RECIPIENTS = [
  { name: 'Creator Royalties', share: FEE_SPLITS.CREATOR, category: 'L2_ACTIVITY' },
  { name: 'xVOID Stakers', share: FEE_SPLITS.STAKERS, category: 'L2_ACTIVITY' },
  { name: 'PSX Treasury', share: FEE_SPLITS.PSX_TREASURY, category: 'L3_GOVERNANCE' },
  { name: 'CREATE Treasury', share: FEE_SPLITS.CREATE_TREASURY, category: 'L3_GOVERNANCE' },
  { name: 'Agency Operations', share: FEE_SPLITS.AGENCY, category: 'L4_OPERATIONS' },
  { name: 'Creator Grants Vault', share: FEE_SPLITS.GRANTS, category: 'L4_RENEWAL' },
  { name: 'Security Reserve', share: FEE_SPLITS.SECURITY, category: 'L4_SAFETY' },
];

// ============ VALIDATION FUNCTIONS ============
function validateFeeSum(): boolean {
  const total = Object.values(FEE_SPLITS).reduce((sum, share) => sum + share, 0);
  return Math.abs(total - 1.0) < 0.0001; // Allow floating point tolerance
}

function formatUSDC(amount: number): string {
  return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`;
}

function formatPercentage(decimal: number): string {
  return `${(decimal * 100).toFixed(2)}%`;
}

// ============ MAIN SIMULATION ============
function runFeeDistributionSimulation() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🧮 VOID FEE DISTRIBUTION SIMULATION - WEEK 1');
  console.log('═══════════════════════════════════════════════════════\n');

  // Validate fee sum
  if (!validateFeeSum()) {
    console.error('❌ ERROR: Fee splits do not sum to 100%');
    console.error('Current sum:', Object.values(FEE_SPLITS).reduce((a, b) => a + b, 0));
    process.exit(1);
  }
  console.log('✅ Fee sum validation: PASSED (100.00%)\n');

  // Calculate total revenue
  const totalRevenue = SIMULATION_PARAMS.totalPurchases * SIMULATION_PARAMS.avgPurchasePrice;
  console.log(`📊 Simulation Parameters:`);
  console.log(`   Total Purchases: ${SIMULATION_PARAMS.totalPurchases.toLocaleString()}`);
  console.log(`   Avg Purchase Price: $${SIMULATION_PARAMS.avgPurchasePrice}`);
  console.log(`   Total Revenue: ${formatUSDC(totalRevenue)}\n`);

  // Calculate distributions
  const distributions = RECIPIENTS.map(recipient => {
    const amount = totalRevenue * recipient.share;
    return {
      name: recipient.name,
      category: recipient.category,
      sharePercentage: formatPercentage(recipient.share),
      amount: amount,
      amountFormatted: formatUSDC(amount),
    };
  });

  // Print distribution table
  console.log('💰 Fee Distribution Breakdown:\n');
  console.log('┌─────────────────────────────┬──────────┬─────────────────┬──────────────┐');
  console.log('│ Recipient                   │ Share    │ Amount (USDC)   │ Category     │');
  console.log('├─────────────────────────────┼──────────┼─────────────────┼──────────────┤');
  
  distributions.forEach(dist => {
    const name = dist.name.padEnd(27);
    const share = dist.sharePercentage.padStart(8);
    const amount = dist.amountFormatted.padStart(15);
    const category = dist.category.padEnd(12);
    console.log(`│ ${name} │ ${share} │ ${amount} │ ${category} │`);
  });
  
  console.log('└─────────────────────────────┴──────────┴─────────────────┴──────────────┘\n');

  // Category summaries
  const categoryTotals = distributions.reduce((acc, dist) => {
    if (!acc[dist.category]) acc[dist.category] = 0;
    acc[dist.category] += dist.amount;
    return acc;
  }, {} as Record<string, number>);

  console.log('📈 Category Summaries:\n');
  Object.entries(categoryTotals).forEach(([category, total]) => {
    console.log(`   ${category}: ${formatUSDC(total)} (${formatPercentage(total / totalRevenue)})`);
  });
  console.log('');

  // Economic projections
  console.log('🎯 Economic Impact Projections:\n');
  
  // Creator earnings (assuming 100 unique creators, power law distribution)
  const avgCreatorCount = 100;
  const topCreatorShare = 0.6; // Top 10% creators earn 60% of total
  const totalCreatorRevenue = totalRevenue * FEE_SPLITS.CREATOR;
  const topCreatorRevenue = totalCreatorRevenue * topCreatorShare / (avgCreatorCount * 0.1);
  const avgCreatorRevenue = totalCreatorRevenue / avgCreatorCount;
  
  console.log(`   Top Creator Revenue (10%): ${formatUSDC(topCreatorRevenue)}/creator`);
  console.log(`   Avg Creator Revenue: ${formatUSDC(avgCreatorRevenue)}/creator\n`);

  // Staking yield projections
  const totalStakerRevenue = totalRevenue * FEE_SPLITS.STAKERS;
  const assumedTVL = 500000; // $500k TVL
  const aprBoost = (totalStakerRevenue / assumedTVL) * 52; // Annualized (weekly * 52)
  
  console.log(`   Staker APR Boost: +${(aprBoost * 100).toFixed(2)}% (assuming $500k TVL)`);
  console.log(`   Weekly Staker Distribution: ${formatUSDC(totalStakerRevenue)}\n`);

  // Treasury runway
  const combinedTreasuryRevenue = totalRevenue * (FEE_SPLITS.PSX_TREASURY + FEE_SPLITS.CREATE_TREASURY);
  const weeklyOpex = 5000; // Assumed $5k/week operational costs
  const weeksOfRunway = combinedTreasuryRevenue / weeklyOpex;
  
  console.log(`   Combined Treasury Inflow: ${formatUSDC(combinedTreasuryRevenue)}/week`);
  console.log(`   Estimated Runway (@ $5k/week opex): ${weeksOfRunway.toFixed(1)} weeks\n`);

  // Agency growth metrics
  const agencyRevenue = totalRevenue * FEE_SPLITS.AGENCY;
  console.log(`   Agency Operations Budget: ${formatUSDC(agencyRevenue)}/week`);
  console.log(`   → Marketing, partnerships, creator acquisition\n`);

  // Grant distribution
  const grantsRevenue = totalRevenue * FEE_SPLITS.GRANTS;
  const avgGrantSize = 500; // $500/grant
  const grantsPerWeek = grantsRevenue / avgGrantSize;
  
  console.log(`   Creator Grants Pool: ${formatUSDC(grantsRevenue)}/week`);
  console.log(`   → Can fund ~${Math.floor(grantsPerWeek)} new creators @ $${avgGrantSize}/grant\n`);

  // Security budget
  const securityRevenue = totalRevenue * FEE_SPLITS.SECURITY;
  console.log(`   Security Reserve: ${formatUSDC(securityRevenue)}/week`);
  console.log(`   → Audits, AI uptime, emergency contracts\n`);

  // 12-week projections
  console.log('📅 12-Week Cumulative Projections:\n');
  const weeks12Revenue = totalRevenue * 12;
  const weeks12Distributions = distributions.map(dist => ({
    name: dist.name,
    amount: formatUSDC(dist.amount * 12),
  }));
  
  weeks12Distributions.forEach(dist => {
    console.log(`   ${dist.name}: ${dist.amount}`);
  });
  console.log('');

  // Gas optimization notes
  console.log('⛽ Gas Optimization Notes:\n');
  console.log('   - Current: 7 separate transfers per purchase (~150k gas)');
  console.log('   - Potential optimization: Batch transfers to reduce to ~100k gas');
  console.log('   - Consider: Merkle tree claims for small amounts (<$1)\n');

  // Generate JSON report
  const report = {
    metadata: {
      simulationName: SIMULATION_PARAMS.simulationName,
      timestamp: SIMULATION_PARAMS.timestamp,
      parameters: SIMULATION_PARAMS,
    },
    validation: {
      feeSumCorrect: validateFeeSum(),
      totalFeePercentage: '100.00%',
      recipients: RECIPIENTS.length,
    },
    totalRevenue: {
      amount: totalRevenue,
      formatted: formatUSDC(totalRevenue),
    },
    distributions: distributions.map(dist => ({
      recipient: dist.name,
      category: dist.category,
      sharePercentage: dist.sharePercentage,
      amount: dist.amount,
      amountFormatted: dist.amountFormatted,
    })),
    categoryTotals: Object.entries(categoryTotals).map(([category, total]) => ({
      category,
      amount: total,
      amountFormatted: formatUSDC(total),
      percentage: formatPercentage(total / totalRevenue),
    })),
    economicImpact: {
      topCreatorRevenue: topCreatorRevenue,
      avgCreatorRevenue: avgCreatorRevenue,
      stakerAPRBoost: formatPercentage(aprBoost),
      treasuryRunwayWeeks: weeksOfRunway,
      agencyWeeklyBudget: agencyRevenue,
      grantsPerWeek: Math.floor(grantsPerWeek),
    },
    projections12Week: weeks12Distributions,
    gasOptimization: {
      currentGasPerTx: '~150k',
      potentialOptimization: '~100k (batching)',
      recommendation: 'Implement batch transfers for amounts >$10',
    },
  };

  // Write JSON report
  const outputDir = path.join(process.cwd(), 'scripts', 'simulate');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputPath = path.join(outputDir, 'FeeDistributionReport_Week1_Sim.json');
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  
  console.log(`✅ Simulation report saved to: ${outputPath}\n`);
  console.log('═══════════════════════════════════════════════════════');
  console.log('✅ SIMULATION COMPLETE - ALL VALIDATIONS PASSED');
  console.log('═══════════════════════════════════════════════════════\n');

  return report;
}

// ============ EXECUTION ============
try {
  runFeeDistributionSimulation();
  process.exit(0);
} catch (error) {
  console.error('❌ Simulation failed:', error);
  process.exit(1);
}

export { runFeeDistributionSimulation, FEE_SPLITS, RECIPIENTS };

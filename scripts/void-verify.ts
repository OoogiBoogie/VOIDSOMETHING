#!/usr/bin/env ts-node
/**
 * VOID System Verification Script
 * 
 * Run full system self-check and output results
 * Usage: npm run void:verify
 */

import { runVoidSelfCheck, formatCheckReport } from '../lib/voidSelfCheck.js';

async function main() {
  console.log('\n🔍 Running VOID System Self-Check...\n');
  
  const report = runVoidSelfCheck();
  const formatted = formatCheckReport(report);
  
  console.log(formatted);
  
  if (report.passed) {
    console.log('✅ All checks passed! System is ready.\n');
    process.exit(0);
  } else {
    console.log('❌ Some checks failed. Review the report above.\n');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error running system check:', error);
  process.exit(1);
});

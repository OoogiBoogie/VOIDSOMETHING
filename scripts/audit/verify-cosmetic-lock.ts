/**
 * @title Cosmetics Lock Verification Script
 * @notice Verifies cosmetics system remains locked until Phase 2 approval gate
 * 
 * Week 3 Track 4: Cosmetics Lock Verification
 * 
 * Validates:
 * - CosmeticContext returns null/empty state only
 * - useCosmetics hook logs warnings
 * - Creator Hub displays LOCKED badges
 * - No ERC-1155 mint calls in codebase
 * - No IPFS upload integration
 * 
 * Outputs: COSMETICS_LOCK_AUDIT_WEEK3.json
 * 
 * Usage:
 * npx ts-node scripts/audit/verify-cosmetic-lock.ts
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

// ============ TYPES ============
interface LockCheckResult {
  check: string;
  passed: boolean;
  details: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
}

interface AuditReport {
  auditedAt: string;
  version: string;
  lockStatus: "LOCKED" | "UNLOCKED" | "PARTIAL";
  overallPassed: boolean;
  results: LockCheckResult[];
  unlockConditions: {
    hudCoreStatus: string;
    contractDeployment: string;
    aiServices: string;
  };
  summary: {
    totalChecks: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

// ============ HELPER FUNCTIONS ============
function grepCodebase(pattern: string, filePattern: string = "**/*.{ts,tsx}"): string[] {
  try {
    const result = execSync(
      `grep -r "${pattern}" --include="${filePattern}" . || true`,
      { encoding: "utf-8", cwd: path.join(__dirname, "..", "..") }
    );
    return result.split("\n").filter(line => line.trim().length > 0);
  } catch (error) {
    return [];
  }
}

function fileExists(filePath: string): boolean {
  return fs.existsSync(path.join(__dirname, "..", "..", filePath));
}

function readFileContent(filePath: string): string {
  const fullPath = path.join(__dirname, "..", "..", filePath);
  if (!fs.existsSync(fullPath)) {
    return "";
  }
  return fs.readFileSync(fullPath, "utf-8");
}

// ============ VERIFICATION CHECKS ============
async function runLockVerification(): Promise<AuditReport> {
  console.log("🔒 COSMETICS LOCK VERIFICATION (Week 3)\n");
  console.log("=" . repeat(60));
  
  const results: LockCheckResult[] = [];
  
  // ============ CHECK 1: CosmeticContext Existence & Lock State ============
  console.log("🔍 Check 1: CosmeticContext lock state...\n");
  
  const cosmeticContextPath = "contexts/CosmeticContext.tsx";
  if (!fileExists(cosmeticContextPath)) {
    results.push({
      check: "CosmeticContext.tsx exists",
      passed: false,
      details: "File not found - cosmetics system not initialized",
      severity: "CRITICAL",
    });
  } else {
    const contextContent = readFileContent(cosmeticContextPath);
    
    // Check for locked state
    const hasLockedState = contextContent.includes("isLocked: true") || 
                          contextContent.includes("isLocked = true");
    const hasEmptyInventory = contextContent.includes("ownedCosmetics: []") || 
                              contextContent.includes("ownedCosmetics = []");
    const hasNullLoadout = contextContent.includes("currentLoadout: {") && 
                          contextContent.includes("null");
    
    if (hasLockedState && hasEmptyInventory && hasNullLoadout) {
      results.push({
        check: "CosmeticContext locked state",
        passed: true,
        details: "✅ Context returns isLocked=true, empty inventory, null loadout",
        severity: "INFO",
      });
      console.log("✅ CosmeticContext is locked\n");
    } else {
      results.push({
        check: "CosmeticContext locked state",
        passed: false,
        details: `❌ Lock state incomplete - isLocked: ${hasLockedState}, emptyInventory: ${hasEmptyInventory}, nullLoadout: ${hasNullLoadout}`,
        severity: "CRITICAL",
      });
      console.log("❌ CosmeticContext lock state invalid\n");
    }
    
    // Check for warning logs
    const hasWarningLog = contextContent.includes("console.warn") && 
                         contextContent.includes("locked until Phase 2");
    results.push({
      check: "CosmeticContext warning logs",
      passed: hasWarningLog,
      details: hasWarningLog 
        ? "✅ Context logs lock warnings" 
        : "⚠️  No warning logs found",
      severity: hasWarningLog ? "INFO" : "WARNING",
    });
  }
  
  // ============ CHECK 2: useCosmetics Hook Lock ============
  console.log("🔍 Check 2: useCosmetics hook lock state...\n");
  
  const useCosmeticsPath = "hooks/useCosmetics.ts";
  if (!fileExists(useCosmeticsPath)) {
    results.push({
      check: "useCosmetics.ts exists",
      passed: false,
      details: "File not found - hook not initialized",
      severity: "CRITICAL",
    });
  } else {
    const hookContent = readFileContent(useCosmeticsPath);
    
    // Check for locked utility functions
    const hasOwnsCheck = hookContent.includes("ownsCosmetic") && 
                        hookContent.includes("return false");
    const hasEquippedCheck = hookContent.includes("isCosmeticEquipped") && 
                            hookContent.includes("return false");
    
    if (hasOwnsCheck && hasEquippedCheck) {
      results.push({
        check: "useCosmetics locked utilities",
        passed: true,
        details: "✅ ownsCosmetic() and isCosmeticEquipped() return false",
        severity: "INFO",
      });
      console.log("✅ useCosmetics hook is locked\n");
    } else {
      results.push({
        check: "useCosmetics locked utilities",
        passed: false,
        details: "❌ Hook utilities not properly locked",
        severity: "CRITICAL",
      });
      console.log("❌ useCosmetics hook lock invalid\n");
    }
  }
  
  // ============ CHECK 3: Creator Hub LOCKED Badges ============
  console.log("🔍 Check 3: Creator Hub LOCKED badges...\n");
  
  const creatorHubPath = "components/hud/hubs/CreatorHub.tsx";
  if (!fileExists(creatorHubPath)) {
    results.push({
      check: "CreatorHub.tsx exists",
      passed: false,
      details: "File not found",
      severity: "CRITICAL",
    });
  } else {
    const hubContent = readFileContent(creatorHubPath);
    const hasLockedBadge = hubContent.includes("LOCKED") || 
                          hubContent.includes("🔒");
    
    results.push({
      check: "Creator Hub LOCKED badges",
      passed: hasLockedBadge,
      details: hasLockedBadge 
        ? "✅ LOCKED badges present in Creator Hub" 
        : "⚠️  No LOCKED badges found",
      severity: hasLockedBadge ? "INFO" : "WARNING",
    });
    
    if (hasLockedBadge) {
      console.log("✅ Creator Hub displays LOCKED badges\n");
    } else {
      console.log("⚠️  No LOCKED badges in Creator Hub\n");
    }
  }
  
  // ============ CHECK 4: No ERC-1155 Mint Calls ============
  console.log("🔍 Check 4: Scanning for ERC-1155 mint calls...\n");
  
  const erc1155Calls = grepCodebase("\\.mint\\(", "**/*.{ts,tsx}");
  const skuFactoryCalls = erc1155Calls.filter(line => 
    line.includes("SKUFactory") || 
    line.includes("skuFactory") ||
    line.includes("createSKU")
  );
  
  if (skuFactoryCalls.length === 0) {
    results.push({
      check: "No ERC-1155 mint calls",
      passed: true,
      details: "✅ No SKUFactory.mint() or createSKU() calls found in codebase",
      severity: "INFO",
    });
    console.log("✅ No ERC-1155 mint calls found\n");
  } else {
    results.push({
      check: "No ERC-1155 mint calls",
      passed: false,
      details: `❌ Found ${skuFactoryCalls.length} SKUFactory mint calls:\n${skuFactoryCalls.slice(0, 5).join("\n")}`,
      severity: "CRITICAL",
    });
    console.log(`❌ Found ${skuFactoryCalls.length} ERC-1155 mint calls\n`);
  }
  
  // ============ CHECK 5: No IPFS Upload Integration ============
  console.log("🔍 Check 5: Scanning for IPFS upload integration...\n");
  
  const ipfsCalls = grepCodebase("ipfs\\.|IPFS|uploadTo", "**/*.{ts,tsx}");
  const cosmenticIPFS = ipfsCalls.filter(line => 
    line.includes("cosmetic") || 
    line.includes("SKU") ||
    line.includes("metadata")
  );
  
  if (cosmenticIPFS.length === 0) {
    results.push({
      check: "No IPFS upload integration",
      passed: true,
      details: "✅ No IPFS upload calls for cosmetics found",
      severity: "INFO",
    });
    console.log("✅ No IPFS upload integration found\n");
  } else {
    results.push({
      check: "No IPFS upload integration",
      passed: false,
      details: `❌ Found ${cosmenticIPFS.length} IPFS upload calls:\n${cosmenticIPFS.slice(0, 5).join("\n")}`,
      severity: "CRITICAL",
    });
    console.log(`❌ Found ${cosmenticIPFS.length} IPFS upload calls\n`);
  }
  
  // ============ CHECK 6: No Cosmetic Purchase Integration ============
  console.log("🔍 Check 6: Scanning for cosmetic purchase integration...\n");
  
  const purchaseCalls = grepCodebase("purchaseCosmetic|buyCosmetic|purchaseSKU", "**/*.{ts,tsx}");
  const activePurchases = purchaseCalls.filter(line => 
    !line.includes("//") && 
    !line.includes("throws") &&
    !line.includes("throw new Error")
  );
  
  if (activePurchases.length === 0 || purchaseCalls.every(line => line.includes("throw"))) {
    results.push({
      check: "No cosmetic purchase integration",
      passed: true,
      details: "✅ No active purchase functions (all throw errors)",
      severity: "INFO",
    });
    console.log("✅ No active purchase integration\n");
  } else {
    results.push({
      check: "No cosmetic purchase integration",
      passed: false,
      details: `⚠️  Found ${activePurchases.length} purchase calls (may be placeholders)`,
      severity: "WARNING",
    });
    console.log(`⚠️  Found ${activePurchases.length} purchase calls\n`);
  }
  
  // ============ CHECK 7: Lock Conditions Status ============
  console.log("🔍 Check 7: Checking unlock conditions...\n");
  
  const contextContent = readFileContent(cosmeticContextPath);
  
  let hudCoreStatus = "pending";
  let contractDeployment = "pending";
  let aiServices = "pending";
  
  // Extract unlock conditions from context
  if (contextContent.includes("hudCoreStatus")) {
    const hudMatch = contextContent.match(/hudCoreStatus:\s*["'](\w+)["']/);
    if (hudMatch) hudCoreStatus = hudMatch[1];
  }
  if (contextContent.includes("contractDeployment")) {
    const contractMatch = contextContent.match(/contractDeployment:\s*["'](\w+)["']/);
    if (contractMatch) contractDeployment = contractMatch[1];
  }
  if (contextContent.includes("aiServices")) {
    const aiMatch = contextContent.match(/aiServices:\s*["'](\w+)["']/);
    if (aiMatch) aiServices = aiMatch[1];
  }
  
  const allPending = hudCoreStatus === "pending" && 
                    contractDeployment === "pending" && 
                    aiServices === "pending";
  
  results.push({
    check: "Unlock conditions status",
    passed: allPending,
    details: allPending 
      ? "✅ All conditions = pending (locked)" 
      : `⚠️  Conditions: HUD=${hudCoreStatus}, Contracts=${contractDeployment}, AI=${aiServices}`,
    severity: allPending ? "INFO" : "WARNING",
  });
  
  console.log(`Unlock Conditions:`);
  console.log(`   HUD Core: ${hudCoreStatus}`);
  console.log(`   Contracts: ${contractDeployment}`);
  console.log(`   AI Services: ${aiServices}\n`);
  
  // ============ GENERATE REPORT ============
  console.log("=" . repeat(60));
  console.log("📊 Generating audit report...\n");
  
  const passedChecks = results.filter(r => r.passed).length;
  const failedChecks = results.filter(r => !r.passed && r.severity !== "WARNING").length;
  const warnings = results.filter(r => !r.passed && r.severity === "WARNING").length;
  
  const overallLockStatus: "LOCKED" | "UNLOCKED" | "PARTIAL" = 
    failedChecks === 0 ? "LOCKED" : (failedChecks >= 3 ? "UNLOCKED" : "PARTIAL");
  
  const report: AuditReport = {
    auditedAt: new Date().toISOString(),
    version: "Week 3",
    lockStatus: overallLockStatus,
    overallPassed: failedChecks === 0,
    results,
    unlockConditions: {
      hudCoreStatus,
      contractDeployment,
      aiServices,
    },
    summary: {
      totalChecks: results.length,
      passed: passedChecks,
      failed: failedChecks,
      warnings,
    },
  };
  
  // ============ SAVE REPORT ============
  const outputDir = path.join(__dirname, "..", "..", "logs", "audit");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputPath = path.join(outputDir, "COSMETICS_LOCK_AUDIT_WEEK3.json");
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  
  console.log("✅ Audit report saved to:", outputPath, "\n");
  
  return report;
}

// ============ DISPLAY RESULTS ============
async function displayResults(report: AuditReport) {
  console.log("=" . repeat(60));
  console.log("📋 COSMETICS LOCK AUDIT SUMMARY\n");
  
  console.log(`Lock Status: ${report.lockStatus === "LOCKED" ? "🔒 LOCKED ✅" : 
               report.lockStatus === "PARTIAL" ? "⚠️  PARTIAL LOCK" : 
               "❌ UNLOCKED"}\n`);
  
  console.log(`Total Checks: ${report.summary.totalChecks}`);
  console.log(`✅ Passed: ${report.summary.passed}`);
  console.log(`❌ Failed: ${report.summary.failed}`);
  console.log(`⚠️  Warnings: ${report.summary.warnings}\n`);
  
  console.log("Unlock Conditions:");
  console.log(`   HUD Core: ${report.unlockConditions.hudCoreStatus}`);
  console.log(`   Contract Deployment: ${report.unlockConditions.contractDeployment}`);
  console.log(`   AI Services: ${report.unlockConditions.aiServices}\n`);
  
  if (report.summary.failed > 0) {
    console.log("❌ Failed Checks:\n");
    report.results
      .filter(r => !r.passed && r.severity === "CRITICAL")
      .forEach(r => {
        console.log(`   • ${r.check}`);
        console.log(`     ${r.details}\n`);
      });
  }
  
  if (report.summary.warnings > 0) {
    console.log("⚠️  Warnings:\n");
    report.results
      .filter(r => r.severity === "WARNING")
      .forEach(r => {
        console.log(`   • ${r.check}`);
        console.log(`     ${r.details}\n`);
      });
  }
  
  console.log("=" . repeat(60));
  
  if (report.lockStatus === "LOCKED") {
    console.log("🎉 Cosmetics system successfully locked! ✅\n");
    console.log("✅ COSMETICS_LOCK = VERIFIED");
    console.log("⏸️  Awaiting Phase 2 approval gate\n");
  } else if (report.lockStatus === "PARTIAL") {
    console.log("⚠️  Cosmetics system partially locked - review warnings\n");
  } else {
    console.log("❌ Cosmetics system NOT locked - critical issues detected\n");
    console.log("🚨 Phase 2 deployment BLOCKED until lock verified\n");
    process.exit(1);
  }
}

// ============ MAIN ============
async function main() {
  try {
    const report = await runLockVerification();
    await displayResults(report);
  } catch (error) {
    console.error("❌ Audit failed:", error);
    process.exit(1);
  }
}

main();

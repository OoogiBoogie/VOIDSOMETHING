'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';

interface ValidationResult {
  allDeployed: boolean;
  contractStatus: Array<{
    name: string;
    address: string;
    configured: boolean;
  }>;
  abiValidation: {
    valid: boolean;
    errors: string[];
  };
}

export default function TestSeasonalPage() {
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function runValidation() {
      try {
        // Import the configuration module
        const config = await import('@/config/burnContractsSeasonal');

        // Run all validation checks
        const allDeployed = config.areBurnContractsDeployedSeasonal();
        
        // Get contract status
        const contracts = config.SEASONAL_BURN_CONTRACTS;
        const contractStatus = [
          { name: 'VoidBurnUtilitySeasonal', address: contracts.VoidBurnUtilitySeasonal.address, configured: !!contracts.VoidBurnUtilitySeasonal.address },
          { name: 'XPRewardSystemSeasonal', address: contracts.XPRewardSystemSeasonal.address, configured: !!contracts.XPRewardSystemSeasonal.address },
          { name: 'DistrictAccessBurnSeasonal', address: contracts.DistrictAccessBurnSeasonal.address, configured: !!contracts.DistrictAccessBurnSeasonal.address },
          { name: 'LandUpgradeBurnSeasonal', address: contracts.LandUpgradeBurnSeasonal.address, configured: !!contracts.LandUpgradeBurnSeasonal.address },
          { name: 'CreatorToolsBurnSeasonal', address: contracts.CreatorToolsBurnSeasonal.address, configured: !!contracts.CreatorToolsBurnSeasonal.address },
          { name: 'PrestigeBurnSeasonal', address: contracts.PrestigeBurnSeasonal.address, configured: !!contracts.PrestigeBurnSeasonal.address },
          { name: 'MiniAppBurnAccessSeasonal', address: contracts.MiniAppBurnAccessSeasonal.address, configured: !!contracts.MiniAppBurnAccessSeasonal.address },
        ];

        const abiValidation = config.validateSeasonalABIs();

        setResult({
          allDeployed,
          contractStatus,
          abiValidation,
        });
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setLoading(false);
      }
    }

    runValidation();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Running validation checks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h1>❌ Validation Error</h1>
          <p>{error}</p>
          <div className={styles.hint}>
            <strong>Possible causes:</strong>
            <ul>
              <li>ABIs not extracted (run the PowerShell script)</li>
              <li>Missing environment variables in .env.local</li>
              <li>Dev server needs restart</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const allPassed = result?.allDeployed && result?.abiValidation.valid;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🔥 Seasonal Burn System Validation</h1>
        <div className={allPassed ? styles.badgePass : styles.badgeFail}>
          {allPassed ? '✅ ALL TESTS PASSED' : '❌ VALIDATION FAILED'}
        </div>
      </div>

      {/* Test 1: All Contracts Deployed */}
      <div className={styles.section}>
        <h2>Test 1: All Contracts Configured</h2>
        <div className={result?.allDeployed ? styles.testPass : styles.testFail}>
          <span className={styles.icon}>{result?.allDeployed ? '✅' : '❌'}</span>
          <span className={styles.testLabel}>All Deployed:</span>
          <span className={styles.testValue}>{result?.allDeployed ? 'true' : 'false'}</span>
        </div>
      </div>

      {/* Test 2: Contract Status */}
      <div className={styles.section}>
        <h2>Test 2: Individual Contract Status</h2>
        <div className={styles.contractList}>
          {result?.contractStatus.map((contract) => (
            <div key={contract.name} className={contract.configured ? styles.contractPass : styles.contractFail}>
              <div className={styles.contractHeader}>
                <span className={styles.icon}>{contract.configured ? '✅' : '❌'}</span>
                <span className={styles.contractName}>{contract.name}</span>
              </div>
              <div className={styles.contractAddress}>
                {contract.configured ? contract.address : 'NOT CONFIGURED'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Test 3: ABI Validation */}
      <div className={styles.section}>
        <h2>Test 3: ABI Validation</h2>
        <div className={result?.abiValidation.valid ? styles.testPass : styles.testFail}>
          <span className={styles.icon}>{result?.abiValidation.valid ? '✅' : '❌'}</span>
          <span className={styles.testLabel}>ABIs Valid:</span>
          <span className={styles.testValue}>{result?.abiValidation.valid ? 'true' : 'false'}</span>
        </div>
        {result?.abiValidation.errors && result.abiValidation.errors.length > 0 && (
          <div className={styles.errors}>
            <strong>Errors:</strong>
            <ul>
              {result.abiValidation.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Next Steps */}
      <div className={styles.section}>
        <h2>Next Steps</h2>
        {allPassed ? (
          <div className={styles.nextSteps}>
            <p className={styles.success}>
              🎉 <strong>Frontend validation complete!</strong> All seasonal contracts are properly configured.
            </p>
            <p>You can now proceed to:</p>
            <ul>
              <li><strong>HUD Integration</strong> - Add seasonal UI to the HUD system</li>
              <li><strong>QA Testing</strong> - Run the 48 test cases from the QA plan</li>
            </ul>
            <p className={styles.instruction}>
              Tell the AI: <code>"Frontend validation PASS — move to HUD integration"</code> or <code>"Start T1 tests"</code>
            </p>
          </div>
        ) : (
          <div className={styles.nextSteps}>
            <p className={styles.fail}>
              ⚠️ <strong>Validation failed.</strong> Please check the errors above.
            </p>
            <p>Common fixes:</p>
            <ul>
              <li>Run the ABI extraction script in PowerShell</li>
              <li>Verify all environment variables in .env.local</li>
              <li>Restart the dev server</li>
            </ul>
            <p className={styles.instruction}>
              Report the specific error to the AI for help fixing it.
            </p>
          </div>
        )}
      </div>

      {/* Environment Info */}
      <div className={styles.footer}>
        <p><strong>Network:</strong> Base Sepolia (Chain ID 84532)</p>
        <p><strong>Season 0 Start Block:</strong> {process.env.NEXT_PUBLIC_SEASONAL_BURN_SEASON_START_BLOCK || 'Not configured'}</p>
        <p><strong>UI Enabled:</strong> {process.env.NEXT_PUBLIC_ENABLE_SEASONAL_BURN_UI || 'false'}</p>
      </div>
    </div>
  );
}

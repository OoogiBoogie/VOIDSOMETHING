# Quick Start - E2E Testing
# Run this after verifying the browser loads correctly

Write-Host "`n" -ForegroundColor Cyan
Write-Host "   PSX VOID - E2E TEST LAUNCHER" -ForegroundColor Cyan
Write-Host "`n" -ForegroundColor Cyan

Write-Host " Choose your test level:`n" -ForegroundColor Yellow

Write-Host " [1] Quick Sanity Check (2 min, no wallet)" -ForegroundColor Green
Write-Host "     - Validates RPC, chain, contracts exist" -ForegroundColor Gray
Write-Host "     - Checks server health" -ForegroundColor Gray
Write-Host "     - No blockchain writes`n" -ForegroundColor Gray

Write-Host " [2] Full E2E Suite (30-60 min, needs wallet)" -ForegroundColor Green  
Write-Host "     - All sanity checks" -ForegroundColor Gray
Write-Host "     - Swap with fee verification" -ForegroundColor Gray
Write-Host "     - Staking, land, performance tests" -ForegroundColor Gray
Write-Host "     - Saves detailed QA logs`n" -ForegroundColor Gray

$choice = Read-Host " Enter choice [1 or 2]"

if ($choice -eq "1") {
    Write-Host "`n Running preflight checks...`n" -ForegroundColor Cyan
    .\scripts\preflight-check.ps1
} elseif ($choice -eq "2") {
    Write-Host "`n" -ForegroundColor Yellow
    Write-Host " You will need:" -ForegroundColor Yellow
    Write-Host "    Base Sepolia ETH (for gas)" -ForegroundColor White
    Write-Host "    Private key (0x...)" -ForegroundColor White
    Write-Host "    ~60 minutes`n" -ForegroundColor White
    
    $confirm = Read-Host " Ready to proceed? [Y/N]"
    
    if ($confirm -eq "Y" -or $confirm -eq "y") {
        $privKey = Read-Host " Enter private key (0x...)" -AsSecureString
        $privKeyPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
            [Runtime.InteropServices.Marshal]::SecureStringToBSTR($privKey)
        )
        
        Write-Host "`n Starting full E2E test suite...`n" -ForegroundColor Cyan
        .\scripts\Test-Conductor.ps1 -WalletPrivKey $privKeyPlain
    } else {
        Write-Host "`n Test cancelled`n" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n Invalid choice`n" -ForegroundColor Red
}

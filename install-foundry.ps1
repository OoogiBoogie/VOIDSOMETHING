# Foundry Installation Script for Windows
# Run this once to set up Foundry for contract deployments

Write-Host "Installing Foundry (Forge, Cast, Anvil)..." -ForegroundColor Green
Write-Host ""

# Download and run foundryup installer
try {
    # Download foundryup
    Invoke-WebRequest -Uri "https://foundry.paradigm.xyz/foundryup/install" -OutFile "$env:TEMP\foundryup-install.ps1"
    
    # Run installer
    & "$env:TEMP\foundryup-install.ps1"
    
    Write-Host ""
    Write-Host "✅ Foundry installed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Close and reopen your terminal"
    Write-Host "2. Run: forge --version"
    Write-Host "3. Deploy to testnet: make deploy-testnet"
    Write-Host ""
    
} catch {
    Write-Host "❌ Installation failed. Please install manually:" -ForegroundColor Red
    Write-Host ""
    Write-Host "Visit: https://getfoundry.sh" -ForegroundColor Cyan
    Write-Host "Or download: https://github.com/foundry-rs/foundry/releases" -ForegroundColor Cyan
    Write-Host ""
}

# Clean up
Remove-Item "$env:TEMP\foundryup-install.ps1" -ErrorAction SilentlyContinue

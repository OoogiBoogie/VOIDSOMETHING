# Foundry Windows Installation Script
# This downloads pre-built Foundry binaries for Windows

Write-Host "Installing Foundry for Windows..." -ForegroundColor Cyan

# Create Foundry directory
$foundryDir = "$env:USERPROFILE\.foundry\bin"
New-Item -ItemType Directory -Force -Path $foundryDir | Out-Null

# Download URLs for latest Foundry releases (Windows builds)
$baseUrl = "https://github.com/foundry-rs/foundry/releases/latest/download"
$tools = @("forge", "cast", "anvil", "chisel")

foreach ($tool in $tools) {
    Write-Host "Downloading $tool..." -ForegroundColor Yellow
    $downloadUrl = "$baseUrl/$tool.exe"
    $outputPath = "$foundryDir\$tool.exe"
    
    try {
        Invoke-WebRequest -Uri $downloadUrl -OutFile $outputPath -ErrorAction Stop
        Write-Host "[OK] $tool installed" -ForegroundColor Green
    } catch {
        Write-Host "[FAIL] Failed to download $tool : $_" -ForegroundColor Red
    }
}

# Add to PATH if not already there
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($currentPath -notlike "*$foundryDir*") {
    Write-Host "Adding Foundry to PATH..." -ForegroundColor Yellow
    [Environment]::SetEnvironmentVariable("Path", "$currentPath;$foundryDir", "User")
    $env:Path = "$env:Path;$foundryDir"
    Write-Host "[OK] Added to PATH (restart terminal to use)" -ForegroundColor Green
}

Write-Host ""
Write-Host "Foundry installation complete!" -ForegroundColor Cyan
Write-Host "Restart your terminal and run: forge --version" -ForegroundColor Yellow

# scripts/Find-BrokenImports.ps1
Write-Host "`nSCANNING FOR BROKEN IMPORTS`n" -ForegroundColor Cyan

$patterns = @(
  "@/components/hud/HudClientLoader",
  "@/components/mobile/MobileOptimized",
  "from 'hardhat'",
  "from '@nomicfoundation"
)

$issues = @()

Get-ChildItem -Recurse -Include *.ts,*.tsx -Exclude *.d.ts |
  Where-Object { $_.FullName -notmatch '\\node_modules\\|\\\.next\\' } |
  ForEach-Object {
    $path = $_.FullName
    $relativePath = $path -replace [regex]::Escape($PWD.Path + "\"), ""
    $text = Get-Content $_ -Raw -ErrorAction SilentlyContinue
    
    if ($text) {
      foreach ($pattern in $patterns) {
        if ($text -match [regex]::Escape($pattern)) {
          $issues += [PSCustomObject]@{
            File = $relativePath
            Issue = $pattern
          }
        }
      }
    }
  }

if ($issues.Count -eq 0) {
  Write-Host "No broken imports found!`n" -ForegroundColor Green
} else {
  Write-Host "Found $($issues.Count) issues:`n" -ForegroundColor Yellow
  $issues | Group-Object Issue | ForEach-Object {
    Write-Host "[$($_.Name)]" -ForegroundColor Red
    $_.Group | ForEach-Object { Write-Host "  $($_.File)" -ForegroundColor Gray }
  }
}

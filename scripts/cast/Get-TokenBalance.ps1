Param(
  [Parameter(Mandatory=$true)][string]$Token,
  [Parameter(Mandatory=$true)][string]$Holder,
  [string]$RpcUrl = "https://sepolia.base.org",
  [int]$Decimals = 18
)

Write-Host "🔢 Fetching balance of $Holder for token $Token" -ForegroundColor Cyan
$cmd = "cast call $Token 'balanceOf(address)(uint256)' $Holder --rpc-url $RpcUrl"
Write-Host $cmd -ForegroundColor DarkGray

try {
  $raw = Invoke-Expression $cmd
  if (-not $raw) { Write-Warning "No result"; exit 0 }
  # raw may be hex (0x...) -> cast already prints decimal if using latest; ensure parse
  if ($raw -match '^0x') {
    $value = [System.Numerics.BigInteger]::Parse($raw.Substring(2), [System.Globalization.NumberStyles]::HexNumber)
  } else {
    $value = [System.Numerics.BigInteger]::Parse($raw)
  }
  $human = [double]($value) / [math]::Pow(10,$Decimals)
  Write-Host ("✅ Balance: {0} (raw: {1})" -f $human.ToString("F6"), $value) -ForegroundColor Green
} catch {
  Write-Error "cast call failed: $_"
  exit 1
}

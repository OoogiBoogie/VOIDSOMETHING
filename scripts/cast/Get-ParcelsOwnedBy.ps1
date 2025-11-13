Param(
  [Parameter(Mandatory=$true)][string]$Address,
  [string]$LandContract = $Env:NEXT_PUBLIC_WORLD_LAND_ADDRESS,
  [string]$RpcUrl = "https://sepolia.base.org"
)

if (-not $LandContract) {
  Write-Error "Land contract address not found. Set NEXT_PUBLIC_WORLD_LAND_ADDRESS in environment or pass -LandContract."
  exit 1
}

Write-Host "🔍 Querying parcels owned by $Address on $LandContract" -ForegroundColor Cyan

$cmd = "cast call $LandContract 'getParcelsOwnedBy(address)(uint256[])' $Address --rpc-url $RpcUrl"
Write-Host $cmd -ForegroundColor DarkGray

try {
  $result = Invoke-Expression $cmd
  if (-not $result) { Write-Warning "No result returned"; exit 0 }

  # Result format: [123,456,...] or hex array; normalize
  $clean = $result -replace '[\[\]\s]',''
  $ids = $clean -split ',' | Where-Object { $_ -ne '' }

  Write-Host "✅ Parcels owned (count=$($ids.Length)):" -ForegroundColor Green
  $ids | ForEach-Object { Write-Host " • ParcelId: $_" }

} catch {
  Write-Error "cast call failed: $_"
  exit 1
}

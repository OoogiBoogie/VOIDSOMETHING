#requires -Version 5.1
<#
.SYNOPSIS
PSX VOID - Subgraph Query Helper (Read-Only)

.DESCRIPTION
Convenience wrapper to query your subgraph endpoints with common GraphQL queries.
Provides pre-built queries for parcels, swaps, transfers, and analytics.

.PARAMETER SubgraphUrl
Subgraph endpoint URL

.PARAMETER QueryType
Pre-built query type: meta, parcels, swaps, transfers, or custom

.PARAMETER CustomQuery
GraphQL query string (only used when QueryType = custom)

.EXAMPLE
.\scripts\ops\graph-query.ps1 -SubgraphUrl https://api.thegraph.com/subgraphs/name/yourname/psx-void -QueryType meta
.\scripts\ops\graph-query.ps1 -SubgraphUrl https://... -QueryType parcels
.\scripts\ops\graph-query.ps1 -SubgraphUrl https://... -QueryType custom -CustomQuery "{ parcels(first: 10) { id owner } }"
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$SubgraphUrl,
    
    [ValidateSet("meta", "parcels", "swaps", "transfers", "custom")]
    [string]$QueryType = "meta",
    
    [string]$CustomQuery = ""
)

$ErrorActionPreference = "Stop"

function ok($m) { Write-Host ("[✓]  " + $m) -ForegroundColor Green }
function info($m) { Write-Host ("[i]  " + $m) -ForegroundColor Cyan }

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  PSX VOID - Subgraph Query" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Pre-built queries
$queries = @{
    meta = @{
        query = "{ _meta { block { number hash timestamp } hasIndexingErrors deployment } }"
        description = "Subgraph metadata and sync status"
    }
    parcels = @{
        query = @"
{
  parcels(first: 10, orderBy: id) {
    id
    x
    y
    district
    owner
    price
    createdAt
  }
}
"@
        description = "First 10 land parcels"
    }
    swaps = @{
        query = @"
{
  swaps(first: 10, orderBy: timestamp, orderDirection: desc) {
    id
    user
    tokenIn
    tokenOut
    amountIn
    amountOut
    fee
    timestamp
  }
}
"@
        description = "Recent 10 swap transactions"
    }
    transfers = @{
        query = @"
{
  transfers(first: 10, orderBy: timestamp, orderDirection: desc) {
    id
    from
    to
    token
    amount
    timestamp
  }
}
"@
        description = "Recent 10 token transfers"
    }
}

# Select query
if ($QueryType -eq "custom") {
    if (!$CustomQuery) {
        Write-Host "Error: CustomQuery parameter required when QueryType = custom" -ForegroundColor Red
        exit 1
    }
    $query = $CustomQuery
    $description = "Custom query"
} else {
    $query = $queries[$QueryType].query
    $description = $queries[$QueryType].description
}

info "Query: $description"
info "Endpoint: $SubgraphUrl"
Write-Host ""

# Execute query
try {
    $body = @{
        query = $query
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -UseBasicParsing -Uri $SubgraphUrl `
        -Method POST -ContentType "application/json" -Body $body `
        -TimeoutSec 15
    
    $result = $response.Content | ConvertFrom-Json
    
    if ($result.errors) {
        Write-Host "GraphQL Errors:" -ForegroundColor Red
        $result.errors | ForEach-Object {
            Write-Host ("  {0}" -f $_.message) -ForegroundColor Red
        }
    } else {
        ok "Query successful"
        Write-Host ""
        Write-Host "Results:" -ForegroundColor Yellow
        Write-Host ""
        $result.data | ConvertTo-Json -Depth 10 | Write-Host
    }
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Query Complete" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

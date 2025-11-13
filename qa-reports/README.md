# QA Reports

Automated test logs in JSONL format (JSON Lines).

## Structure

```
qa-reports/
  2024-11-11.jsonl
  2024-11-12.jsonl
  README.md (this file)
```

## Log Format

Each line is a JSON object:

```json
{"timestamp":"2024-11-11T10:30:45.123Z","event":"swap_executed","payload":{"amountIn":"10000000000000000000","fee":"30000000000000000","txHash":"0x123...","status":"success"}}
```

## Event Types

- `swap_fee_accrual` - Fee routing verification
- `swap_executed` - Swap transaction completed
- `stake` - Staking transaction
- `unstake` - Unstaking transaction
- `approve` - Token approval
- `land_ownership` - Parcel ownership check
- `xp_boost` - XP boost calculation
- `quote_fetched` - Swap quote received

## Usage

### Logging Events

```typescript
import { logQA } from '@/scripts/qa-log';

logQA("swap_executed", {
  amountIn: "10000000000000000000",
  amountOut: "9970000000000000000",
  fee: "30000000000000000",
  txHash: "0x123...",
  status: "success"
});
```

### Reading Logs

```typescript
import { readQALogs, getQAEventStats } from '@/scripts/qa-log';

// Get all logs for today
const logs = readQALogs();

// Get all logs for specific date
const oldLogs = readQALogs("2024-11-10");

// Get stats for specific event
const swapStats = getQAEventStats("swap_executed");
console.log(`${swapStats.count} swaps executed today`);
```

## Automated Collection

Logs are automatically created by:
- E2E test scripts (fee routing, etc.)
- Manual QA sessions (when QA logging is enabled)
- CI/CD pipeline (future integration)

## Retention

- Keep last 30 days of logs
- Archive older logs to `qa-reports/archive/YYYY-MM/`
- Never commit logs with real private keys or sensitive data

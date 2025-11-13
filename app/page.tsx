// Server component (safe to prerender)
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

import HudClientLoader from '@/components/system/HudClientLoader'

export default function Page() {
  // Keep server-only; don't import wagmi/privy here
  return <HudClientLoader />
}

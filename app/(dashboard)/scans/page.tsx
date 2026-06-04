import { requirePagePermission } from "@/lib/rbac/guard"
import { getScans } from "@/lib/actions/scan.queries"
import { ScansView } from "@/components/scans/scans-view"

export default async function ScansPage() {
  await requirePagePermission("scans:run")
  const scans = await getScans()
  return <ScansView scans={scans} />
}

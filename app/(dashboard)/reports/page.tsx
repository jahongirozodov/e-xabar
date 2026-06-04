import { requirePagePermission } from "@/lib/rbac/guard"
import { getReports } from "@/lib/actions/report.queries"
import { ReportsView } from "@/components/reports/reports-view"

export default async function ReportsPage() {
  await requirePagePermission("reports:view")
  const reports = await getReports()
  return <ReportsView reports={reports} />
}

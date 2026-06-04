import { requirePagePermission } from "@/lib/rbac/guard"
import { getAuditLogs } from "@/lib/actions/audit.queries"
import { AuditView } from "@/components/audit/audit-view"

export default async function AuditLogPage() {
  await requirePagePermission("auditlog:view")
  const logs = await getAuditLogs()
  return <AuditView logs={logs} />
}

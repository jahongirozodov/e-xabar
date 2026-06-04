import { requirePagePermission } from "@/lib/rbac/guard"
import { getFindingsForList } from "@/lib/actions/finding.queries"
import { FindingsView } from "@/components/findings/findings-view"

export default async function FindingsPage() {
  await requirePagePermission("findings:manage")
  const findings = await getFindingsForList()
  return <FindingsView findings={findings} />
}

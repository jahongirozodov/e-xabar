import { requirePagePermission } from "@/lib/rbac/guard"
import { getFindingsForList } from "@/lib/actions/finding.queries"
import { TriageBoard } from "@/components/triage/triage-board"

export default async function TriagePage() {
  await requirePagePermission("triage:manage")
  const findings = await getFindingsForList()
  return <TriageBoard findings={findings} />
}

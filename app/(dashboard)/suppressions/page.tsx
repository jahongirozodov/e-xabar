import { requirePagePermission } from "@/lib/rbac/guard"
import { getSuppressions } from "@/lib/actions/suppression.queries"
import { SuppressionsView } from "@/components/suppressions/suppressions-view"

export default async function SuppressionsPage() {
  await requirePagePermission("suppressions:manage")
  const suppressions = await getSuppressions()
  return <SuppressionsView suppressions={suppressions} />
}

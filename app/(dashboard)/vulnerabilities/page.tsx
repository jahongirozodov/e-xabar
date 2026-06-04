import type { Severity } from "@prisma/client"
import { requirePagePermission } from "@/lib/rbac/guard"
import { getVulnerabilitiesPage } from "@/lib/actions/vulnerability.queries"
import { CveView } from "@/components/cve/cve-view"

const SEVS: Severity[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "NONE"]

export default async function VulnerabilitiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requirePagePermission("findings:manage")
  const sp = await searchParams

  const page = Math.max(parseInt(typeof sp.page === "string" ? sp.page : "1", 10) || 1, 1)
  const q = typeof sp.q === "string" ? sp.q : ""
  const sevRaw = typeof sp.sev === "string" ? sp.sev : ""
  const severities = sevRaw.split(",").filter((s): s is Severity => (SEVS as string[]).includes(s))
  const kevOnly = sp.kev === "1"

  const data = await getVulnerabilitiesPage({ page, q, severities, kevOnly })
  return <CveView data={data} q={q} severities={severities} kevOnly={kevOnly} />
}

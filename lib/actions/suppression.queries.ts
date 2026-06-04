import "server-only"
import { prisma } from "@/lib/db/prisma"
import type { SuppressionScope } from "@prisma/client"

export interface SuppressionRow {
  id: string
  scope: SuppressionScope
  target: string
  reason: string
  byName: string
  createdAt: string
  expiresAt: string
  daysLeft: number
  affected: number
  isActive: boolean
}

function targetFor(
  scope: SuppressionScope,
  cveId: string | null,
  vendor: string | null,
  filter: unknown
): string {
  const f = (filter ?? {}) as Record<string, unknown>
  switch (scope) {
    case "CVE":
      return cveId ?? "—"
    case "CVE_ASSET":
      return `${cveId ?? ""} · ${f.assetRef ?? ""}`.trim()
    case "CVE_VENDOR":
      return `${cveId ?? ""} · ${vendor ?? ""}`.trim()
    case "ASSET_ATTR":
      return `${f.key ?? "environment"} = ${f.value ?? ""}`
    default:
      return "Barcha topilmalar"
  }
}

export async function getSuppressions(): Promise<SuppressionRow[]> {
  const [supps, findings] = await Promise.all([
    prisma.suppression.findMany({
      include: { createdBy: { select: { fullName: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.finding.findMany({ select: { vulnerability: { select: { cveId: true } } } }),
  ])

  const cveCount = new Map<string, number>()
  for (const f of findings) {
    const id = f.vulnerability.cveId
    cveCount.set(id, (cveCount.get(id) ?? 0) + 1)
  }

  const now = Date.now()
  return supps.map((s) => ({
    id: s.id,
    scope: s.scope,
    target: targetFor(s.scope, s.cveId, s.vendor, s.assetAttributeFilter),
    reason: s.reason,
    byName: s.createdBy.fullName,
    createdAt: s.createdAt.toISOString().slice(0, 10),
    expiresAt: s.expiresAt.toISOString().slice(0, 10),
    daysLeft: Math.round((s.expiresAt.getTime() - now) / 86_400_000),
    affected: s.cveId ? (cveCount.get(s.cveId) ?? 0) : 0,
    isActive: s.isActive,
  }))
}

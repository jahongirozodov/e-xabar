import "server-only"
import { prisma } from "@/lib/db/prisma"
import type { AssetCategory, FindingStatus, Severity } from "@prisma/client"

export interface ConfidenceFactor {
  name: string
  weight: number
}

export interface FindingRow {
  id: string
  cveId: string
  title: string | null
  severity: Severity
  cvss: number | null
  epss: number | null
  kev: boolean
  sources: string[]
  confidence: number
  status: FindingStatus
  ageDays: number
  vector: string | null
  description: string | null
  published: string | null
  assetName: string
  assetVersion: string
  host: string | null
  platform: string | null
  category: AssetCategory
  toolType: string | null
  objectName: string | null
  orgName: string | null
  ownerName: string | null
  ownerEmail: string | null
  ownerDept: string | null
  factors: ConfidenceFactor[]
}

function parseFactors(raw: unknown): ConfidenceFactor[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((x) =>
      Array.isArray(x) ? { name: String(x[0]), weight: Number(x[1]) } : null
    )
    .filter((x): x is ConfidenceFactor => x != null && Number.isFinite(x.weight))
}

export async function getFindingsForList(): Promise<FindingRow[]> {
  const findings = await prisma.finding.findMany({
    include: {
      vulnerability: true,
      asset: {
        include: {
          object: { include: { organization: true } },
          employees: {
            where: { unassignedAt: null },
            include: { employee: true },
            orderBy: { assignedAt: "asc" },
          },
        },
      },
    },
    orderBy: { firstSeenAt: "desc" },
  })

  const now = Date.now()
  return findings.map((f) => {
    const v = f.vulnerability
    const owner =
      f.asset.employees.find((e) => e.role === "owner")?.employee ??
      f.asset.employees[0]?.employee ??
      null
    return {
      id: f.id,
      cveId: v.cveId,
      title: v.title,
      severity: v.severity,
      cvss: v.cvssV3Score ? Number(v.cvssV3Score) : null,
      epss: v.epssScore ? Number(v.epssScore) : null,
      kev: v.isKev,
      sources: Array.isArray(f.sources) ? f.sources.map(String) : [],
      confidence: Number(f.confidenceScore),
      status: f.status,
      ageDays: Math.floor((now - f.firstSeenAt.getTime()) / 86_400_000),
      vector: v.cvssV3Vector,
      description: v.description,
      published: v.publishedAt ? v.publishedAt.toISOString().slice(0, 10) : null,
      assetName: f.asset.name,
      assetVersion: f.asset.version ?? "",
      host: f.asset.hostname,
      platform: f.asset.platform,
      category: f.asset.category,
      toolType: f.asset.toolType,
      objectName: f.asset.object?.name ?? null,
      orgName: f.asset.object?.organization?.name ?? null,
      ownerName: owner?.fullName ?? null,
      ownerEmail: owner?.email ?? null,
      ownerDept: owner?.department ?? null,
      factors: parseFactors(f.confidenceFactors),
    }
  })
}

// NOT server-only — action'lar + worker'lar reuse qiladi.
import { prisma } from "@/lib/db/prisma"
import type { Severity } from "@prisma/client"

export interface ReportData {
  reportType: string
  periodStart: Date
  periodEnd: Date
  generatedAt: Date
  totals: { assets: number; vulnerabilities: number; findings: number; kevFindings: number }
  severity: Record<Severity, number>
  newFindingsInPeriod: number
  notifications: { total: number; sent: number; acknowledged: number }
  scans: { total: number; completed: number }
  topAssets: { name: string; version: string; hostname: string; count: number; crit: number }[]
}

const EMPTY_SEV: Record<Severity, number> = {
  CRITICAL: 0,
  HIGH: 0,
  MEDIUM: 0,
  LOW: 0,
  NONE: 0,
}

export async function buildReportData(
  reportType: string,
  periodStart: Date,
  periodEnd: Date
): Promise<ReportData> {
  const inPeriod = { gte: periodStart, lte: periodEnd }

  const [assets, vulnerabilities, findings, newInPeriod, notifs, sentNotifs, ackNotifs, scans, doneScans] =
    await Promise.all([
      prisma.asset.count(),
      prisma.vulnerability.count(),
      prisma.finding.findMany({
        where: { status: { notIn: ["CLOSED", "NOT_APPLICABLE"] } },
        include: {
          vulnerability: { select: { severity: true, isKev: true } },
          asset: { select: { name: true, version: true, hostname: true } },
        },
      }),
      prisma.finding.count({ where: { firstSeenAt: inPeriod } }),
      prisma.notification.count({ where: { sentAt: inPeriod } }),
      prisma.notification.count({ where: { sentAt: inPeriod, status: "SENT" } }),
      prisma.notification.count({ where: { acknowledgedAt: inPeriod } }),
      prisma.scanRun.count({ where: { startedAt: inPeriod } }),
      prisma.scanRun.count({ where: { startedAt: inPeriod, status: "COMPLETED" } }),
    ])

  const severity = { ...EMPTY_SEV }
  let kevFindings = 0
  const byAsset = new Map<string, { name: string; version: string; hostname: string; count: number; crit: number }>()

  for (const f of findings) {
    const sev = f.vulnerability.severity
    severity[sev]++
    if (f.vulnerability.isKev) kevFindings++
    const key = `${f.asset.name}|${f.asset.version}|${f.asset.hostname ?? ""}`
    const row =
      byAsset.get(key) ??
      { name: f.asset.name, version: f.asset.version ?? "", hostname: f.asset.hostname ?? "—", count: 0, crit: 0 }
    row.count++
    if (sev === "CRITICAL") row.crit++
    byAsset.set(key, row)
  }

  const topAssets = [...byAsset.values()].sort((a, b) => b.count - a.count || b.crit - a.crit).slice(0, 10)

  return {
    reportType,
    periodStart,
    periodEnd,
    generatedAt: new Date(),
    totals: { assets, vulnerabilities, findings: findings.length, kevFindings },
    severity,
    newFindingsInPeriod: newInPeriod,
    notifications: { total: notifs, sent: sentNotifs, acknowledged: ackNotifs },
    scans: { total: scans, completed: doneScans },
    topAssets,
  }
}

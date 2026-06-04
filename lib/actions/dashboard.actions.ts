import "server-only"
import { prisma } from "@/lib/db/prisma"
import type { Severity } from "@prisma/client"

const INACTIVE_STATUSES: ReadonlyArray<string> = ["CLOSED", "NOT_APPLICABLE"]
const UZ_MONTHS = [
  "Yan", "Fev", "Mar", "Apr", "May", "Iyun",
  "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek",
]

export interface SevBreakdown {
  c: number
  h: number
  m: number
  l: number
}

export interface TopAsset {
  id: string
  name: string
  version: string
  hostname: string | null
  platform: string | null
  count: number
  breakdown: SevBreakdown
  kev: boolean
  topSeverity: Severity
  maxCvss: number | null
}

export interface ActivityItem {
  title: string
  meta: string
  time: string
  tone: "plain" | "crit" | "good"
  icon: string
}

export interface TrendPoint {
  label: string
  active: number
  crit: number
}

// Deterministik 90-kunlik sintetik trend (real tarix to'planmaguncha — dizayn ko'rinishi uchun).
function genTrend(endActive: number, endCrit: number): TrendPoint[] {
  const baseDate = new Date("2026-06-03")
  const pts: TrendPoint[] = []
  const startActive = Math.max(0, Math.round(endActive * 0.7))
  const startCrit = Math.max(0, Math.round(endCrit * 0.6))
  for (let i = 0; i < 90; i++) {
    const f = i / 89
    const wobble = Math.sin(i / 6) * 1.5 + Math.sin(i / 2.3) * 0.8
    const active = Math.max(0, Math.round(startActive + (endActive - startActive) * f + wobble))
    const crit = Math.max(0, Math.round(startCrit + (endCrit - startCrit) * f + Math.sin(i / 5) * 0.6))
    const d = new Date(baseDate)
    d.setDate(d.getDate() - (89 - i))
    pts.push({ label: UZ_MONTHS[d.getMonth()], active, crit })
  }
  if (pts.length) {
    pts[89].active = endActive
    pts[89].crit = endCrit
  }
  return pts
}

const SEV_RANK: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1, NONE: 0 }

export async function getDashboardData() {
  const [totalAssets, findings] = await Promise.all([
    prisma.asset.count(),
    prisma.finding.findMany({
      include: {
        vulnerability: {
          select: { cveId: true, title: true, severity: true, isKev: true, cvssV3Score: true },
        },
        asset: {
          select: { id: true, name: true, version: true, hostname: true, platform: true },
        },
      },
      orderBy: { firstSeenAt: "desc" },
    }),
  ])

  const active = findings.filter((f) => !INACTIVE_STATUSES.includes(f.status))

  const criticalHigh = active.filter(
    (f) => f.vulnerability.severity === "CRITICAL" || f.vulnerability.severity === "HIGH"
  ).length
  const kev = active.filter((f) => f.vulnerability.isKev).length

  const sevCount: Record<"CRITICAL" | "HIGH" | "MEDIUM" | "LOW", number> = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
  }
  for (const f of active) {
    const s = f.vulnerability.severity
    if (s === "CRITICAL" || s === "HIGH" || s === "MEDIUM" || s === "LOW") sevCount[s]++
  }

  // TOP vositalar — faol topilma soni bo'yicha
  const byAsset = new Map<string, TopAsset>()
  for (const f of active) {
    const a = f.asset
    let rec = byAsset.get(a.id)
    if (!rec) {
      rec = {
        id: a.id,
        name: a.name,
        version: a.version ?? "",
        hostname: a.hostname,
        platform: a.platform,
        count: 0,
        breakdown: { c: 0, h: 0, m: 0, l: 0 },
        kev: false,
        topSeverity: "NONE",
        maxCvss: null,
      }
      byAsset.set(a.id, rec)
    }
    rec.count++
    const sev = f.vulnerability.severity
    if (sev === "CRITICAL") rec.breakdown.c++
    else if (sev === "HIGH") rec.breakdown.h++
    else if (sev === "MEDIUM") rec.breakdown.m++
    else if (sev === "LOW") rec.breakdown.l++
    if (f.vulnerability.isKev) rec.kev = true
    if (SEV_RANK[sev] > SEV_RANK[rec.topSeverity]) rec.topSeverity = sev
    const cvss = f.vulnerability.cvssV3Score ? Number(f.vulnerability.cvssV3Score) : null
    if (cvss != null && (rec.maxCvss == null || cvss > rec.maxCvss)) rec.maxCvss = cvss
  }
  const topAssets = [...byAsset.values()].sort((a, b) => b.count - a.count).slice(0, 10)

  // Faoliyat tasmasi — oxirgi topilmalar
  const activity: ActivityItem[] = findings.slice(0, 7).map((f) => {
    const sev = f.vulnerability.severity
    const tone: ActivityItem["tone"] = f.vulnerability.isKev
      ? "crit"
      : sev === "CRITICAL"
        ? "crit"
        : "plain"
    return {
      title: f.vulnerability.isKev
        ? `KEV topilma: ${f.vulnerability.cveId}`
        : `Topilma: ${f.vulnerability.cveId}`,
      meta: `${f.asset.name} ${f.asset.version} · ${f.asset.hostname ?? "—"}`,
      time: f.firstSeenAt.toISOString(),
      tone,
      icon: f.vulnerability.isKev ? "shield-alert" : "bug",
    }
  })

  return {
    totalAssets,
    activeCount: active.length,
    criticalHigh,
    kev,
    severityDist: sevCount,
    topAssets,
    trend: genTrend(active.length, criticalHigh),
    activity,
  }
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>

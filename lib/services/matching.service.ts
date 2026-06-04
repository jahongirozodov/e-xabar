// NOT server-only — RSC action'lar VA BullMQ worker'lar ham ishlatadi.
import { prisma } from "@/lib/db/prisma"
import type { Asset, Vulnerability } from "@prisma/client"

interface MatchInfo {
  product: string
  vendor: string
  fixed: string
  // NVD CPE'dan: "vendor/product: = 6.0.0" / ">= 2.0.1 va < 2.3.1" ko'rinishidagi diapazonlar
  list?: string[]
}

// Bitta vosita×zaiflik juftligi hali ham zaifmi? (verification uchun qayta ishlatiladi)
// Mahsulot/vosita nomi mosligi — qisqa/bo'sh nomlar soxta mosliklarni bermasligi uchun min uzunlik.
const MIN_TOKEN = 4

// Generik mahsulot so'zlari (normallashtirilgan) — bular YAGONA moslik asosi bo'lib qolmasligi kerak.
// Masalan "manager" cloudera/suse/freepbx mahsulotlarini Cisco "catalyst sd-wan manager" vositasiga
// substring orqali noto'g'ri bog'laydi. Faqat to'liq teng bo'lganda o'tadi, substring bo'lsa rad.
const STOPWORDS = new Set([
  "manager", "manage", "management", "server", "client", "agent", "console", "gateway",
  "sdwan", "sd", "wan", "catalyst", "controller", "portal", "service", "services",
  "system", "platform", "core", "edge", "studio", "center", "suite", "application",
  "software", "network", "security", "cloud", "node", "web", "api",
])

function nameMatch(assetName: string, product: string): boolean {
  const an = norm(assetName)
  const pr = norm(product)
  if (pr.length < MIN_TOKEN || an.length < MIN_TOKEN) return false
  if (an === pr) return true
  // Substring moslik (teng emas): generik so'z YAGONA asos bo'lsa — soxta, rad et.
  if (an.includes(pr) && !STOPWORDS.has(pr)) return true
  if (pr.includes(an) && !STOPWORDS.has(an)) return true
  return false
}

export function matchPair(a: Asset, v: Vulnerability): boolean {
  const m = v.affectedVersions as unknown as MatchInfo | null
  if (!m || !m.product) return false
  if (!nameMatch(a.name, m.product)) return false
  return versionVulnerable(a.version, m)
}

export interface MatchResult {
  created: number
  recurring: number
}

function norm(s: string | null | undefined): string {
  return (s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "")
}

// Oddiy semver-ish solishtirish: a < b ?
// a yo'q (null) bo'lsa — versiyani aniqlay olmaymiz → zaif deb hisoblanadi (true).
function versionLt(a: string | null | undefined, b: string): boolean {
  if (!a) return true
  const pa = a.split(/[.\-+~_]/).map((x) => parseInt(x, 10))
  const pb = b.split(/[.\-+~_]/).map((x) => parseInt(x, 10))
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] ?? 0
    const y = pb[i] ?? 0
    if (Number.isNaN(x) || Number.isNaN(y)) continue
    if (x !== y) return x < y
  }
  return false
}

function versionGt(a: string, b: string): boolean {
  return versionLt(b, a) && !versionEq(a, b)
}
function versionEq(a: string, b: string): boolean {
  return !versionLt(a, b) && !versionLt(b, a)
}

// Bitta diapazon ifodasiga ("= 6.0.0", ">= 2.0.1 va < 2.3.1", "< X", "barcha versiyalar") mosmi?
function rangeApplies(ver: string, range: string): boolean {
  if (range.includes("barcha")) return true
  for (const part of range.split(" va ")) {
    const mt = part.trim().match(/^(>=|<=|>|<|=)\s*(.+)$/)
    if (!mt) continue
    const op = mt[1]
    const bound = mt[2].trim()
    if (op === "=" && !versionEq(ver, bound)) return false
    if (op === "<" && !versionLt(ver, bound)) return false
    if (op === "<=" && !(versionLt(ver, bound) || versionEq(ver, bound))) return false
    if (op === ">" && !versionGt(ver, bound)) return false
    if (op === ">=" && !(versionGt(ver, bound) || versionEq(ver, bound))) return false
  }
  return true
}

// Vosita versiyasi CVE'ning ta'sirlangan diapazonlaridan biriga tushadimi?
// Versiya noma'lum (null) → rad eta olmaymiz → past ishonch bilan flag (true).
function versionApplicableToList(assetVer: string | null, list: string[]): boolean {
  if (!assetVer) return true
  for (const entry of list) {
    const idx = entry.indexOf(": ")
    const range = idx >= 0 ? entry.slice(idx + 2) : entry
    if (rangeApplies(assetVer, range)) return true
  }
  return false
}

// Versiya bo'yicha zaifmi? NVD CPE list bo'lsa — diapazon solishtiriladi; aks holda fixed (seed).
function versionVulnerable(assetVer: string | null, m: MatchInfo): boolean {
  if (Array.isArray(m.list) && m.list.length > 0) {
    return versionApplicableToList(assetVer, m.list)
  }
  return m.fixed ? versionLt(assetVer, m.fixed) : true
}

function scoreMatch(
  asset: Asset,
  m: MatchInfo,
  vendorMatch: boolean,
  versionVuln: boolean
): { score: number; factors: [string, number][] } {
  const factors: [string, number][] = [["Mahsulot nomi mos keldi", 0.5]]
  let score = 0.5
  if (vendorMatch) {
    score += 0.25
    factors.push(["Ishlab chiqaruvchi mos", 0.25])
  }
  if (asset.purl && norm(asset.purl).includes(norm(m.product))) {
    score += 0.15
    factors.push(["PURL mos keldi", 0.15])
  }
  if (versionVuln) {
    score += 0.1
    factors.push(["Versiya zaif diapazonda", 0.1])
  } else {
    score -= 0.15
    factors.push(["Versiya tuzatilgan bo'lishi mumkin", -0.15])
  }
  return { score: Math.max(0.1, Math.min(0.99, Number(score.toFixed(2)))), factors }
}

// Inventardagi vositalarni zaifliklar bilan moslashtiradi → Finding yaratadi/yangilaydi.
// MUHIM: zaifliklar cursor-paginatsiya bilan o'qiladi (355k+ ni xotiraga yuklamaslik → OOM oldini olish).
export async function runMatching(scanRunId?: string): Promise<MatchResult> {
  const assets = await prisma.asset.findMany({ where: { status: "ACTIVE" } })
  if (assets.length === 0) return { created: 0, recurring: 0 }

  let created = 0
  let recurring = 0
  let lastId = ""

  for (;;) {
    const vulns = await prisma.vulnerability.findMany({
      where: { id: { gt: lastId } },
      orderBy: { id: "asc" },
      take: 3000,
      select: { id: true, affectedVersions: true },
    })
    if (vulns.length === 0) break
    lastId = vulns[vulns.length - 1].id

    for (const v of vulns) {
      const m = v.affectedVersions as unknown as MatchInfo | null
      if (!m || !m.product) continue

      for (const a of assets) {
        if (!nameMatch(a.name, m.product)) continue

        const versionVuln = versionVulnerable(a.version, m)
        // Versiya MA'LUM va ta'sirlangan diapazonga TUSHMASA → mos emas (skip).
        if (!versionVuln && a.version) continue

        const av = norm(a.vendor)
        const mv = norm(m.vendor?.split(" ")[0])
        const vendorMatch = !!av && !!mv && (av.includes(mv) || mv.includes(av))
        // Vendor QAT'IY filtri: ikkala tomonda ham vendor bor va mos kelmasa → soxta, skip.
        if (av && mv && !vendorMatch) continue
        const { score, factors } = scoreMatch(a, m, vendorMatch, versionVuln)

        const existing = await prisma.finding.findUnique({
          where: { assetId_vulnerabilityId: { assetId: a.id, vulnerabilityId: v.id } },
        })
        if (existing) {
          await prisma.finding.update({
            where: { id: existing.id },
            data: { lastSeenAt: new Date(), scanRunId: scanRunId ?? existing.scanRunId },
          })
          recurring++
        } else {
          await prisma.finding.create({
            data: {
              assetId: a.id,
              vulnerabilityId: v.id,
              scanRunId: scanRunId ?? null,
              confidenceScore: score,
              confidenceFactors: factors,
              sources: ["MATCH"],
              status: "NEW",
            },
          })
          created++
        }
      }
    }
  }

  return { created, recurring }
}

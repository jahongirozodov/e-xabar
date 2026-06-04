import type { SourceAdapter, NormalizedVuln } from "./base.adapter"
import { cvssToSeverity } from "@/lib/severity"

const NVD_URL = "https://services.nvd.nist.gov/rest/json/cves/2.0"
const PAGE = 2000 // NVD 2.0 max resultsPerPage

interface CvssMetric {
  cvssData?: { baseScore?: number; vectorString?: string }
}

interface CpeMatch {
  vulnerable?: boolean
  criteria?: string
  versionStartIncluding?: string
  versionStartExcluding?: string
  versionEndIncluding?: string
  versionEndExcluding?: string
}
interface NvdConfig {
  nodes?: { cpeMatch?: CpeMatch[] }[]
}

interface NvdItem {
  cve: {
    id: string
    published?: string
    lastModified?: string
    descriptions?: { lang: string; value: string }[]
    metrics?: {
      cvssMetricV31?: CvssMetric[]
      cvssMetricV30?: CvssMetric[]
      cvssMetricV2?: CvssMetric[]
    }
    configurations?: NvdConfig[]
  }
}

// CPE configurations'dan ta'sirlangan mahsulot + versiya diapazonini ajratadi.
// Natija: { product, vendor, fixed } (matching uchun) + list[] (ko'rsatish) + count.
function parseAffected(cve: NvdItem["cve"]) {
  const cfgs = cve.configurations
  if (!Array.isArray(cfgs)) return null
  const seen = new Set<string>()
  const list: string[] = []
  let primary: { product: string; vendor: string; fixed: string } | null = null

  for (const cfg of cfgs) {
    for (const node of cfg.nodes ?? []) {
      for (const m of node.cpeMatch ?? []) {
        if (!m.vulnerable || !m.criteria) continue
        // CPE 2.3: escape qilinmagan ":" bo'yicha bo'lamiz, keyin "\:" → ":" tiklaymiz.
        const p = m.criteria.split(/(?<!\\):/).map((x) => x.replace(/\\:/g, ":"))
        const vendor = p[3] ?? ""
        const product = p[4] ?? ""
        const ver = p[5] ?? "*"
        const pNorm = product.toLowerCase().replace(/[^a-z0-9]/g, "")
        // axlat/qisqa nomlarni o'tkazib yuborish (soxta moslik oldini olish)
        if (pNorm.length < 3 || vendor === "*" || vendor === "-") continue

        const bounds: string[] = []
        if (m.versionStartIncluding) bounds.push(`>= ${m.versionStartIncluding}`)
        if (m.versionStartExcluding) bounds.push(`> ${m.versionStartExcluding}`)
        if (m.versionEndIncluding) bounds.push(`<= ${m.versionEndIncluding}`)
        if (m.versionEndExcluding) bounds.push(`< ${m.versionEndExcluding}`)
        if (!bounds.length && ver !== "*" && ver !== "-") bounds.push(`= ${ver}`)
        const range = bounds.join(" va ") || "barcha versiyalar"

        const label = `${vendor}/${product}: ${range}`
        if (!seen.has(label)) {
          seen.add(label)
          if (list.length < 25) list.push(label)
        }
        if (!primary) {
          primary = {
            product: product.replace(/_/g, " "),
            vendor,
            fixed: m.versionEndExcluding ?? "",
          }
        }
      }
    }
  }
  if (!list.length) return null
  return { product: primary?.product ?? "", vendor: primary?.vendor ?? "", fixed: primary?.fixed ?? "", list, count: seen.size }
}

// CVSS: v3.1 → v3.0 → v2 fallback (eski CVE'larda v3.1 bo'lmaydi).
function pickCvss(m: NvdItem["cve"]["metrics"]): { score: number | null; vector: string | null } {
  const d =
    m?.cvssMetricV31?.[0]?.cvssData ??
    m?.cvssMetricV30?.[0]?.cvssData ??
    m?.cvssMetricV2?.[0]?.cvssData
  return { score: d?.baseScore ?? null, vector: d?.vectorString ?? null }
}

interface NvdResponse {
  vulnerabilities?: NvdItem[]
  totalResults?: number
}

function mapNvd(item: NvdItem): NormalizedVuln {
  const c = item.cve
  const { score, vector } = pickCvss(c.metrics)
  return {
    cveId: c.id,
    description: c.descriptions?.find((d) => d.lang === "en")?.value ?? null,
    cvssV3Score: score,
    cvssV3Vector: vector,
    severity: score != null ? cvssToSeverity(score) : null,
    publishedAt: c.published ? new Date(c.published) : null,
    lastModifiedAt: c.lastModified ? new Date(c.lastModified) : null,
    affectedVersions: parseAffected(c) ?? undefined,
    sourceUrl: `https://nvd.nist.gov/vuln/detail/${c.id}`,
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// Rate-limit + vaqtinchalik xatolarga chidamli sahifa olish (retry + backoff).
async function fetchUrl(url: string, headers: Record<string, string>): Promise<NvdResponse> {
  let lastErr: unknown
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const res = await fetch(url, { headers, signal: AbortSignal.timeout(40000) })
      if (res.ok) return (await res.json()) as NvdResponse
      // 403/429/503 — rate-limit yoki vaqtinchalik → backoff bilan qayta
      if (res.status === 403 || res.status === 429 || res.status >= 500) {
        lastErr = new Error(`NVD HTTP ${res.status}`)
      } else {
        throw new Error(`NVD HTTP ${res.status}`)
      }
    } catch (e) {
      lastErr = e
    }
    await sleep(10000 * (attempt + 1)) // 10s, 20s, 30s, 40s
  }
  throw lastErr instanceof Error ? lastErr : new Error("NVD fetch failed")
}

// NVD 2.0 REST API. NVD_API_KEY ixtiyoriy (50 so'rov/30s vs 5/30s). Tarmoq kerak.
export const nvdAdapter: SourceAdapter = {
  source: "NVD",

  // Yengil rejim (routine ingest) — faqat birinchi sahifa (so'nggi CVE'lar).
  async fetchVulns(): Promise<NormalizedVuln[]> {
    const headers: Record<string, string> = {}
    if (process.env.NVD_API_KEY) headers.apiKey = process.env.NVD_API_KEY
    const res = await fetch(`${NVD_URL}?resultsPerPage=50`, {
      headers,
      signal: AbortSignal.timeout(20000),
    })
    if (!res.ok) throw new Error(`NVD HTTP ${res.status}`)
    const data = (await res.json()) as NvdResponse
    return (data.vulnerabilities ?? []).map(mapNvd)
  },

  // To'liq backfill — barcha CVE'larni sahifalab oqim bilan tortadi (~355k).
  async fetchPaged(onBatch): Promise<number> {
    const headers: Record<string, string> = {}
    const hasKey = !!process.env.NVD_API_KEY
    if (hasKey) headers.apiKey = process.env.NVD_API_KEY!
    const delayMs = hasKey ? 700 : 6500 // rate-limit chegarasi ostida qolish
    const maxPages = process.env.NVD_MAX_PAGES ? parseInt(process.env.NVD_MAX_PAGES, 10) : Infinity

    let startIndex = 0
    let total = Infinity
    let fetched = 0
    let page = 0

    while (startIndex < total && page < maxPages) {
      const data = await fetchUrl(`${NVD_URL}?resultsPerPage=${PAGE}&startIndex=${startIndex}`, headers)
      total = data.totalResults ?? 0
      const items = data.vulnerabilities ?? []
      if (items.length === 0) break

      await onBatch(items.map(mapNvd))
      fetched += items.length
      startIndex += items.length
      page++
      console.log(`  NVD page ${page}: ${fetched}/${total}`)

      if (startIndex < total) await sleep(delayMs)
    }
    return fetched
  },

  // Incremental — faqat oxirgi `days` kunda O'ZGARGAN CVE'lar (lastModStartDate/EndDate).
  async fetchPagedSince(days, onBatch): Promise<number> {
    const headers: Record<string, string> = {}
    const hasKey = !!process.env.NVD_API_KEY
    if (hasKey) headers.apiKey = process.env.NVD_API_KEY!
    const delayMs = hasKey ? 700 : 6500

    const end = new Date()
    const start = new Date(end.getTime() - days * 86_400_000)
    const startIso = encodeURIComponent(start.toISOString())
    const endIso = encodeURIComponent(end.toISOString())
    const dateQ = `&lastModStartDate=${startIso}&lastModEndDate=${endIso}`

    let startIndex = 0
    let total = Infinity
    let fetched = 0
    let page = 0
    while (startIndex < total) {
      const data = await fetchUrl(`${NVD_URL}?resultsPerPage=${PAGE}&startIndex=${startIndex}${dateQ}`, headers)
      total = data.totalResults ?? 0
      const items = data.vulnerabilities ?? []
      if (items.length === 0) break

      await onBatch(items.map(mapNvd))
      fetched += items.length
      startIndex += items.length
      page++
      console.log(`  NVD (incremental ${days}k) page ${page}: ${fetched}/${total}`)

      if (startIndex < total) await sleep(delayMs)
    }
    return fetched
  },
}

export const ALL_ADAPTERS_INFO = ["NVD", "OSV", "GHSA", "KEV", "USN", "DSA"] as const

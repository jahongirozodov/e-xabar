import { prisma } from "@/lib/db/prisma"
import type { SourceAdapter, NormalizedVuln } from "./base.adapter"

const OSV_VULN_URL = "https://api.osv.dev/v1/vulns"

interface OsvAffected {
  package?: { ecosystem?: string; name?: string; purl?: string }
  ranges?: { type?: string; events?: { introduced?: string; fixed?: string }[] }[]
}
interface OsvVuln {
  id: string
  summary?: string
  details?: string
  aliases?: string[]
  severity?: { type?: string; score?: string }[]
  affected?: OsvAffected[]
  published?: string
  modified?: string
}

// OSV.dev — boyitish adapteri. DB'dagi mavjud CVE'lar uchun tuzatilgan versiya/CVSS
// vektorini OSV API'dan oladi (OSV ro'yxat endpointi yo'q). Tarmoq kerak.
export const osvAdapter: SourceAdapter = {
  source: "OSV",
  async fetchVulns(): Promise<NormalizedVuln[]> {
    // GHSA'ga bog'langan CVE'lar ochiq-kod ekotizimida → OSV'da topiladi (yuqori urish).
    const ghsaLinked = await prisma.vulnerabilitySource.findMany({
      where: { source: "GHSA", vulnerability: { cveId: { startsWith: "CVE-" } } },
      select: { vulnerability: { select: { cveId: true } } },
      take: 50,
    })
    const ids = new Set(ghsaLinked.map((s) => s.vulnerability.cveId))
    if (ids.size < 50) {
      const more = await prisma.vulnerability.findMany({
        where: { cveId: { startsWith: "CVE-" } },
        select: { cveId: true },
        orderBy: { cveId: "desc" },
        take: 50 - ids.size,
      })
      for (const m of more) ids.add(m.cveId)
    }
    const targets = [...ids].map((cveId) => ({ cveId }))

    const out: NormalizedVuln[] = []
    for (const { cveId } of targets) {
      let res: Response
      try {
        res = await fetch(`${OSV_VULN_URL}/${cveId}`, { signal: AbortSignal.timeout(10000) })
      } catch {
        continue
      }
      if (!res.ok) continue
      const d = (await res.json()) as OsvVuln

      const aff = d.affected?.[0]
      const fixed = aff?.ranges
        ?.flatMap((r) => r.events ?? [])
        .map((e) => e.fixed)
        .find(Boolean)
      const cvssVector = d.severity?.find((s) => s.type?.startsWith("CVSS"))?.score

      out.push({
        cveId,
        description: d.details ?? d.summary ?? null,
        cvssV3Vector: cvssVector ?? null,
        publishedAt: d.published ? new Date(d.published) : null,
        lastModifiedAt: d.modified ? new Date(d.modified) : null,
        affectedVersions: aff?.package?.name
          ? { product: aff.package.name, vendor: aff.package.ecosystem ?? "", fixed: fixed ?? "" }
          : undefined,
        sourceUrl: `https://osv.dev/vulnerability/${d.id}`,
      })
    }
    return out
  },
}

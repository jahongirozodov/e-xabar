import { readFile } from "fs/promises"
import path from "path"
import type { SourceAdapter, NormalizedVuln } from "./base.adapter"
import { cvssToSeverity } from "@/lib/severity"

interface FeedItem {
  cveId: string
  title?: string
  description?: string
  cvss?: number
  vector?: string
  epss?: number
  isKev?: boolean
  kevDate?: string
  published?: string
  product?: string
  vendor?: string
  fixed?: string
}

// Offline manba — `data/cve-feed.json` faylidan o'qiydi (yangilanib turadigan).
export const localFeedAdapter: SourceAdapter = {
  source: "LOCAL",
  async fetchVulns(): Promise<NormalizedVuln[]> {
    const file = path.join(process.cwd(), "data", "cve-feed.json")
    const raw = await readFile(file, "utf8")
    const items: FeedItem[] = JSON.parse(raw)
    return items.map((i) => ({
      cveId: i.cveId,
      title: i.title ?? null,
      description: i.description ?? null,
      cvssV3Score: i.cvss ?? null,
      cvssV3Vector: i.vector ?? null,
      severity: i.cvss != null ? cvssToSeverity(i.cvss) : null,
      epssScore: i.epss ?? null,
      isKev: !!i.isKev,
      kevAddedDate: i.kevDate ? new Date(i.kevDate) : null,
      publishedAt: i.published ? new Date(i.published) : null,
      affectedVersions: i.product
        ? { product: i.product, vendor: i.vendor ?? "", fixed: i.fixed ?? "" }
        : undefined,
      sourceUrl: `https://nvd.nist.gov/vuln/detail/${i.cveId}`,
    }))
  },
}

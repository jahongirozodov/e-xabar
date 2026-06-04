import type { Severity } from "@prisma/client"

// Manbalardan kelgan zaiflik ma'lumotining normallashtirilgan ko'rinishi.
export interface NormalizedVuln {
  cveId: string
  title?: string | null
  description?: string | null
  cvssV3Score?: number | null
  cvssV3Vector?: string | null
  severity?: Severity | null
  epssScore?: number | null
  isKev?: boolean
  kevAddedDate?: Date | null
  publishedAt?: Date | null
  lastModifiedAt?: Date | null
  affectedVersions?: unknown
  sourceUrl?: string | null
}

// Har bir CVE manbasi shu interfeysni amalga oshiradi.
export interface SourceAdapter {
  // IntegrationHealth.source bilan mos: NVD/OSV/GHSA/KEV/USN/DSA/LOCAL
  source: string
  fetchVulns(): Promise<NormalizedVuln[]>
  // Ixtiyoriy: to'liq backfill uchun sahifama-sahifa stream (xotirada hammasini yig'maslik).
  // Har sahifa onBatch'ga uzatiladi; jami olingan yozuvlar sonini qaytaradi.
  fetchPaged?: (onBatch: (batch: NormalizedVuln[]) => Promise<void>) => Promise<number>
  // Ixtiyoriy: incremental — faqat oxirgi `days` kunda o'zgargan yozuvlar (kunlik cron uchun).
  fetchPagedSince?: (
    days: number,
    onBatch: (batch: NormalizedVuln[]) => Promise<void>
  ) => Promise<number>
}

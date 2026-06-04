import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db/prisma"
import type { NormalizedVuln, SourceAdapter } from "@/lib/adapters/base.adapter"

export interface IngestSourceResult {
  source: string
  fetched: number
  upserted: number
  status: "healthy" | "down"
  error?: string
}

export interface IngestOptions {
  // true bo'lsa, adapter.fetchPaged mavjud manbalar to'liq sahifalab tortiladi (NVD backfill).
  full?: boolean
  // > 0 bo'lsa, adapter.fetchPagedSince mavjud manbalar faqat oxirgi N kunda o'zgarganini oladi (incremental).
  sinceDays?: number
}

// undefined/null maydonlarni olib tashlaydi (mavjud qiymatni null bilan yozib yubormaslik uchun).
function defined<T extends Record<string, unknown>>(o: T): Partial<T> {
  const r: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(o)) {
    if (v !== undefined && v !== null) r[k] = v
  }
  return r as Partial<T>
}

// Bitta normallashtirilgan zaiflikni + manba bog'lanishini yozadi.
async function upsertVuln(v: NormalizedVuln, source: string, now: Date): Promise<boolean> {
  if (!v.cveId) return false
  const vrec = await prisma.vulnerability.upsert({
    where: { cveId: v.cveId },
    update: defined({
      title: v.title,
      description: v.description,
      cvssV3Score: v.cvssV3Score,
      cvssV3Vector: v.cvssV3Vector,
      severity: v.severity ?? undefined,
      epssScore: v.epssScore,
      isKev: v.isKev,
      kevAddedDate: v.kevAddedDate,
      publishedAt: v.publishedAt,
      lastModifiedAt: v.lastModifiedAt,
      affectedVersions: (v.affectedVersions as Prisma.InputJsonValue) ?? undefined,
    }),
    create: {
      cveId: v.cveId,
      title: v.title ?? null,
      description: v.description ?? null,
      cvssV3Score: v.cvssV3Score ?? null,
      cvssV3Vector: v.cvssV3Vector ?? null,
      severity: v.severity ?? "NONE",
      epssScore: v.epssScore ?? null,
      isKev: v.isKev ?? false,
      kevAddedDate: v.kevAddedDate ?? null,
      publishedAt: v.publishedAt ?? null,
      lastModifiedAt: v.lastModifiedAt ?? null,
      affectedVersions: (v.affectedVersions as Prisma.InputJsonValue) ?? undefined,
    },
  })

  await prisma.vulnerabilitySource.upsert({
    where: { vulnerabilityId_source: { vulnerabilityId: vrec.id, source } },
    update: { sourceUrl: v.sourceUrl ?? null, fetchedAt: now },
    create: { vulnerabilityId: vrec.id, source, sourceUrl: v.sourceUrl ?? null },
  })
  return true
}

export async function runIngestion(
  adapters: SourceAdapter[],
  opts: IngestOptions = {}
): Promise<IngestSourceResult[]> {
  const results: IngestSourceResult[] = []

  for (const adapter of adapters) {
    const now = new Date()
    try {
      let fetched = 0
      let upserted = 0

      if (opts.sinceDays && opts.sinceDays > 0 && adapter.fetchPagedSince) {
        // Incremental — faqat o'zgargan yozuvlar (kunlik cron).
        fetched = await adapter.fetchPagedSince(opts.sinceDays, async (batch) => {
          for (const v of batch) {
            if (await upsertVuln(v, adapter.source, new Date())) upserted++
          }
        })
      } else if (opts.full && adapter.fetchPaged) {
        // Streaming backfill — sahifama-sahifa upsert (xotirada hammasini yig'maslik).
        fetched = await adapter.fetchPaged(async (batch) => {
          for (const v of batch) {
            if (await upsertVuln(v, adapter.source, new Date())) upserted++
          }
        })
      } else {
        const vulns = await adapter.fetchVulns()
        fetched = vulns.length
        for (const v of vulns) {
          if (await upsertVuln(v, adapter.source, now)) upserted++
        }
      }

      await prisma.integrationHealth.upsert({
        where: { source: adapter.source },
        update: { status: "healthy", lastCheckedAt: new Date(), lastSuccessAt: new Date(), errorMessage: null },
        create: { source: adapter.source, status: "healthy", lastCheckedAt: new Date(), lastSuccessAt: new Date() },
      })
      results.push({ source: adapter.source, fetched, upserted, status: "healthy" })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      await prisma.integrationHealth.upsert({
        where: { source: adapter.source },
        update: { status: "down", lastCheckedAt: new Date(), errorMessage: msg },
        create: { source: adapter.source, status: "down", lastCheckedAt: new Date(), errorMessage: msg },
      })
      results.push({ source: adapter.source, fetched: 0, upserted: 0, status: "down", error: msg })
    }
  }

  return results
}

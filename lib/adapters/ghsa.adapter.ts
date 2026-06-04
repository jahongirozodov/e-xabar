import type { Severity } from "@prisma/client"
import type { SourceAdapter, NormalizedVuln } from "./base.adapter"

const GHSA_URL = "https://api.github.com/advisories?per_page=50&sort=published&direction=desc"

interface GhsaItem {
  ghsa_id: string
  cve_id?: string | null
  summary?: string
  description?: string
  severity?: "low" | "medium" | "high" | "critical" | string
  cvss?: { score?: number | null; vector_string?: string | null } | null
  published_at?: string
  updated_at?: string
  html_url?: string
  vulnerabilities?: {
    package?: { ecosystem?: string; name?: string }
    first_patched_version?: { identifier?: string } | null
  }[]
}

function ghsaSeverity(s?: string): Severity | null {
  switch (s) {
    case "critical":
      return "CRITICAL"
    case "high":
      return "HIGH"
    case "medium":
      return "MEDIUM"
    case "low":
      return "LOW"
    default:
      return null
  }
}

// GitHub Advisory Database (GHSA) — so'nggi maslahatlar. GITHUB_TOKEN ixtiyoriy
// (rate-limit oshiradi). Tarmoq kerak.
export const ghsaAdapter: SourceAdapter = {
  source: "GHSA",
  async fetchVulns(): Promise<NormalizedVuln[]> {
    const headers: Record<string, string> = { Accept: "application/vnd.github+json" }
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`

    const res = await fetch(GHSA_URL, { headers, signal: AbortSignal.timeout(20000) })
    if (!res.ok) throw new Error(`GHSA HTTP ${res.status}`)
    const data = (await res.json()) as GhsaItem[]

    return (data ?? []).map((a) => {
      const v = a.vulnerabilities?.[0]
      return {
        cveId: a.cve_id || a.ghsa_id,
        title: a.summary ?? null,
        description: a.description ?? a.summary ?? null,
        cvssV3Score: a.cvss?.score ?? null,
        cvssV3Vector: a.cvss?.vector_string ?? null,
        severity: ghsaSeverity(a.severity),
        publishedAt: a.published_at ? new Date(a.published_at) : null,
        lastModifiedAt: a.updated_at ? new Date(a.updated_at) : null,
        affectedVersions: v?.package?.name
          ? {
              product: v.package.name,
              vendor: v.package.ecosystem ?? "",
              fixed: v.first_patched_version?.identifier ?? "",
            }
          : undefined,
        sourceUrl: a.html_url ?? `https://github.com/advisories/${a.ghsa_id}`,
      }
    })
  },
}

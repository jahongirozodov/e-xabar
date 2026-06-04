import type { SourceAdapter, NormalizedVuln } from "./base.adapter"

const KEV_URL =
  "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json"

interface KevEntry {
  cveID: string
  vulnerabilityName?: string
  shortDescription?: string
  dateAdded?: string
}

// CISA KEV — kunlik JSON feed (faol ekspluatatsiyadagi zaifliklar). Tarmoq kerak.
export const kevAdapter: SourceAdapter = {
  source: "KEV",
  async fetchVulns(): Promise<NormalizedVuln[]> {
    const res = await fetch(KEV_URL, { signal: AbortSignal.timeout(15000) })
    if (!res.ok) throw new Error(`KEV HTTP ${res.status}`)
    const data = (await res.json()) as { vulnerabilities?: KevEntry[] }
    return (data.vulnerabilities ?? []).map((v) => ({
      cveId: v.cveID,
      title: v.vulnerabilityName ?? null,
      description: v.shortDescription ?? null,
      isKev: true,
      kevAddedDate: v.dateAdded ? new Date(v.dateAdded) : null,
      sourceUrl: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog",
    }))
  },
}

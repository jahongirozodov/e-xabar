import type { SourceAdapter, NormalizedVuln } from "./base.adapter"

// `limit` yolg'iz → 422; `offset` shart; max limit = 20 → sahifalab olamiz.
const USN_BASE = "https://ubuntu.com/security/notices.json"
const PAGE = 20
const PAGES = 3

interface UsnNotice {
  id: string
  title?: string
  summary?: string
  description?: string
  published?: string
  cves?: { id?: string }[]
  cves_ids?: string[]
}

// Ubuntu Security Notices (USN) — har bildirishnoma bir nechta CVE'ni qamraydi,
// ularni alohida NormalizedVuln'ga yoyamiz. Tarmoq kerak.
export const usnAdapter: SourceAdapter = {
  source: "USN",
  async fetchVulns(): Promise<NormalizedVuln[]> {
    const notices: UsnNotice[] = []
    for (let p = 0; p < PAGES; p++) {
      const url = `${USN_BASE}?limit=${PAGE}&offset=${p * PAGE}`
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(20000),
      })
      if (!res.ok) {
        if (p === 0) throw new Error(`USN HTTP ${res.status}`)
        break
      }
      const data = (await res.json()) as { notices?: UsnNotice[] }
      if (!data.notices?.length) break
      notices.push(...data.notices)
    }

    const out: NormalizedVuln[] = []
    for (const n of notices) {
      // `cves` — obyektlar massivi ({id}), `cves_ids` — string massivi.
      const cves =
        n.cves_ids ?? (n.cves ?? []).map((c) => c.id).filter((x): x is string => !!x)
      const url = `https://ubuntu.com/security/notices/${n.id}`
      const published = n.published ? new Date(n.published) : null
      for (const cveId of cves) {
        if (!/^CVE-/i.test(cveId)) continue
        out.push({
          cveId: cveId.toUpperCase(),
          title: n.title ?? n.id,
          description: n.summary ?? n.description ?? null,
          publishedAt: published,
          sourceUrl: url,
        })
      }
    }
    return out
  },
}

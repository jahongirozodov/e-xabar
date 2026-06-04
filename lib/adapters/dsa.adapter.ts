import type { SourceAdapter, NormalizedVuln } from "./base.adapter"

const DSA_LIST_URL =
  "https://salsa.debian.org/security-tracker-team/security-tracker/-/raw/master/data/DSA/list"

// Debian Security Advisories (DSA) — security-tracker'ning matnli ro'yxati.
// Format:
//   [DD Mon YYYY] DSA-NNNN-1 package - security update
//   \t{CVE-XXXX-YYYY CVE-...}
//   \t[release] - package version
// So'nggi DSA'lar fayl boshida. Tarmoq kerak.
export const dsaAdapter: SourceAdapter = {
  source: "DSA",
  async fetchVulns(): Promise<NormalizedVuln[]> {
    const res = await fetch(DSA_LIST_URL, { signal: AbortSignal.timeout(20000) })
    if (!res.ok) throw new Error(`DSA HTTP ${res.status}`)
    const text = await res.text()
    const lines = text.split("\n")

    const out: NormalizedVuln[] = []
    let dsaId = ""
    let pkg = ""
    let count = 0
    const HEADER = /^\[.+?\]\s+(DSA-\d+-\d+)\s+(\S+)/
    const CVES = /\{([^}]*)\}/

    for (const line of lines) {
      const h = line.match(HEADER)
      if (h) {
        if (count >= 40) break // faqat so'nggi ~40 DSA
        dsaId = h[1]
        pkg = h[2]
        count++
        continue
      }
      const c = line.match(CVES)
      if (c && dsaId) {
        const url = `https://security-tracker.debian.org/tracker/${dsaId}`
        for (const cveId of c[1].split(/\s+/).filter((x) => /^CVE-/i.test(x))) {
          out.push({
            cveId: cveId.toUpperCase(),
            title: `${dsaId} — ${pkg}`,
            affectedVersions: pkg ? { product: pkg, vendor: "debian", fixed: "" } : undefined,
            sourceUrl: url,
          })
        }
      }
    }
    return out
  },
}

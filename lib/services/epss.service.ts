// EPSS boyitish — FIRST.org kunlik bulk CSV (~250k CVE).
// Faqat MAVJUD vulnerability'larning epss_score'ini yangilaydi (yangi yozuv yaratmaydi).
import { gunzipSync } from "node:zlib"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db/prisma"

const EPSS_URL = "https://epss.cyentia.com/epss_scores-current.csv.gz"
const CHUNK = 1000

export interface EpssResult {
  rows: number // CSV'dagi EPSS yozuvlari
  updated: number // bazada yangilangan vuln'lar
  error?: string
}

export async function enrichEpss(): Promise<EpssResult> {
  let pairs: { cve: string; epss: string }[]
  try {
    const res = await fetch(EPSS_URL, { signal: AbortSignal.timeout(60000) })
    if (!res.ok) throw new Error(`EPSS HTTP ${res.status}`)
    const gz = Buffer.from(await res.arrayBuffer())
    const csv = gunzipSync(gz).toString("utf8")

    pairs = []
    for (const line of csv.split("\n")) {
      if (!line || line[0] === "#") continue // izoh qatori
      const [cve, epss] = line.split(",")
      if (cve === "cve" || !cve || !epss) continue // sarlavha yoki bo'sh
      if (!cve.startsWith("CVE-")) continue
      pairs.push({ cve, epss })
    }
  } catch (e) {
    return { rows: 0, updated: 0, error: e instanceof Error ? e.message : String(e) }
  }

  let updated = 0
  for (let i = 0; i < pairs.length; i += CHUNK) {
    const chunk = pairs.slice(i, i + CHUNK)
    const tuples = chunk.map((r) => Prisma.sql`(${r.cve}, ${r.epss})`)
    // Faqat mavjud cve_id'lar yangilanadi (JOIN orqali).
    const n = await prisma.$executeRaw`
      UPDATE vulnerabilities AS t
      SET epss_score = c.epss::numeric
      FROM (VALUES ${Prisma.join(tuples)}) AS c(cve, epss)
      WHERE t.cve_id = c.cve
    `
    updated += n
  }

  return { rows: pairs.length, updated }
}

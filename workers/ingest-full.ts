import "dotenv/config"
import { prisma } from "@/lib/db/prisma"
import { runIngestion } from "@/lib/services/ingestion.service"
import { enrichEpss } from "@/lib/services/epss.service"
import { localFeedAdapter } from "@/lib/adapters/local-feed.adapter"
import { kevAdapter } from "@/lib/adapters/kev.adapter"
import { nvdAdapter } from "@/lib/adapters/nvd.adapter"
import { osvAdapter } from "@/lib/adapters/osv.adapter"
import { ghsaAdapter } from "@/lib/adapters/ghsa.adapter"
import { usnAdapter } from "@/lib/adapters/usn.adapter"
import { dsaAdapter } from "@/lib/adapters/dsa.adapter"

// TO'LIQ backfill — NVD barcha CVE'larni sahifalab tortadi (~260k).
// Tezlik: NVD_API_KEY bo'lsa ~daqiqalar, bo'lmasa sekin (5 so'rov/30s).
// NVD_MAX_PAGES=N bilan cheklash mumkin (test uchun).
async function main() {
  console.log("=== TO'LIQ ingestion (full backfill) ===")
  console.log("NVD_API_KEY:", process.env.NVD_API_KEY ? "bor (tez)" : "yo'q (sekin)")
  const adapters = [localFeedAdapter, kevAdapter, nvdAdapter, ghsaAdapter, usnAdapter, dsaAdapter, osvAdapter]
  const res = await runIngestion(adapters, { full: true })
  for (const r of res) {
    console.log(
      `  ${r.source}: ${r.status} · fetched=${r.fetched} upserted=${r.upserted}` +
        (r.error ? ` · ${r.error}` : "")
    )
  }
  console.log("Vulnerabilities jami:", await prisma.vulnerability.count())

  console.log("=== EPSS boyitish (FIRST.org) ===")
  const epss = await enrichEpss()
  if (epss.error) console.log("  EPSS xato:", epss.error)
  else console.log(`  EPSS: ${epss.rows} yozuv · ${epss.updated} vuln yangilandi`)

  await prisma.$disconnect()
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

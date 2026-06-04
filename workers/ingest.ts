import "dotenv/config"
import { prisma } from "@/lib/db/prisma"
import { runIngestion } from "@/lib/services/ingestion.service"
import { localFeedAdapter } from "@/lib/adapters/local-feed.adapter"
import { kevAdapter } from "@/lib/adapters/kev.adapter"
import { nvdAdapter } from "@/lib/adapters/nvd.adapter"
import { osvAdapter } from "@/lib/adapters/osv.adapter"
import { ghsaAdapter } from "@/lib/adapters/ghsa.adapter"
import { usnAdapter } from "@/lib/adapters/usn.adapter"
import { dsaAdapter } from "@/lib/adapters/dsa.adapter"

// Foydalanish:
//   npm run ingest            → local (offline)
//   npm run ingest all        → barcha manbalar
//   npm run ingest usn osv    → tanlangan manbalar (nom bo'yicha)
const BY_NAME = {
  local: localFeedAdapter,
  kev: kevAdapter,
  nvd: nvdAdapter,
  ghsa: ghsaAdapter,
  usn: usnAdapter,
  dsa: dsaAdapter,
  osv: osvAdapter,
} as const

const args = process.argv.slice(2).map((a) => a.toLowerCase())
const mode = args[0] ?? "local"
const adapters =
  mode === "all"
    ? [localFeedAdapter, kevAdapter, nvdAdapter, ghsaAdapter, usnAdapter, dsaAdapter, osvAdapter]
    : args.length
      ? args.map((a) => BY_NAME[a as keyof typeof BY_NAME]).filter(Boolean)
      : [localFeedAdapter]

async function main() {
  console.log(`Ingestion (${mode}) — ${adapters.map((a) => a.source).join(", ")}`)
  const res = await runIngestion(adapters)
  for (const r of res) {
    console.log(
      `  ${r.source}: ${r.status} · fetched=${r.fetched} upserted=${r.upserted}` +
        (r.error ? ` · ${r.error}` : "")
    )
  }
  console.log("Vulnerabilities jami:", await prisma.vulnerability.count())
  await prisma.$disconnect()
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

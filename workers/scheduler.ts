import "dotenv/config"
import { scanQueue, verifyQueue, ingestQueue } from "./queues"
import { logger } from "@/lib/utils/logger"

// Repeatable rejali ishlar — bir marta qo'shiladi:
//  - kunlik ingestion (har kuni 01:00, incremental — oxirgi 2 kun o'zgargan CVE + EPSS)
//  - haftalik skan (yakshanba 02:00)
//  - kunlik verification (har kuni 03:00, muddati o'tgan topilmalar)
async function main() {
  await ingestQueue.add(
    "daily-ingest",
    { sinceDays: 2 },
    { repeat: { pattern: "0 1 * * *" }, jobId: "daily-ingest" }
  )
  await scanQueue.add(
    "scheduled-scan",
    { type: "SCHEDULED" },
    { repeat: { pattern: "0 2 * * 0" }, jobId: "weekly-scan" }
  )
  await verifyQueue.add(
    "daily-verify",
    { thresholdDays: 7 },
    { repeat: { pattern: "0 3 * * *" }, jobId: "daily-verify" }
  )
  logger.info("Rejali ishlar qo'shildi (ingest: kunlik 01:00, skan: yak 02:00, verification: kunlik 03:00)")
  await scanQueue.close()
  await verifyQueue.close()
  await ingestQueue.close()
  process.exit(0)
}

main().catch((e) => {
  logger.error({ err: e }, "Scheduler xatosi")
  process.exit(1)
})

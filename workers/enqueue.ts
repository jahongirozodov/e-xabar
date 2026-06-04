import "dotenv/config"
import { scanQueue } from "./queues"

// Qo'lda test/trigger: scan queue'ga MANUAL job qo'shadi.
async function main() {
  const job = await scanQueue.add("manual-scan", { type: "MANUAL" })
  console.log("Enqueued scan job:", job.id)
  await scanQueue.close()
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

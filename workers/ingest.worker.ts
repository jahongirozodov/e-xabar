import { Worker } from "bullmq"
import { connection, INGEST_QUEUE, type IngestJobData } from "./queues"
import { runIngestion } from "@/lib/services/ingestion.service"
import { enrichEpss } from "@/lib/services/epss.service"
import { localFeedAdapter } from "@/lib/adapters/local-feed.adapter"
import { kevAdapter } from "@/lib/adapters/kev.adapter"
import { nvdAdapter } from "@/lib/adapters/nvd.adapter"
import { osvAdapter } from "@/lib/adapters/osv.adapter"
import { ghsaAdapter } from "@/lib/adapters/ghsa.adapter"
import { usnAdapter } from "@/lib/adapters/usn.adapter"
import { dsaAdapter } from "@/lib/adapters/dsa.adapter"
import { logger } from "@/lib/utils/logger"

const ADAPTERS = [localFeedAdapter, kevAdapter, nvdAdapter, ghsaAdapter, usnAdapter, dsaAdapter, osvAdapter]

// Ingestion ish jarayoni — kunlik cron incremental CVE tortadi + EPSS boyitadi.
// NVD incremental (lastModStartDate), boshqalar so'nggi yozuvlari, keyin EPSS.
export function startIngestWorker() {
  const worker = new Worker(
    INGEST_QUEUE,
    async (job) => {
      const sinceDays = (job.data as IngestJobData)?.sinceDays ?? 2
      const res = await runIngestion(ADAPTERS, { sinceDays })
      const epss = await enrichEpss()
      const summary = {
        sinceDays,
        sources: res.map((r) => `${r.source}:${r.upserted}`).join(" "),
        epssUpdated: epss.updated,
      }
      logger.info(summary, "Ingestion yakunlandi")
      return summary
    },
    { connection }
  )
  worker.on("failed", (job, err) =>
    logger.error({ jobId: job?.id, err: err.message }, "Ingest job failed")
  )
  return worker
}

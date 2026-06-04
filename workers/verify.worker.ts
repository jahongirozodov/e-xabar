import { Worker } from "bullmq"
import { connection, VERIFY_QUEUE, type VerifyJobData } from "./queues"
import { runVerification } from "@/lib/services/verification.service"
import { logger } from "@/lib/utils/logger"

// Verification ish jarayoni — muddati o'tgan topilmalarni qayta tekshiradi.
// BullMQ'dan mustaqil (workers/verify.ts to'g'ridan-to'g'ri ham chaqiradi).
export function startVerifyWorker() {
  const worker = new Worker(
    VERIFY_QUEUE,
    async (job) => {
      const days = (job.data as VerifyJobData)?.thresholdDays ?? 7
      const r = await runVerification(days)
      logger.info(r, "Verification yakunlandi")
      return r
    },
    { connection }
  )
  worker.on("failed", (job, err) =>
    logger.error({ jobId: job?.id, err: err.message }, "Verify job failed")
  )
  return worker
}

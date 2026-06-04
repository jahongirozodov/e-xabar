import { Worker } from "bullmq"
import { connection, SCAN_QUEUE, type ScanJobData } from "./queues"
import { prisma } from "@/lib/db/prisma"
import { runMatching } from "@/lib/services/matching.service"
import { generateNotifications } from "@/lib/services/notification.service"
import { logger } from "@/lib/utils/logger"

export interface ScanJobResult {
  scanId: string
  created: number
  recurring: number
  emails: number
}

// Skan ish jarayoni — ScanRun yaratadi, matching + notification ishga tushiradi.
// BullMQ'dan mustaqil (to'g'ridan-to'g'ri ham chaqirsa bo'ladi — test/inline).
export async function processScanJob(data: ScanJobData): Promise<ScanJobResult> {
  const { type, triggeredById } = data
  const assets = await prisma.asset.count()
  const scan = await prisma.scanRun.create({
    data: {
      scanType: type,
      status: "RUNNING",
      triggeredById: triggeredById ?? null,
      assetsScanned: assets,
    },
  })
  try {
    const { created, recurring } = await runMatching(scan.id)
    const { created: emails } = await generateNotifications(scan.id)
    await prisma.scanRun.update({
      where: { id: scan.id },
      data: {
        status: "COMPLETED",
        finishedAt: new Date(),
        findingsNew: created,
        findingsRecurring: recurring,
        emailsSent: emails,
      },
    })
    logger.info({ scanId: scan.id, created, recurring, emails }, "Skan yakunlandi")
    return { scanId: scan.id, created, recurring, emails }
  } catch (e) {
    await prisma.scanRun.update({
      where: { id: scan.id },
      data: {
        status: "FAILED",
        finishedAt: new Date(),
        errorLog: { message: e instanceof Error ? e.message : String(e) },
      },
    })
    logger.error({ scanId: scan.id, err: e }, "Skan xatosi")
    throw e
  }
}

export function startScanWorker() {
  const worker = new Worker(
    SCAN_QUEUE,
    async (job) => processScanJob(job.data as ScanJobData),
    { connection }
  )
  worker.on("failed", (job, err) => logger.error({ jobId: job?.id, err: err.message }, "Job failed"))
  worker.on("completed", (job) => logger.info({ jobId: job.id }, "Job completed"))
  return worker
}

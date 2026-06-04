import { Queue, type ConnectionOptions } from "bullmq"

const url = new URL(process.env.REDIS_URL ?? "redis://localhost:6379")

export const connection: ConnectionOptions = {
  host: url.hostname,
  port: Number(url.port || 6379),
  password: url.password || undefined,
  maxRetriesPerRequest: null,
}

export const SCAN_QUEUE = "scan"
export const VERIFY_QUEUE = "verify"
export const INGEST_QUEUE = "ingest"

export interface ScanJobData {
  type: "MANUAL" | "SCHEDULED" | "KEV_PRIORITY"
  triggeredById?: string | null
}

export interface VerifyJobData {
  thresholdDays?: number
}

export interface IngestJobData {
  // > 0 → incremental (oxirgi N kun); aks holda yengil (default sahifa)
  sinceDays?: number
}

export const scanQueue = new Queue(SCAN_QUEUE, { connection })
export const verifyQueue = new Queue(VERIFY_QUEUE, { connection })
export const ingestQueue = new Queue(INGEST_QUEUE, { connection })

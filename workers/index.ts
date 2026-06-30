import "dotenv/config"
import { startScanWorker } from "./scan.worker"
import { startVerifyWorker } from "./verify.worker"
import { startIngestWorker } from "./ingest.worker"
import { logger } from "@/lib/utils/logger"

startScanWorker()
startVerifyWorker()
startIngestWorker()
logger.info("OGOH MAI worker'lar ishga tushdi (scan + verify + ingest queue)")

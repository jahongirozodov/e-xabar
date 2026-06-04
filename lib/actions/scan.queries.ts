import "server-only"
import { format } from "date-fns"
import { prisma } from "@/lib/db/prisma"
import type { ScanStatus, ScanType } from "@prisma/client"

export interface ScanRow {
  id: string
  type: ScanType
  started: string
  duration: string
  assets: number
  neu: number
  rec: number
  mail: number
  status: ScanStatus
}

function duration(start: Date, end: Date | null): string {
  if (!end) return "—"
  const secs = Math.max(0, Math.round((end.getTime() - start.getTime()) / 1000))
  return `${Math.floor(secs / 60)}m ${secs % 60}s`
}

export async function getScans(): Promise<ScanRow[]> {
  const scans = await prisma.scanRun.findMany({ orderBy: { startedAt: "desc" }, take: 50 })
  return scans.map((s) => ({
    id: s.id,
    type: s.scanType,
    started: format(s.startedAt, "yyyy-MM-dd HH:mm"),
    duration: duration(s.startedAt, s.finishedAt),
    assets: s.assetsScanned,
    neu: s.findingsNew,
    rec: s.findingsRecurring,
    mail: s.emailsSent,
    status: s.status,
  }))
}

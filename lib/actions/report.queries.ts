import "server-only"
import { format as fmt } from "date-fns"
import { prisma } from "@/lib/db/prisma"

export interface ReportRow {
  id: string
  reportType: string
  period: string
  format: string
  createdAt: string
  hasFile: boolean
}

const TYPE_LABEL: Record<string, string> = {
  weekly: "Haftalik",
  monthly: "Oylik",
  adhoc: "Ad-hoc",
}

export async function getReports(): Promise<ReportRow[]> {
  const reports = await prisma.report.findMany({ orderBy: { createdAt: "desc" }, take: 100 })
  return reports.map((r) => ({
    id: r.id,
    reportType: TYPE_LABEL[r.reportType] ?? r.reportType,
    period: `${fmt(r.periodStart, "dd.MM")} – ${fmt(r.periodEnd, "dd.MM.yyyy")}`,
    format: r.format.toUpperCase(),
    createdAt: fmt(r.createdAt, "yyyy-MM-dd HH:mm"),
    hasFile: !!r.filePath,
  }))
}

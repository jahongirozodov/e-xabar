"use server"

import { mkdir, writeFile } from "fs/promises"
import path from "path"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db/prisma"
import { requirePermission } from "@/lib/rbac/guard"
import { logAudit } from "@/lib/services/audit.service"
import { buildReportData } from "@/lib/services/report.service"
import { renderReportPdf } from "@/lib/reports/report-pdf"
import { renderReportExcel } from "@/lib/reports/report-excel"

// Real PDF/Excel hisobot generatsiyasi — fayl `storage/reports/` ga yoziladi, filePath saqlanadi.
export async function createReport(
  reportType: "weekly" | "monthly" | "adhoc",
  format: "pdf" | "excel"
): Promise<{ ok: boolean }> {
  await requirePermission("reports:export")
  const now = new Date()
  const days = reportType === "monthly" ? 30 : 7
  const periodStart = new Date(now.getTime() - days * 86_400_000)

  const r = await prisma.report.create({
    data: { reportType, periodStart, periodEnd: now, format },
  })

  const data = await buildReportData(reportType, periodStart, now)
  const ext = format === "excel" ? "xlsx" : "pdf"
  const buf = format === "excel" ? await renderReportExcel(data) : await renderReportPdf(data)

  const dir = path.join(process.cwd(), "storage", "reports")
  await mkdir(dir, { recursive: true })
  const rel = path.join("storage", "reports", `${r.id}.${ext}`)
  await writeFile(path.join(process.cwd(), rel), buf)

  await prisma.report.update({ where: { id: r.id }, data: { filePath: rel } })
  await logAudit("GENERATE_REPORT", "report", r.id, { reportType, format, bytes: buf.length })
  revalidatePath("/reports")
  return { ok: true }
}

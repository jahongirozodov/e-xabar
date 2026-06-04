import ExcelJS from "exceljs"
import type { ReportData } from "@/lib/services/report.service"

const TYPE_LABEL: Record<string, string> = {
  weekly: "Haftalik",
  monthly: "Oylik",
  adhoc: "Ad-hoc",
}
const SEV = [
  ["CRITICAL", "Kritik", "FFD4351C"],
  ["HIGH", "Yuqori", "FFD4791C"],
  ["MEDIUM", "O'rta", "FFB8860B"],
  ["LOW", "Past", "FF1C6FD4"],
  ["NONE", "—", "FF71717A"],
] as const

function d(x: Date): string {
  return x.toISOString().slice(0, 10)
}

export async function renderReportExcel(data: ReportData): Promise<Buffer> {
  const wb = new ExcelJS.Workbook()
  wb.creator = "e-Xabar"
  wb.created = data.generatedAt

  // 1) Umumiy
  const ov = wb.addWorksheet("Umumiy")
  ov.columns = [{ width: 28 }, { width: 22 }]
  ov.addRow(["e-Xabar — Kiberxavfsizlik hisoboti"])
  ov.getRow(1).font = { bold: true, size: 14 }
  ov.addRow([`${TYPE_LABEL[data.reportType] ?? data.reportType} hisobot`])
  ov.addRow(["Davr", `${d(data.periodStart)} — ${d(data.periodEnd)}`])
  ov.addRow(["Yaratilgan", d(data.generatedAt)])
  ov.addRow([])
  ov.addRow(["Ko'rsatkich", "Qiymat"]).font = { bold: true }
  ov.addRow(["Faol topilma", data.totals.findings])
  ov.addRow(["KEV topilma", data.totals.kevFindings])
  ov.addRow(["Vositalar", data.totals.assets])
  ov.addRow(["CVE bazasi", data.totals.vulnerabilities])
  ov.addRow(["Yangi topilma (davr)", data.newFindingsInPeriod])
  ov.addRow(["Skan (yakunlangan/jami)", `${data.scans.completed}/${data.scans.total}`])
  ov.addRow(["Xabar yuborilgan", data.notifications.sent])
  ov.addRow(["Xabar tasdiqlangan", data.notifications.acknowledged])

  // 2) Jiddiylik
  const sv = wb.addWorksheet("Jiddiylik")
  sv.columns = [{ width: 16 }, { width: 12 }]
  sv.addRow(["Daraja", "Soni"]).font = { bold: true }
  for (const [key, label, argb] of SEV) {
    const r = sv.addRow([label, data.severity[key]])
    r.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb } }
    r.getCell(1).font = { color: { argb: "FFFFFFFF" }, bold: true }
  }

  // 3) Top vositalar
  const ta = wb.addWorksheet("Top vositalar")
  ta.columns = [
    { header: "Vosita", key: "name", width: 28 },
    { header: "Versiya", key: "ver", width: 14 },
    { header: "Xost", key: "host", width: 20 },
    { header: "Kritik", key: "crit", width: 10 },
    { header: "Jami topilma", key: "count", width: 14 },
  ]
  ta.getRow(1).font = { bold: true }
  for (const a of data.topAssets) {
    ta.addRow({ name: a.name, ver: a.version, host: a.hostname, crit: a.crit, count: a.count })
  }

  const buf = await wb.xlsx.writeBuffer()
  return Buffer.from(buf)
}

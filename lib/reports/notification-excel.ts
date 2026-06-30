import ExcelJS from "exceljs"
import type { AlertFinding } from "@/emails/vulnerability-alert"

const SEV_LABEL: Record<string, string> = {
  CRITICAL: "Kritik",
  HIGH: "Yuqori",
  MEDIUM: "O'rta",
  LOW: "Past",
}

const SEV_ARGB: Record<string, string> = {
  CRITICAL: "FFD4351C",
  HIGH: "FFD4791C",
  MEDIUM: "FFB8860B",
  LOW: "FF1C6FD4",
}

const SEV_RANK: Record<string, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
}

const BORDER_HEADER: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: "FF7FB8F5" } },
  left: { style: "thin", color: { argb: "FF7FB8F5" } },
  bottom: { style: "thin", color: { argb: "FF7FB8F5" } },
  right: { style: "thin", color: { argb: "FF7FB8F5" } },
}

const BORDER_CELL: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: "FFE4E4E7" } },
  left: { style: "thin", color: { argb: "FFE4E4E7" } },
  bottom: { style: "thin", color: { argb: "FFE4E4E7" } },
  right: { style: "thin", color: { argb: "FFE4E4E7" } },
}

export async function buildNotificationExcel(
  employeeName: string,
  findings: AlertFinding[]
): Promise<Buffer> {
  // MAI bo'yicha guruhlash (email shablon bilan bir xil)
  const maiGroups: { name: string; number?: string; items: AlertFinding[] }[] = []
  const maiIndex = new Map<string, number>()
  for (const f of findings) {
    const key = f.maiName || "MAI biriktirilmagan"
    let i = maiIndex.get(key)
    if (i === undefined) {
      i = maiGroups.length
      maiIndex.set(key, i)
      maiGroups.push({ name: key, number: f.maiNumber, items: [] })
    }
    maiGroups[i].items.push(f)
  }
  for (const g of maiGroups) {
    g.items.sort((a, b) => (SEV_RANK[a.severity] ?? 9) - (SEV_RANK[b.severity] ?? 9))
  }

  const wb = new ExcelJS.Workbook()
  wb.creator = "OGOH MAI"

  const ws = wb.addWorksheet("Zaifliklar")
  ws.columns = [
    { key: "num", width: 6 },
    { key: "mai", width: 30 },
    { key: "asset", width: 30 },
    { key: "cve", width: 20 },
    { key: "sev", width: 14 },
  ]

  // Sarlavha qatori
  const headerRow = ws.addRow(["T/r", "MAI nomi", "Vosita nomi", "CVE", "Darajasi"])
  headerRow.height = 20
  headerRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFA2D2FF" } }
    cell.font = { bold: true, color: { argb: "FF18181B" } }
    cell.border = BORDER_HEADER
    cell.alignment = { vertical: "middle", horizontal: "center" }
  })

  let rowIdx = 2
  for (let gIdx = 0; gIdx < maiGroups.length; gIdx++) {
    const g = maiGroups[gIdx]
    const startRow = rowIdx

    for (const f of g.items) {
      const assetLabel =
        f.assetName +
        (f.assetVersion && !f.assetName.includes(f.assetVersion) ? ` ${f.assetVersion}` : "")
      const cveLabel = f.cveId + (f.isKev ? " · KEV" : "")

      const row = ws.addRow([
        gIdx + 1,
        g.name + (g.number ? ` (${g.number})` : ""),
        assetLabel,
        cveLabel,
        SEV_LABEL[f.severity] ?? f.severity,
      ])
      row.height = 18
      row.eachCell((cell) => {
        cell.border = BORDER_CELL
        cell.alignment = { vertical: "middle", wrapText: true }
      })

      const sevCell = row.getCell(5)
      const argb = SEV_ARGB[f.severity]
      if (argb) {
        sevCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb } }
        sevCell.font = { color: { argb: "FFFFFFFF" }, bold: true }
        sevCell.alignment = { vertical: "middle", horizontal: "center" }
      }

      rowIdx++
    }

    const endRow = rowIdx - 1
    if (g.items.length > 1) {
      ws.mergeCells(startRow, 1, endRow, 1)
      ws.mergeCells(startRow, 2, endRow, 2)
    }

    ws.getCell(startRow, 1).alignment = { vertical: "middle", horizontal: "center" }
    ws.getCell(startRow, 1).font = { bold: true }
    ws.getCell(startRow, 2).alignment = { vertical: "middle", wrapText: true }
    ws.getCell(startRow, 2).font = { bold: true }
  }

  const buf = await wb.xlsx.writeBuffer()
  return Buffer.from(buf)
}

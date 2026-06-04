import { readFile } from "fs/promises"
import path from "path"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { requirePermission } from "@/lib/rbac/guard"

const MIME: Record<string, string> = {
  pdf: "application/pdf",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
}

// Hisobot faylini yuklab olish — autentifikatsiya + ruxsat talab qiladi (proxy /api'ni o'tkazib yuboradi).
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("reports:export")
  } catch (e) {
    const msg = e instanceof Error ? e.message : "ERROR"
    return NextResponse.json({ error: msg }, { status: msg === "UNAUTHORIZED" ? 401 : 403 })
  }

  const { id } = await params
  const report = await prisma.report.findUnique({ where: { id } })
  if (!report?.filePath) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 })

  // Path traversal himoyasi: faqat storage/reports ichidagi fayl.
  const abs = path.join(process.cwd(), report.filePath)
  const root = path.join(process.cwd(), "storage", "reports")
  if (!abs.startsWith(root)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 })

  let buf: Buffer
  try {
    buf = await readFile(abs)
  } catch {
    return NextResponse.json({ error: "FILE_MISSING" }, { status: 404 })
  }

  const ext = report.format === "excel" ? "xlsx" : "pdf"
  const fname = `exabar-${report.reportType}-${report.periodEnd.toISOString().slice(0, 10)}.${ext}`
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": MIME[ext] ?? "application/octet-stream",
      "Content-Disposition": `attachment; filename="${fname}"`,
      "Content-Length": String(buf.length),
    },
  })
}

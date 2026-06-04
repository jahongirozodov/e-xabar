"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { FileText, Download, FileSpreadsheet } from "lucide-react"
import type { ReportRow } from "@/lib/actions/report.queries"
import { createReport } from "@/lib/actions/report.actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

const TYPES: [string, string][] = [
  ["weekly", "Haftalik"],
  ["monthly", "Oylik"],
  ["adhoc", "Ad-hoc"],
]
const FORMATS: [string, string][] = [
  ["pdf", "PDF"],
  ["excel", "Excel"],
]

export function ReportsView({ reports }: { reports: ReportRow[] }) {
  const router = useRouter()
  const [type, setType] = React.useState<"weekly" | "monthly" | "adhoc">("weekly")
  const [format, setFormat] = React.useState<"pdf" | "excel">("pdf")
  const [busy, setBusy] = React.useState(false)

  async function onGenerate() {
    setBusy(true)
    try {
      await createReport(type, format)
      toast.success("Hisobot yaratildi", { description: `${type} · ${format.toUpperCase()}` })
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Hisobot yaratish</CardTitle>
          <CardDescription>Tur va formatni tanlang, so&apos;ng generatsiya qiling.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Tur</span>
            <div className="flex gap-1 rounded-md border p-0.5">
              {TYPES.map(([id, label]) => (
                <button key={id} onClick={() => setType(id as typeof type)} className={cn("rounded px-3 py-1 text-sm transition-colors", type === id ? "bg-secondary font-medium" : "text-muted-foreground hover:bg-accent")}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Format</span>
            <div className="flex gap-1 rounded-md border p-0.5">
              {FORMATS.map(([id, label]) => (
                <button key={id} onClick={() => setFormat(id as typeof format)} className={cn("rounded px-3 py-1 text-sm transition-colors", format === id ? "bg-secondary font-medium" : "text-muted-foreground hover:bg-accent")}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={onGenerate} disabled={busy}>
            <FileText className="size-4" /> {busy ? "Yaratilmoqda..." : "Hisobot yaratish"}
          </Button>
        </CardContent>
      </Card>

      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Hisobot</TableHead>
              <TableHead>Davr</TableHead>
              <TableHead>Format</TableHead>
              <TableHead>Yaratilgan</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <span className="inline-flex items-center gap-2 text-sm font-medium">
                    <span className="grid size-7 place-items-center rounded-md bg-muted text-muted-foreground">
                      {r.format === "EXCEL" ? <FileSpreadsheet className="size-[14px]" /> : <FileText className="size-[14px]" />}
                    </span>
                    {r.reportType} hisobot
                  </span>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{r.period}</TableCell>
                <TableCell><span className="rounded bg-muted px-2 py-0.5 text-xs">{r.format}</span></TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{r.createdAt}</TableCell>
                <TableCell>
                  <Button asChild variant="ghost" size="icon" className="size-8" disabled={!r.hasFile} title={r.hasFile ? "Yuklab olish" : "Fayl tayyorlanmoqda"}>
                    {r.hasFile ? (
                      <a href={`/api/reports/${r.id}`} download>
                        <Download className="size-4" />
                      </a>
                    ) : (
                      <span>
                        <Download className="size-4" />
                      </span>
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {reports.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Hali hisobot yo&apos;q.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
      <div className="text-xs text-muted-foreground">{reports.length} ta hisobot</div>
    </div>
  )
}

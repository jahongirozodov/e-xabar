"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Clock, ScanLine, Bug, Radar, RefreshCw, ShieldAlert, type LucideIcon } from "lucide-react"
import type { ScanRow } from "@/lib/actions/scan.queries"
import { runManualScan } from "@/lib/actions/scan.actions"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const TYPE_META: Record<string, { label: string; icon: LucideIcon }> = {
  SCHEDULED: { label: "Rejali", icon: Clock },
  MANUAL: { label: "Qo'lda", icon: Radar },
  KEV_PRIORITY: { label: "KEV ustuvor", icon: ShieldAlert },
}
const STATUS_META: Record<string, { label: string; color: string }> = {
  COMPLETED: { label: "Yakunlandi", color: "var(--success)" },
  RUNNING: { label: "Bajarilmoqda", color: "var(--sev-l)" },
  FAILED: { label: "Xato", color: "var(--sev-c)" },
  CANCELLED: { label: "Bekor qilindi", color: "var(--muted-foreground)" },
}

export function ScansView({ scans }: { scans: ScanRow[] }) {
  const router = useRouter()
  const [busy, setBusy] = React.useState(false)
  const last = scans.find((s) => s.status === "COMPLETED")

  async function onRun() {
    setBusy(true)
    try {
      const res = await runManualScan()
      toast.success("Skan yakunlandi", {
        description: `${res.created} yangi · ${res.recurring} takroriy · ${res.emails} email`,
      })
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card><CardContent className="flex items-center gap-3 p-4"><span className="grid size-9 place-items-center rounded-md bg-muted"><Clock className="size-4" /></span><div><div className="text-base font-bold">Yakshanba 02:00</div><div className="text-xs text-muted-foreground">Keyingi rejali skan</div></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4"><span className="grid size-9 place-items-center rounded-md bg-muted"><ScanLine className="size-4" /></span><div><div className="text-xl font-bold">{last ? last.assets : "—"}</div><div className="text-xs text-muted-foreground">Oxirgi skanda vosita</div></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4"><span className="grid size-9 place-items-center rounded-md" style={{ color: "var(--sev-h)", background: "color-mix(in oklab, var(--sev-h) 14%, transparent)" }}><Bug className="size-4" /></span><div><div className="text-xl font-bold">{last ? last.neu : "—"}</div><div className="text-xs text-muted-foreground">Oxirgi yangi topilma</div></div></CardContent></Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <RefreshCw className="size-3.5" /> Skanlar avtomatik (haftalik) yoki qo&apos;lda ishga tushiriladi
        </span>
        <Button size="sm" onClick={onRun} disabled={busy}>
          <Radar className={busy ? "size-4 animate-spin" : "size-4"} />
          {busy ? "Bajarilmoqda..." : "Skan ishga tushirish"}
        </Button>
      </div>

      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Skan turi</TableHead>
              <TableHead>Boshlanish vaqti</TableHead>
              <TableHead>Davomiyligi</TableHead>
              <TableHead className="text-right">Tekshirilgan vositalar</TableHead>
              <TableHead className="text-right">Yangi topilmalar</TableHead>
              <TableHead className="text-right">Takroriy topilmalar</TableHead>
              <TableHead className="text-right">Yuborilgan email</TableHead>
              <TableHead>Holati</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scans.map((s) => {
              const tm = TYPE_META[s.type] ?? TYPE_META.MANUAL
              const Icon = tm.icon
              const st = STATUS_META[s.status] ?? STATUS_META.COMPLETED
              const failed = s.status === "FAILED"
              return (
                <TableRow key={s.id}>
                  <TableCell>
                    <span className="inline-flex items-center gap-2 text-sm font-medium">
                      <span className="grid size-7 place-items-center rounded-md bg-muted text-muted-foreground"><Icon className="size-[14px]" /></span>
                      {tm.label}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{s.started}</TableCell>
                  <TableCell className="font-mono text-xs">{s.duration}</TableCell>
                  <TableCell className="text-right font-mono">{s.assets || "—"}</TableCell>
                  <TableCell className="text-right font-mono font-semibold" style={{ color: s.neu ? "var(--sev-c)" : "var(--muted-foreground)" }}>{failed ? "—" : s.neu}</TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">{failed ? "—" : s.rec}</TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">{failed ? "—" : s.mail}</TableCell>
                  <TableCell>
                    <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ color: st.color, backgroundColor: `color-mix(in oklab, ${st.color} 14%, transparent)` }}>{st.label}</span>
                  </TableCell>
                </TableRow>
              )
            })}
            {scans.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  Hali skan yo&apos;q. &quot;Skan ishga tushirish&quot; tugmasini bosing.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
      <div className="text-xs text-muted-foreground">{scans.length} ta skan · oxirgi 30 kun</div>
    </div>
  )
}

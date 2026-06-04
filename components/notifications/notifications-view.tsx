"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Mail, CircleCheck, AlertTriangle, ChevronRight, ChevronDown, Send } from "lucide-react"
import type { NotifRow } from "@/lib/actions/notification.queries"
import { resendNotification } from "@/lib/actions/notification.actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const STATUS_META: Record<string, { label: string; color: string }> = {
  SENT: { label: "Yuborilgan", color: "var(--sev-l)" },
  QUEUED: { label: "Navbatda", color: "var(--muted-foreground)" },
  FAILED: { label: "Xato", color: "var(--sev-c)" },
  BOUNCED: { label: "Qaytarilgan", color: "var(--sev-h)" },
}
const ACK_META = { label: "Tasdiqlangan", color: "var(--success)" }

const FILTERS: [string, string][] = [
  ["all", "Hammasi"],
  ["SENT", "Yuborilgan"],
  ["ACKNOWLEDGED", "Tasdiqlangan"],
  ["BOUNCED", "Muammoli"],
]

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase()
}

export function NotificationsView({ notifications }: { notifications: NotifRow[] }) {
  const router = useRouter()
  const [seg, setSeg] = React.useState("all")
  const [openId, setOpenId] = React.useState<string | null>(null)
  const [resendingId, setResendingId] = React.useState<string | null>(null)

  async function onResend(id: string) {
    setResendingId(id)
    try {
      const res = await resendNotification(id)
      if (res.ok) {
        toast.success("Xabar qayta yuborildi")
        router.refresh()
      } else {
        toast.error(res.error ?? "Yuborilmadi")
      }
    } finally {
      setResendingId(null)
    }
  }

  const sent = notifications.filter((r) => r.status !== "QUEUED" && r.status !== "FAILED").length
  const ack = notifications.filter((r) => r.ack != null).length
  const ackRate = sent ? Math.round((ack / sent) * 100) : 0
  const issues = notifications.filter((r) => r.status === "BOUNCED" || r.status === "FAILED").length

  const filtered = notifications.filter((r) => {
    if (seg === "all") return true
    if (seg === "BOUNCED") return r.status === "BOUNCED" || r.status === "FAILED"
    if (seg === "ACKNOWLEDGED") return r.ack != null
    return r.status === seg
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card><CardContent className="flex items-center gap-3 p-4"><span className="grid size-9 place-items-center rounded-md bg-muted"><Mail className="size-4" /></span><div><div className="text-xl font-bold">{sent}</div><div className="text-xs text-muted-foreground">Yuborilgan xabar</div></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4"><span className="grid size-9 place-items-center rounded-md" style={{ color: "var(--success)", background: "color-mix(in oklab, var(--success) 15%, transparent)" }}><CircleCheck className="size-4" /></span><div><div className="text-xl font-bold">{ackRate}%</div><div className="text-xs text-muted-foreground">Tasdiqlash darajasi</div></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4"><span className="grid size-9 place-items-center rounded-md" style={{ color: "var(--sev-h)", background: "color-mix(in oklab, var(--sev-h) 14%, transparent)" }}><AlertTriangle className="size-4" /></span><div><div className="text-xl font-bold">{issues}</div><div className="text-xs text-muted-foreground">Yetkazilmagan</div></div></CardContent></Card>
      </div>

      <div className="flex gap-1 self-start rounded-md border p-0.5">
        {FILTERS.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setSeg(id)}
            className={cn(
              "rounded px-3 py-1 text-sm transition-colors",
              seg === id ? "bg-secondary font-medium" : "text-muted-foreground hover:bg-accent"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-8" />
              <TableHead>Qabul qiluvchi</TableHead>
              <TableHead>MAI obyekti</TableHead>
              <TableHead>Mavzu</TableHead>
              <TableHead className="text-center">Topilma</TableHead>
              <TableHead>Holat</TableHead>
              <TableHead>Yuborilgan</TableHead>
              <TableHead>Tasdiqlangan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((n) => {
              const st = n.ack ? ACK_META : STATUS_META[n.status] ?? STATUS_META.SENT
              const open = openId === n.id
              return (
                <React.Fragment key={n.id}>
                  <TableRow
                    className="cursor-pointer"
                    onClick={() => setOpenId(open ? null : n.id)}
                  >
                    <TableCell className="pr-0 text-muted-foreground">
                      {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-8"><AvatarFallback className="text-xs">{initials(n.who)}</AvatarFallback></Avatar>
                        <div className="min-w-0">
                          <div className="text-sm font-medium">{n.who}</div>
                          <div className="text-[0.6875rem] text-muted-foreground">{n.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><span className="text-sm">{n.mai}</span></TableCell>
                    <TableCell><span className="text-sm">{n.subj}</span></TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex justify-center gap-1">
                        {n.crit > 0 && <span className="rounded px-1.5 py-px text-xs font-medium" style={{ color: "var(--sev-c)", background: "color-mix(in oklab, var(--sev-c) 14%, transparent)" }}>{n.crit}C</span>}
                        {n.high > 0 && <span className="rounded px-1.5 py-px text-xs font-medium" style={{ color: "var(--sev-h)", background: "color-mix(in oklab, var(--sev-h) 16%, transparent)" }}>{n.high}H</span>}
                        {n.crit === 0 && n.high === 0 && <span className="text-xs text-muted-foreground">{n.cnt}</span>}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ color: st.color, backgroundColor: `color-mix(in oklab, ${st.color} 14%, transparent)` }}>{st.label}</span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{n.sent}</TableCell>
                    <TableCell className="font-mono text-xs" style={{ color: n.ack ? "var(--success)" : "var(--muted-foreground)" }}>{n.ack ?? "—"}</TableCell>
                  </TableRow>
                  {open && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={8} className="bg-muted/30 p-3">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-muted-foreground">Yuborilgan email shabloni</span>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!n.html || resendingId === n.id}
                            onClick={() => onResend(n.id)}
                          >
                            <Send className={resendingId === n.id ? "size-4 animate-pulse" : "size-4"} />
                            {resendingId === n.id ? "Yuborilmoqda..." : "Qayta yuborish"}
                          </Button>
                        </div>
                        {n.html ? (
                          <iframe
                            title={`email-${n.id}`}
                            srcDoc={n.html}
                            sandbox=""
                            className="h-[520px] w-full rounded-md border bg-white"
                          />
                        ) : (
                          <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                            Shablon saqlanmagan (bu xabar ushbu funksiyadan oldin yuborilgan).
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              )
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  Hozircha xabarnoma yo&apos;q.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
      <div className="text-xs text-muted-foreground">{filtered.length} ta xabar · {ack} tasdiqlangan</div>
    </div>
  )
}

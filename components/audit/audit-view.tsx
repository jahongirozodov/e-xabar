"use client"

import * as React from "react"
import {
  Search,
  Filter,
  ChevronDown,
  Download,
  LogIn,
  Plus,
  Pencil,
  Trash2,
  ListChecks,
  Radar,
  Ban,
  Mail,
  Settings,
  Activity,
  type LucideIcon,
} from "lucide-react"
import type { AuditRow } from "@/lib/actions/audit.queries"
import { ACTION_META, actionMeta, auditToneVar } from "@/lib/audit"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const ICONS: Record<string, LucideIcon> = {
  "log-in": LogIn,
  plus: Plus,
  pencil: Pencil,
  "trash-2": Trash2,
  "list-checks": ListChecks,
  radar: Radar,
  ban: Ban,
  mail: Mail,
  settings: Settings,
  download: Download,
  activity: Activity,
}

export function AuditView({ logs }: { logs: AuditRow[] }) {
  const [q, setQ] = React.useState("")
  const [actF, setActF] = React.useState<string>("all")

  const rows = React.useMemo(
    () =>
      logs.filter((l) => {
        if (actF !== "all" && l.action !== actF) return false
        if (q && !(l.actorName + l.detail + l.action).toLowerCase().includes(q.toLowerCase())) return false
        return true
      }),
    [logs, q, actF]
  )

  const groups = React.useMemo(() => {
    const g: { date: string; items: AuditRow[] }[] = []
    for (const l of rows) {
      let grp = g.find((x) => x.date === l.dateLabel)
      if (!grp) {
        grp = { date: l.dateLabel, items: [] }
        g.push(grp)
      }
      grp.items.push(l)
    }
    return g
  }, [rows])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-[15px] -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Foydalanuvchi yoki amal..."
            className="h-9 w-64 pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="size-4" />
                {actF === "all" ? "Barcha amallar" : actionMeta(actF).label}
                <ChevronDown className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem checked={actF === "all"} onSelect={() => setActF("all")}>
                Barcha amallar
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              {Object.keys(ACTION_META).map((k) => (
                <DropdownMenuCheckboxItem key={k} checked={actF === k} onSelect={() => setActF(k)}>
                  {ACTION_META[k].label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm">
            <Download className="size-4" /> Eksport
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="px-0 py-2">
          {groups.map((g) => (
            <div key={g.date}>
              <div className="px-5 py-2 text-xs font-medium text-muted-foreground">{g.date}</div>
              {g.items.map((l) => {
                const meta = actionMeta(l.action)
                const Icon = ICONS[meta.icon] ?? Activity
                const color = auditToneVar(meta.tone)
                return (
                  <div key={l.id} className="flex items-start gap-3 px-5 py-2.5">
                    <span
                      className="grid size-8 shrink-0 place-items-center rounded-md"
                      style={{ color, backgroundColor: `color-mix(in oklab, ${color} 14%, transparent)` }}
                    >
                      <Icon className="size-[15px]" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm">
                        <b>{l.actorName}</b> · {meta.label}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">{l.detail}</div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end">
                      <span className="text-xs text-muted-foreground">{l.timeLabel}</span>
                      <span className="font-mono text-[0.625rem] text-muted-foreground">{l.ip}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
          {rows.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">Hech narsa topilmadi.</div>
          )}
        </CardContent>
      </Card>
      <div className="text-xs text-muted-foreground">{rows.length} ta yozuv · o&apos;zgarmas jurnal</div>
    </div>
  )
}

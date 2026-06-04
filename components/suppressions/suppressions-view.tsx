"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Search,
  Plus,
  Ban,
  Clock,
  Shield,
  Bug,
  Package,
  Server,
  Filter,
  MoreHorizontal,
  Trash2,
  type LucideIcon,
} from "lucide-react"
import type { SuppressionRow } from "@/lib/actions/suppression.queries"
import { toggleSuppression, deleteSuppression } from "@/lib/actions/suppression.actions"
import { SCOPE_META } from "@/lib/validations/suppression.schema"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { SuppressionFormDialog } from "./suppression-form-dialog"

const SCOPE_ICONS: Record<string, LucideIcon> = { bug: Bug, package: Package, server: Server, filter: Filter, shield: Shield }

function expiryMeta(s: SuppressionRow): { color: string; label: string; sub: string } {
  if (!s.isActive) return { color: "var(--muted-foreground)", label: "O'chirilgan", sub: s.expiresAt }
  if (s.daysLeft < 0) return { color: "var(--sev-c)", label: "Tugagan", sub: `${Math.abs(s.daysLeft)} kun oldin` }
  if (s.daysLeft <= 14) return { color: "var(--sev-h)", label: "Tez orada", sub: `${s.daysLeft} kun qoldi` }
  return { color: "var(--success)", label: "Faol", sub: `${s.daysLeft} kun qoldi` }
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase()
}

const FILTERS: [string, string][] = [
  ["all", "Hammasi"],
  ["active", "Faol"],
  ["expiring", "Tez orada tugaydi"],
  ["expired", "Tugagan"],
]

export function SuppressionsView({ suppressions }: { suppressions: SuppressionRow[] }) {
  const router = useRouter()
  const [q, setQ] = React.useState("")
  const [seg, setSeg] = React.useState("all")
  const [addOpen, setAddOpen] = React.useState(false)

  const filtered = suppressions.filter((s) => {
    if (q && !(s.target + s.reason + s.byName).toLowerCase().includes(q.toLowerCase())) return false
    if (seg === "active") return s.isActive && s.daysLeft >= 0
    if (seg === "expiring") return s.isActive && s.daysLeft >= 0 && s.daysLeft <= 14
    if (seg === "expired") return !s.isActive || s.daysLeft < 0
    return true
  })

  const activeCount = suppressions.filter((s) => s.isActive && s.daysLeft >= 0).length
  const expiringCount = suppressions.filter((s) => s.isActive && s.daysLeft >= 0 && s.daysLeft <= 14).length
  const suppressedCount = suppressions
    .filter((s) => s.isActive && s.daysLeft >= 0)
    .reduce((a, s) => a + s.affected, 0)

  async function onToggle(s: SuppressionRow) {
    const res = await toggleSuppression(s.id, !s.isActive)
    if (res.ok) router.refresh()
    else toast.error("Xatolik")
  }
  async function onDelete(s: SuppressionRow) {
    if (!window.confirm(`"${s.target}" qoidasi butunlay o'chirilsinmi?`)) return
    const res = await deleteSuppression(s.id)
    if (res.ok) {
      toast.success("O'chirildi")
      router.refresh()
    } else toast.error("Xatolik")
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card><CardContent className="flex items-center gap-3 p-4"><span className="grid size-9 place-items-center rounded-md bg-muted"><Ban className="size-4" /></span><div><div className="text-xl font-bold">{activeCount}</div><div className="text-xs text-muted-foreground">Faol qoida</div></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4"><span className="grid size-9 place-items-center rounded-md" style={{ color: "var(--sev-h)", background: "color-mix(in oklab, var(--sev-h) 14%, transparent)" }}><Clock className="size-4" /></span><div><div className="text-xl font-bold">{expiringCount}</div><div className="text-xs text-muted-foreground">Tez orada tugaydi</div></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4"><span className="grid size-9 place-items-center rounded-md bg-muted"><Shield className="size-4" /></span><div><div className="text-xl font-bold">{suppressedCount}</div><div className="text-xs text-muted-foreground">Bostirilgan topilma</div></div></CardContent></Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-[15px] -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="CVE, nishon yoki sabab..." className="h-9 w-64 pl-8" />
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="size-4" /> Qoida qo&apos;shish
        </Button>
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
              <TableHead>Qamrov / nishon</TableHead>
              <TableHead>Sabab</TableHead>
              <TableHead>Yaratgan</TableHead>
              <TableHead className="w-36">Amal muddati</TableHead>
              <TableHead className="w-16 text-center">Ta&apos;sir</TableHead>
              <TableHead className="w-14 text-center">Holat</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((s) => {
              const em = expiryMeta(s)
              const Icon = SCOPE_ICONS[SCOPE_META[s.scope].icon] ?? Shield
              return (
                <TableRow key={s.id} className={cn(!s.isActive && "opacity-55")}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <span className="grid size-7 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                        <Icon className="size-[14px]" />
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{s.target}</div>
                        <div className="text-xs text-muted-foreground">{SCOPE_META[s.scope].label}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><span className="line-clamp-2 max-w-xs text-xs text-muted-foreground">{s.reason}</span></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-6"><AvatarFallback className="text-[0.625rem]">{initials(s.byName)}</AvatarFallback></Avatar>
                      <span className="truncate text-sm">{s.byName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ color: em.color, backgroundColor: `color-mix(in oklab, ${em.color} 14%, transparent)` }}>{em.label}</span>
                    <div className="mt-0.5 text-[0.625rem] text-muted-foreground">{em.sub}</div>
                  </TableCell>
                  <TableCell className="text-center font-mono font-semibold">{s.affected}</TableCell>
                  <TableCell className="text-center">
                    <Switch checked={s.isActive} onCheckedChange={() => onToggle(s)} />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8"><MoreHorizontal className="size-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem variant="destructive" onSelect={() => onDelete(s)}>
                          <Trash2 className="size-4" /> Butunlay o&apos;chirish
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Hech narsa topilmadi.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
      <div className="text-xs text-muted-foreground">
        {filtered.length} ta qoida · har bir bostirish muddati majburiy
      </div>

      <SuppressionFormDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}

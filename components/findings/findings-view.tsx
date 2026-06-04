"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Filter, X, ShieldAlert, ListChecks, ChevronDown } from "lucide-react"
import type { FindingStatus, Severity } from "@prisma/client"
import type { FindingRow } from "@/lib/actions/finding.queries"
import { updateFindingStatus } from "@/lib/actions/finding.actions"
import { DataTable } from "@/components/data-table/data-table"
import { getFindingColumns } from "./finding-columns"
import { FindingDetailDrawer } from "./finding-detail-drawer"
import { TriageMenu } from "./triage-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SEVERITY_LABEL_UZ, severityVar } from "@/lib/severity"
import { FINDING_STATUS_LABEL_UZ } from "@/lib/findings"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const SEV_CHIPS: Severity[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"]
const STATUS_FILTER: FindingStatus[] = [
  "NEW",
  "PENDING_REVIEW",
  "APPLICABLE",
  "NOTIFIED",
  "IN_PROGRESS",
  "PATCHED",
  "NOT_APPLICABLE",
  "ACCEPTED_RISK",
]

function toggle<T>(set: Set<T>, v: T): Set<T> {
  const n = new Set(set)
  if (n.has(v)) n.delete(v)
  else n.add(v)
  return n
}

export function FindingsView({ findings }: { findings: FindingRow[] }) {
  const router = useRouter()
  const [sevF, setSevF] = React.useState<Set<string>>(new Set())
  const [statusF, setStatusF] = React.useState<Set<string>>(new Set())
  const [kevOnly, setKevOnly] = React.useState(false)
  const [drawer, setDrawer] = React.useState<FindingRow | null>(null)
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  const filtered = React.useMemo(
    () =>
      findings.filter((f) => {
        if (sevF.size && !sevF.has(f.severity)) return false
        if (statusF.size && !statusF.has(f.status)) return false
        if (kevOnly && !f.kev) return false
        return true
      }),
    [findings, sevF, statusF, kevOnly]
  )

  const onTriage = React.useCallback(
    async (ids: string[], status: FindingStatus) => {
      const res = await updateFindingStatus(ids, status)
      if (res.ok) {
        toast.success("Holat yangilandi", {
          description: `${res.count} ta topilma → ${FINDING_STATUS_LABEL_UZ[status]}`,
        })
        router.refresh()
      } else {
        toast.error(res.error ?? "Xatolik")
      }
    },
    [router]
  )

  const columns = React.useMemo(
    () =>
      getFindingColumns({
        onView: (f) => {
          setDrawer(f)
          setDrawerOpen(true)
        },
        onTriage,
      }),
    [onTriage]
  )

  const activeFilters = sevF.size + statusF.size + (kevOnly ? 1 : 0)
  const kevCount = filtered.filter((f) => f.kev).length
  const critCount = filtered.filter((f) => f.severity === "CRITICAL").length

  return (
    <div className="flex flex-col gap-4">
      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Daraja</span>
        {SEV_CHIPS.map((s) => {
          const active = sevF.has(s)
          const v = severityVar(s)
          return (
            <button
              key={s}
              onClick={() => setSevF((x) => toggle(x, s))}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors hover:bg-accent",
                active && "font-medium"
              )}
              style={active ? { borderColor: v, color: v, background: `color-mix(in oklab, ${v} 14%, transparent)` } : undefined}
            >
              <span className="size-1.5 rounded-full" style={{ background: v }} />
              {SEVERITY_LABEL_UZ[s]}
            </button>
          )
        })}
        <span className="mx-1 h-4 w-px bg-border" />
        <button
          onClick={() => setKevOnly((v) => !v)}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors hover:bg-accent",
            kevOnly && "font-medium"
          )}
          style={kevOnly ? { borderColor: "var(--kev)", color: "var(--kev)", background: "color-mix(in oklab, var(--kev) 14%, transparent)" } : undefined}
        >
          <ShieldAlert className="size-3.5" /> Faqat KEV
        </button>
        <span className="mx-1 h-4 w-px bg-border" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors hover:bg-accent",
                statusF.size && "border-primary font-medium"
              )}
            >
              <Filter className="size-3.5" /> Holat{statusF.size ? ` (${statusF.size})` : ""}
              <ChevronDown className="size-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {STATUS_FILTER.map((s) => (
              <DropdownMenuCheckboxItem
                key={s}
                checked={statusF.has(s)}
                onCheckedChange={() => setStatusF((x) => toggle(x, s))}
                onSelect={(e) => e.preventDefault()}
              >
                {FINDING_STATUS_LABEL_UZ[s]}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {activeFilters > 0 && (
          <button
            onClick={() => {
              setSevF(new Set())
              setStatusF(new Set())
              setKevOnly(false)
            }}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="size-3" /> Tozalash ({activeFilters})
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        getRowId={(f) => f.id}
        searchPlaceholder="CVE, vosita, xost yoki xodim..."
        onRowClick={(f) => {
          setDrawer(f)
          setDrawerOpen(true)
        }}
        pageSize={12}
        toolbar={(selected) => (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              <b>{selected.length}</b> tanlandi
            </span>
            <TriageMenu
              trigger={
                <Button size="sm" variant="outline">
                  <ListChecks className="size-4" /> Triage
                </Button>
              }
              onPick={(s) => onTriage(selected.map((x) => x.id), s)}
            />
          </div>
        )}
      />

      <div className="text-xs text-muted-foreground">
        {filtered.length} ta topilma · {kevCount} KEV · {critCount} critical
      </div>

      <FindingDetailDrawer
        finding={drawer}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onTriage={onTriage}
      />
    </div>
  )
}

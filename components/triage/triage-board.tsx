"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core"
import { Package, Search, ListChecks } from "lucide-react"
import type { FindingStatus } from "@prisma/client"
import type { FindingRow } from "@/lib/actions/finding.queries"
import { updateFindingStatus } from "@/lib/actions/finding.actions"
import { SeverityBadge, KevBadge } from "@/components/severity-badge"
import { ConfidenceBar } from "@/components/findings/confidence-bar"
import { FindingDetailDrawer } from "@/components/findings/finding-detail-drawer"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface Col {
  id: string
  label: string
  color: string
  hint: string
  status: FindingStatus
}

const COLS: Col[] = [
  { id: "queue", label: "Navbatda", color: "var(--sev-l)", hint: "Ko'rib chiqishni kutmoqda", status: "NEW" },
  { id: "review", label: "Tekshirilmoqda", color: "var(--sev-h)", hint: "Mutaxassis tahlil qilmoqda", status: "PENDING_REVIEW" },
  { id: "applicable", label: "Tasdiqlangan", color: "var(--sev-c)", hint: "Haqiqiy zaiflik", status: "APPLICABLE" },
  { id: "not_app", label: "Tegishli emas", color: "var(--muted-foreground)", hint: "False positive", status: "NOT_APPLICABLE" },
  { id: "accepted", label: "Xavf qabul qilingan", color: "var(--kev)", hint: "Kompensatsion nazorat", status: "ACCEPTED_RISK" },
]

function colOf(status: FindingStatus): string {
  switch (status) {
    case "NEW":
      return "queue"
    case "PENDING_REVIEW":
    case "NEEDS_INVESTIGATION":
      return "review"
    case "NOT_APPLICABLE":
      return "not_app"
    case "ACCEPTED_RISK":
      return "accepted"
    default:
      return "applicable"
  }
}

function initials(name: string | null) {
  return (name ?? "")
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function TriageCard({ f, onOpen }: { f: FindingRow; onOpen: (f: FindingRow) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: f.id })
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
        opacity: isDragging ? 0.5 : 1,
      }}
      {...listeners}
      {...attributes}
      onClick={() => onOpen(f)}
      className="cursor-grab touch-none rounded-lg border bg-card p-3 shadow-xs active:cursor-grabbing"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs font-medium">{f.cveId}</span>
        {f.kev && <KevBadge />}
      </div>
      <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{f.title}</div>
      <div className="mt-2 flex items-center gap-1.5 text-xs">
        <Package className="size-3 text-muted-foreground" />
        {f.assetName} <span className="font-mono text-muted-foreground">{f.assetVersion}</span>
      </div>
      <div className="mt-2">
        <ConfidenceBar v={f.confidence} />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <SeverityBadge sev={f.severity} />
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="grid size-5 place-items-center rounded-full bg-muted text-[0.5rem] font-semibold" title={f.ownerName ?? ""}>
            {initials(f.ownerName)}
          </span>
          {f.ageDays} kun
        </span>
      </div>
    </div>
  )
}

function Column({ col, items, onOpen }: { col: Col; items: FindingRow[]; onOpen: (f: FindingRow) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id })
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-xl border bg-muted/20 transition-colors",
        isOver && "ring-2 ring-ring"
      )}
    >
      <div className="flex items-center gap-2 px-3 pt-3">
        <span className="size-2 rounded-full" style={{ background: col.color }} />
        <span className="text-sm font-semibold">{col.label}</span>
        <span className="ml-auto rounded-full bg-muted px-1.5 text-xs text-muted-foreground">{items.length}</span>
      </div>
      <div className="px-3 pb-1 text-xs text-muted-foreground">{col.hint}</div>
      <div className="flex min-h-24 flex-1 flex-col gap-2 p-3">
        {items.map((f) => (
          <TriageCard key={f.id} f={f} onOpen={onOpen} />
        ))}
        {items.length === 0 && (
          <div className="rounded-lg border border-dashed py-6 text-center text-xs text-muted-foreground">Bo&apos;sh</div>
        )}
      </div>
    </div>
  )
}

export function TriageBoard({ findings }: { findings: FindingRow[] }) {
  const router = useRouter()
  const [q, setQ] = React.useState("")
  const [moves, setMoves] = React.useState<Record<string, string>>({})
  const [drawer, setDrawer] = React.useState<FindingRow | null>(null)
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const filtered = q
    ? findings.filter((f) =>
        (f.cveId + f.title + f.assetName + (f.ownerName ?? "")).toLowerCase().includes(q.toLowerCase())
      )
    : findings

  const colFor = (f: FindingRow) => moves[f.id] ?? colOf(f.status)

  async function onDragEnd(e: DragEndEvent) {
    const overId = e.over?.id as string | undefined
    const id = e.active.id as string
    if (!overId) return
    const col = COLS.find((c) => c.id === overId)
    if (!col) return
    const f = findings.find((x) => x.id === id)
    if (!f || colFor(f) === col.id) return
    setMoves((m) => ({ ...m, [id]: col.id }))
    const res = await updateFindingStatus([id], col.status)
    if (res.ok) {
      toast.success("Triage yangilandi", { description: `${f.cveId} → ${col.label}` })
      router.refresh()
    } else {
      toast.error(res.error ?? "Xatolik")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-[15px] -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Topilma qidirish..." className="h-9 w-64 pl-8" />
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <ListChecks className="size-3.5" /> Kartani ustunlar orasida torting
        </span>
      </div>

      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {COLS.map((col) => (
            <Column
              key={col.id}
              col={col}
              items={filtered.filter((f) => colFor(f) === col.id)}
              onOpen={(f) => {
                setDrawer(f)
                setDrawerOpen(true)
              }}
            />
          ))}
        </div>
      </DndContext>

      <FindingDetailDrawer
        finding={drawer}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onTriage={async (ids, status) => {
          const res = await updateFindingStatus(ids, status)
          if (res.ok) router.refresh()
        }}
      />
    </div>
  )
}

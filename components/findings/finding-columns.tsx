"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { FindingStatus } from "@prisma/client"
import { MoreHorizontal, Eye, ListChecks } from "lucide-react"
import type { FindingRow } from "@/lib/actions/finding.queries"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { SeverityBadge, KevBadge } from "@/components/severity-badge"
import { severityVar } from "@/lib/severity"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FINDING_STATUS_LABEL_UZ } from "@/lib/findings"
import { StatusBadge } from "./status-badge"
import { SourceTags } from "./source-tags"
import { ConfidenceBar } from "./confidence-bar"

const SEV_RANK: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1, NONE: 0 }
const TRIAGE_OPTIONS: FindingStatus[] = [
  "APPLICABLE",
  "IN_PROGRESS",
  "PATCHED",
  "NOT_APPLICABLE",
  "ACCEPTED_RISK",
  "NEEDS_INVESTIGATION",
]

export function getFindingColumns({
  onView,
  onTriage,
}: {
  onView: (f: FindingRow) => void
  onTriage: (ids: string[], status: FindingStatus) => void
}): ColumnDef<FindingRow>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Hammasini tanlash"
        />
      ),
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
            aria-label="Qatorni tanlash"
          />
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "cveId",
      header: ({ column }) => <DataTableColumnHeader column={column} title="CVE / Topilma" />,
      cell: ({ row }) => {
        const f = row.original
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 font-mono text-sm font-medium">
              {f.cveId}
              {f.kev && <KevBadge />}
            </div>
            <div className="max-w-[22rem] truncate text-xs text-muted-foreground">{f.title}</div>
            <SourceTags sources={f.sources} />
          </div>
        )
      },
    },
    {
      id: "asset",
      accessorFn: (f) => `${f.assetName} ${f.toolType ?? ""} ${f.objectName ?? ""}`,
      header: "Vosita",
      cell: ({ row }) => {
        const f = row.original
        return (
          <div className="flex flex-col">
            <span className="text-sm">
              {f.assetName}{" "}
              {f.assetVersion && (
                <span className="font-mono text-xs text-muted-foreground">{f.assetVersion}</span>
              )}
            </span>
            <span className="text-xs text-muted-foreground">
              {[f.toolType, f.objectName].filter(Boolean).join(" · ") || "—"}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "severity",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Daraja" />,
      sortingFn: (a, b) => (SEV_RANK[a.original.severity] ?? 0) - (SEV_RANK[b.original.severity] ?? 0),
      cell: ({ row }) => <SeverityBadge sev={row.original.severity} />,
    },
    {
      accessorKey: "cvss",
      header: ({ column }) => <DataTableColumnHeader column={column} title="CVSS" />,
      cell: ({ row }) => (
        <span className="font-mono font-medium" style={{ color: severityVar(row.original.severity) }}>
          {row.original.cvss != null ? row.original.cvss.toFixed(1) : "—"}
        </span>
      ),
    },
    {
      accessorKey: "confidence",
      header: ({ column }) => <DataTableColumnHeader column={column} title="CVE mosligi" />,
      cell: ({ row }) => <ConfidenceBar v={row.original.confidence} />,
    },
    {
      accessorKey: "status",
      header: "Holat",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "ageDays",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Ochiq" />,
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">{row.original.ageDays} kun</span>
      ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => {
        const f = row.original
        return (
          <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => onView(f)}>
                  <Eye className="size-4" /> Batafsil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ListChecks className="size-3.5" /> Holatga o&apos;tkazish
                </DropdownMenuLabel>
                {TRIAGE_OPTIONS.map((s) => (
                  <DropdownMenuItem key={s} onSelect={() => onTriage([f.id], s)}>
                    {FINDING_STATUS_LABEL_UZ[s]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}

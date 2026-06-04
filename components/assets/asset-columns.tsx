"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Package, MoreHorizontal, Eye, Pencil, Trash2, ShieldCheck } from "lucide-react"
import type { AssetRow } from "@/lib/actions/asset.queries"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { SevBar } from "@/components/dashboard/sev-bar"
import { KevBadge } from "@/components/severity-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  ASSET_CATEGORY_SHORT_UZ,
  ASSET_CATEGORY_VAR,
} from "@/lib/validations/asset.schema"

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase()
}

export function getAssetColumns({
  onView,
  onEdit,
  onDelete,
}: {
  onView: (a: AssetRow) => void
  onEdit: (a: AssetRow) => void
  onDelete: (a: AssetRow) => void
}): ColumnDef<AssetRow>[] {
  return [
    {
      id: "owner",
      accessorFn: (a) => a.ownerName ?? "",
      header: "Mas'ul xodim",
      cell: ({ row }) => {
        const a = row.original
        if (!a.ownerName) return <span className="text-xs text-muted-foreground">—</span>
        return (
          <div className="flex items-center gap-2">
            <Avatar className="size-7">
              <AvatarFallback className="text-[0.6rem]">{initials(a.ownerName)}</AvatarFallback>
            </Avatar>
            <span className="max-w-[12rem] whitespace-normal break-words text-sm font-medium">
              {a.ownerName}
            </span>
          </div>
        )
      },
    },
    {
      id: "object",
      accessorFn: (a) => a.objectName ?? "",
      header: "MAI",
      cell: ({ row }) => {
        const a = row.original
        if (!a.objectName) return <span className="text-xs text-muted-foreground">—</span>
        return (
          <div className="flex flex-col gap-0.5">
            <span className="max-w-[14rem] whitespace-normal break-words text-sm font-medium">{a.objectName}</span>
            {a.objectNumber && (
              <span className="font-mono text-xs text-muted-foreground">{a.objectNumber}</span>
            )}
            {a.orgName && (
              <span className="max-w-[14rem] truncate text-xs text-muted-foreground">{a.orgName}</span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Vosita" />,
      cell: ({ row }) => {
        const a = row.original
        return (
          <div className="flex items-center gap-2.5">
            <span className="grid size-7 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
              <Package className="size-[15px]" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <span className="truncate">{a.name}</span>
                {a.version && (
                  <span className="font-mono text-xs text-muted-foreground">{a.version}</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">{a.vendor ?? "—"}</div>
            </div>
          </div>
        )
      },
    },
    {
      id: "toolType",
      accessorFn: (a) => a.toolType ?? "",
      header: "Turi",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{row.original.toolType ?? "—"}</span>
      ),
    },
    {
      accessorKey: "category",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Kategoriya" />,
      cell: ({ row }) => {
        const c = row.original.category
        const v = ASSET_CATEGORY_VAR[c]
        return (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
            style={{ color: v, backgroundColor: `color-mix(in oklab, ${v} 14%, transparent)` }}
          >
            <span className="size-1.5 rounded-full" style={{ background: v }} />
            {ASSET_CATEGORY_SHORT_UZ[c]}
          </span>
        )
      },
    },
    {
      accessorKey: "fc",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Topilmalar" />,
      cell: ({ row }) => {
        const a = row.original
        if (a.fc === 0) {
          return (
            <span className="inline-flex items-center gap-1 text-xs" style={{ color: "var(--success)" }}>
              <ShieldCheck className="size-3.5" /> Topilma mavjud emas
            </span>
          )
        }
        return (
          <div className="flex items-center gap-2">
            <span className="w-5 font-mono text-sm">{a.fc}</span>
            <SevBar b={a.breakdown} />
            {a.kev && <KevBadge />}
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => {
        const a = row.original
        return (
          <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => onView(a)}>
                  <Eye className="size-4" /> Batafsil
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onEdit(a)}>
                  <Pencil className="size-4" /> Tahrirlash
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={() => onDelete(a)}>
                  <Trash2 className="size-4" /> O&apos;chirish
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}

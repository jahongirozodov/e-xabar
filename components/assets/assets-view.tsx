"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Download, X, ChevronDown } from "lucide-react"
import type { AssetRow, EmployeeOption, ObjectOption } from "@/lib/actions/asset.queries"
import { deleteAsset } from "@/lib/actions/asset.actions"
import { DataTable } from "@/components/data-table/data-table"
import { getAssetColumns } from "./asset-columns"
import { AssetDetailDrawer } from "./asset-detail-drawer"
import { AssetFormDialog } from "./asset-form-dialog"
import { ImportDialog } from "./import-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import {
  ASSET_CATEGORY,
  ASSET_CATEGORY_SHORT_UZ,
  ASSET_CATEGORY_VAR,
} from "@/lib/validations/asset.schema"

function toggle<T>(set: Set<T>, v: T): Set<T> {
  const n = new Set(set)
  if (n.has(v)) n.delete(v)
  else n.add(v)
  return n
}

export function AssetsView({
  assets,
  employees,
  objects,
}: {
  assets: AssetRow[]
  employees: EmployeeOption[]
  objects: ObjectOption[]
}) {
  const router = useRouter()
  const [catF, setCatF] = React.useState<Set<string>>(new Set())
  const [typeF, setTypeF] = React.useState<Set<string>>(new Set())
  const [orgF, setOrgF] = React.useState<Set<string>>(new Set())

  const [drawerAsset, setDrawerAsset] = React.useState<AssetRow | null>(null)
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [formOpen, setFormOpen] = React.useState(false)
  const [formMode, setFormMode] = React.useState<"create" | "edit">("create")
  const [formAsset, setFormAsset] = React.useState<AssetRow | null>(null)
  const [importOpen, setImportOpen] = React.useState(false)

  const toolTypes = React.useMemo(
    () => Array.from(new Set(assets.map((a) => a.toolType).filter((t): t is string => !!t))).sort(),
    [assets]
  )
  const orgs = React.useMemo(
    () => Array.from(new Set(assets.map((a) => a.orgName).filter((o): o is string => !!o))).sort(),
    [assets]
  )

  const filtered = React.useMemo(
    () =>
      assets
        .filter((a) => {
          if (catF.size && !catF.has(a.category)) return false
          if (typeF.size && !(a.toolType && typeF.has(a.toolType))) return false
          if (orgF.size && !(a.orgName && orgF.has(a.orgName))) return false
          return true
        })
        // Ierarxik klaster: Mas'ul xodim → MAI/Tizim → Vosita bo'yicha saralaymiz
        // (nested rowspan birlashtirilgan kataklar to'g'ri chiqishi uchun).
        .sort((a, b) => {
          const ao = a.ownerName ?? "￿"
          const bo = b.ownerName ?? "￿"
          if (ao !== bo) return ao.localeCompare(bo, "uz")
          const an = a.objectName ?? "￿"
          const bn = b.objectName ?? "￿"
          if (an !== bn) return an.localeCompare(bn, "uz")
          return (a.name ?? "").localeCompare(b.name ?? "", "uz")
        }),
    [assets, catF, typeF, orgF]
  )

  // Nested rowspan guruh kalitlari: tashqi = Mas'ul, ichki = MAI/Tizim
  const ownerKey = (a: AssetRow) => a.ownerName ?? "—"
  const maiKey = (a: AssetRow) => a.objectName ?? "—"

  const columns = React.useMemo(
    () =>
      getAssetColumns({
        onView: (a) => {
          setDrawerAsset(a)
          setDrawerOpen(true)
        },
        onEdit: (a) => {
          setFormAsset(a)
          setFormMode("edit")
          setFormOpen(true)
        },
        onDelete: async (a) => {
          if (!window.confirm(`${a.name} o'chirilsinmi?`)) return
          const res = await deleteAsset(a.id)
          if (res.ok) {
            toast.success("Vosita o'chirildi")
            router.refresh()
          } else {
            toast.error(res.error)
          }
        },
      }),
    [router]
  )

  const activeFilters = catF.size + typeF.size + orgF.size
  const cyber = filtered.filter((a) => a.category === "CYBERSEC").length
  const info = filtered.filter((a) => a.category === "INFO").length
  const vuln = filtered.filter((a) => a.fc > 0).length

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
          <Download className="size-4" /> JSON import
        </Button>
        <Button
          size="sm"
          onClick={() => {
            setFormAsset(null)
            setFormMode("create")
            setFormOpen(true)
          }}
        >
          <Plus className="size-4" /> Vosita qo&apos;shish
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Kategoriya</span>
        {ASSET_CATEGORY.map((c) => {
          const active = catF.has(c)
          const v = ASSET_CATEGORY_VAR[c]
          return (
            <button
              key={c}
              onClick={() => setCatF((s) => toggle(s, c))}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors hover:bg-accent",
                active && "font-medium"
              )}
              style={active ? { borderColor: v, color: v, background: `color-mix(in oklab, ${v} 14%, transparent)` } : undefined}
            >
              <span className="size-1.5 rounded-full" style={{ background: v }} />
              {ASSET_CATEGORY_SHORT_UZ[c]}
            </button>
          )
        })}

        <span className="mx-1 h-4 w-px bg-border" />

        {/* Tur (toolType) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
              Turi {typeF.size > 0 && <span className="text-primary">({typeF.size})</span>}
              <ChevronDown className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-72 overflow-y-auto">
            <DropdownMenuLabel>Vosita turi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {toolTypes.length === 0 && (
              <div className="px-2 py-1.5 text-xs text-muted-foreground">— yo&apos;q —</div>
            )}
            {toolTypes.map((t) => (
              <DropdownMenuCheckboxItem
                key={t}
                checked={typeF.has(t)}
                onCheckedChange={() => setTypeF((s) => toggle(s, t))}
                onSelect={(e) => e.preventDefault()}
              >
                {t}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Tashkilot */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
              Tashkilot {orgF.size > 0 && <span className="text-primary">({orgF.size})</span>}
              <ChevronDown className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-72 overflow-y-auto">
            <DropdownMenuLabel>Tashkilot</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {orgs.length === 0 && (
              <div className="px-2 py-1.5 text-xs text-muted-foreground">— yo&apos;q —</div>
            )}
            {orgs.map((o) => (
              <DropdownMenuCheckboxItem
                key={o}
                checked={orgF.has(o)}
                onCheckedChange={() => setOrgF((s) => toggle(s, o))}
                onSelect={(e) => e.preventDefault()}
              >
                {o}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {activeFilters > 0 && (
          <button
            onClick={() => {
              setCatF(new Set())
              setTypeF(new Set())
              setOrgF(new Set())
            }}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="size-3" /> Tozalash
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Vosita, MAI, tashkilot yoki mas'ul..."
        onRowClick={(a) => {
          setDrawerAsset(a)
          setDrawerOpen(true)
        }}
        pageSize={50}
        rowSpanGroups={[
          { columnId: "owner", getKey: ownerKey },
          { columnId: "object", getKey: maiKey },
        ]}
      />

      <div className="text-xs text-muted-foreground">
        {filtered.length} ta vosita · {cyber} ta kiberxavfsizlik · {info} ta axborotlashtirish · {vuln} ta zaif
      </div>

      <AssetDetailDrawer
        asset={drawerAsset}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onEdit={(a) => {
          setDrawerOpen(false)
          setFormAsset(a)
          setFormMode("edit")
          setFormOpen(true)
        }}
      />
      <AssetFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        asset={formAsset}
        employees={employees}
        objects={objects}
      />
      <ImportDialog open={importOpen} onOpenChange={setImportOpen} />
    </div>
  )
}

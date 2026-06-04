"use client"

import { Package, Pencil, Building2, Boxes } from "lucide-react"
import type { AssetRow } from "@/lib/actions/asset.queries"
import { DetailDrawer } from "@/components/detail-drawer"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { SeverityBadge, KevBadge } from "@/components/severity-badge"
import {
  ASSET_CATEGORY_LABEL_UZ,
  ASSET_CATEGORY_VAR,
} from "@/lib/validations/asset.schema"
import { FINDING_STATUS_LABEL_UZ, findingStatusTone, statusToneVar } from "@/lib/findings"

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase()
}

function Metric({ k, v, color }: { k: string; v: string | number; color?: string }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="text-xs text-muted-foreground">{k}</div>
      <div className="mt-0.5 text-xl font-bold tabular-nums" style={color ? { color } : undefined}>
        {v}
      </div>
    </div>
  )
}

function KvRow({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1 text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className={mono ? "font-mono text-xs" : "font-medium"}>{v}</span>
    </div>
  )
}

export function AssetDetailDrawer({
  asset,
  open,
  onOpenChange,
  onEdit,
}: {
  asset: AssetRow | null
  open: boolean
  onOpenChange: (o: boolean) => void
  onEdit: (a: AssetRow) => void
}) {
  if (!asset) return null
  const critHigh = asset.breakdown.c + asset.breakdown.h
  const catVar = ASSET_CATEGORY_VAR[asset.category]

  return (
    <DetailDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={
        <span className="flex items-center gap-2">
          <span className="grid size-6 place-items-center rounded-md bg-muted text-muted-foreground">
            <Package className="size-3.5" />
          </span>
          {asset.name}
          {asset.version && (
            <span className="font-mono text-xs font-normal text-muted-foreground">{asset.version}</span>
          )}
        </span>
      }
      description={`${asset.toolType ?? "—"} · ${asset.vendor ?? "—"}`}
      footer={
        <div className="flex w-full justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(asset)}>
            <Pencil className="size-4" /> Tahrirlash
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Sub badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-medium"
            style={{ color: catVar, backgroundColor: `color-mix(in oklab, ${catVar} 14%, transparent)` }}
          >
            <span className="size-1.5 rounded-full" style={{ background: catVar }} />
            {ASSET_CATEGORY_LABEL_UZ[asset.category]}
          </span>
          {asset.toolType && (
            <span className="rounded-full bg-muted px-2 py-0.5 font-medium">{asset.toolType}</span>
          )}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-4 gap-2">
          <Metric k="Topilma" v={asset.fc} />
          <Metric k="Crit+High" v={critHigh} color={critHigh ? "var(--sev-c)" : undefined} />
          <Metric k="KEV" v={asset.findings.filter((f) => f.isKev).length} color={asset.kev ? "var(--kev)" : undefined} />
          <Metric k="Max CVSS" v={asset.maxCvss != null ? asset.maxCvss.toFixed(1) : "—"} />
        </div>

        {/* Obyekt */}
        {asset.objectName && (
          <section>
            <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
              <Boxes className="size-4 text-muted-foreground" /> Obyekt
            </div>
            <div className="rounded-lg border px-3 py-1">
              <KvRow k="Nomi" v={asset.objectName} />
              {asset.objectNumber && <KvRow k="Raqami" v={asset.objectNumber} mono />}
              {asset.city && <KvRow k="Shahar" v={asset.city} />}
            </div>
          </section>
        )}

        {/* Tashkilot */}
        {asset.orgName && (
          <section>
            <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
              <Building2 className="size-4 text-muted-foreground" /> Tashkilot
            </div>
            <div className="rounded-lg border px-3 py-1">
              <KvRow k="Nomi" v={asset.orgName} />
              {asset.orgType && <KvRow k="Turi" v={asset.orgType} />}
            </div>
          </section>
        )}

        {/* Identifikatorlar */}
        <section>
          <div className="mb-2 text-sm font-semibold">Identifikatorlar</div>
          <div className="rounded-lg border px-3 py-1">
            <KvRow k="Ishlab chiqaruvchi" v={asset.vendor ?? "—"} />
            <KvRow k="Versiya" v={asset.version ?? "—"} mono />
          </div>
          <div className="mt-2 rounded-lg border bg-muted/30 p-3">
            <div className="text-xs text-muted-foreground">PURL</div>
            <div className="break-all font-mono text-xs">{asset.purl ?? "—"}</div>
          </div>
          <div className="mt-2 rounded-lg border bg-muted/30 p-3">
            <div className="text-xs text-muted-foreground">CPE</div>
            <div className="break-all font-mono text-xs">{asset.cpeUri ?? "—"}</div>
          </div>
        </section>

        {/* Mas'ul xodim */}
        {asset.ownerName && (
          <section>
            <div className="mb-2 text-sm font-semibold">Mas&apos;ul xodim</div>
            <div className="flex items-center gap-3">
              <Avatar className="size-9">
                <AvatarFallback className="text-xs">{initials(asset.ownerName)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="text-sm font-medium">{asset.ownerName}</div>
                {asset.ownerPosition && (
                  <div className="truncate text-xs text-muted-foreground">{asset.ownerPosition}</div>
                )}
                <div className="truncate text-xs text-muted-foreground">
                  {[asset.ownerEmail, asset.ownerPhone].filter(Boolean).join(" · ") || "—"}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Findings */}
        <section>
          <div className="mb-2 text-sm font-semibold">
            Topilmalar <span className="text-muted-foreground">({asset.findings.length})</span>
          </div>
          {asset.findings.length === 0 ? (
            <div className="text-sm text-muted-foreground">Topilma yo&apos;q.</div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {asset.findings.map((f) => {
                const tone = findingStatusTone(f.status)
                return (
                  <div key={f.id} className="flex items-center gap-2.5 rounded-lg border px-3 py-2">
                    <SeverityBadge sev={f.severity} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-medium">
                        {f.cveId}
                        {f.isKev && <KevBadge />}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">{f.title ?? "—"}</div>
                    </div>
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{ color: statusToneVar(tone), backgroundColor: `color-mix(in oklab, ${statusToneVar(tone)} 14%, transparent)` }}
                    >
                      {FINDING_STATUS_LABEL_UZ[f.status]}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </DetailDrawer>
  )
}

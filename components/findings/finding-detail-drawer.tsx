"use client"

import type { FindingStatus } from "@prisma/client"
import { Bug, ListChecks } from "lucide-react"
import type { FindingRow } from "@/lib/actions/finding.queries"
import { DetailDrawer } from "@/components/detail-drawer"
import { SeverityBadge, KevBadge } from "@/components/severity-badge"
import { severityVar } from "@/lib/severity"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ASSET_CATEGORY_LABEL_UZ } from "@/lib/validations/asset.schema"
import { StatusBadge } from "./status-badge"
import { SourceTags } from "./source-tags"
import { ConfidenceBar } from "./confidence-bar"
import { TriageMenu } from "./triage-menu"

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

export function FindingDetailDrawer({
  finding,
  open,
  onOpenChange,
  onTriage,
}: {
  finding: FindingRow | null
  open: boolean
  onOpenChange: (o: boolean) => void
  onTriage: (ids: string[], status: FindingStatus) => void
}) {
  if (!finding) return null
  const f = finding

  return (
    <DetailDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={
        <span className="flex items-center gap-2 font-mono">
          {f.cveId}
          {f.kev && <KevBadge />}
        </span>
      }
      description={f.title ?? undefined}
      footer={
        <div className="flex w-full justify-end">
          <TriageMenu
            trigger={
              <Button size="sm">
                <ListChecks className="size-4" /> Triage holat
              </Button>
            }
            onPick={(s) => {
              onTriage([f.id], s)
              onOpenChange(false)
            }}
          />
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2">
          <SeverityBadge sev={f.severity} />
          <StatusBadge status={f.status} />
          <SourceTags sources={f.sources} />
        </div>

        <div className="grid grid-cols-4 gap-2">
          <Metric k="CVSS" v={f.cvss != null ? f.cvss.toFixed(1) : "—"} color={severityVar(f.severity)} />
          <Metric k="EPSS" v={f.epss != null ? `${Math.round(f.epss * 100)}%` : "—"} />
          <Metric k="Ochiq" v={`${f.ageDays} kun`} />
          <Metric k="CVE mosligi" v={`${Math.round(f.confidence * 100)}%`} />
        </div>

        <section>
          <div className="mb-2 text-sm font-semibold">Tavsif</div>
          <p className="text-sm leading-relaxed text-muted-foreground">{f.description ?? "—"}</p>
          {f.vector && (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 font-mono text-xs">
              <Bug className="size-3.5" /> {f.vector}
            </div>
          )}
          {f.published && (
            <div className="mt-2 text-xs text-muted-foreground">Nashr qilingan: {f.published}</div>
          )}
        </section>

        <section>
          <div className="mb-2 text-sm font-semibold">Ta&apos;sirlangan vosita</div>
          <div className="rounded-lg border px-3 py-1">
            <KvRow k="Vosita" v={`${f.assetName}${f.assetVersion ? ` ${f.assetVersion}` : ""}`} />
            <KvRow k="Tur" v={f.toolType ?? "—"} />
            <KvRow k="Kategoriya" v={ASSET_CATEGORY_LABEL_UZ[f.category]} />
            <KvRow k="Obyekt" v={f.objectName ?? "—"} />
            <KvRow k="Tashkilot" v={f.orgName ?? "—"} />
          </div>
        </section>

        {f.ownerName && (
          <section>
            <div className="mb-2 text-sm font-semibold">Mas&apos;ul xodim</div>
            <div className="flex items-center gap-3">
              <Avatar className="size-9">
                <AvatarFallback className="text-xs">{initials(f.ownerName)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="text-sm font-medium">{f.ownerName}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {f.ownerEmail} · {f.ownerDept}
                </div>
              </div>
            </div>
          </section>
        )}

        <section>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
            CVE mosligi
            <span className="text-muted-foreground">{Math.round(f.confidence * 100)}%</span>
          </div>
          <ConfidenceBar v={f.confidence} large />
          {f.factors.length > 0 && (
            <div className="mt-3 flex flex-col gap-1.5">
              {f.factors.map((fac, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span
                    className="w-9 text-right font-mono font-semibold"
                    style={{ color: fac.weight < 0 ? "var(--sev-c)" : "var(--success)" }}
                  >
                    {fac.weight > 0 ? "+" : ""}
                    {Math.round(fac.weight * 100)}
                  </span>
                  <span className="text-muted-foreground">{fac.name}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </DetailDrawer>
  )
}

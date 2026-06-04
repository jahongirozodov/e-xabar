import { formatDistanceToNow } from "date-fns"
import { uz } from "date-fns/locale"
import { Bug, ShieldAlert, ScanLine, RefreshCw, type LucideIcon } from "lucide-react"
import type { ActivityItem } from "@/lib/actions/dashboard.actions"

const ICONS: Record<string, LucideIcon> = {
  bug: Bug,
  "shield-alert": ShieldAlert,
  "scan-line": ScanLine,
  "refresh-cw": RefreshCw,
}

function toneStyle(tone: ActivityItem["tone"]) {
  const v = tone === "crit" ? "--sev-c" : tone === "good" ? "--success" : "--muted-foreground"
  return {
    color: `var(${v})`,
    backgroundColor: `color-mix(in oklab, var(${v}) 14%, transparent)`,
  }
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (!items.length) {
    return <div className="px-5 py-8 text-center text-sm text-muted-foreground">Hozircha faollik yo&apos;q.</div>
  }
  return (
    <div className="flex flex-col">
      {items.map((it, i) => {
        const Icon = ICONS[it.icon] ?? Bug
        return (
          <div key={i} className="flex items-start gap-3 border-b border-border px-5 py-3 last:border-0">
            <span className="grid size-8 shrink-0 place-items-center rounded-md" style={toneStyle(it.tone)}>
              <Icon className="size-[15px]" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{it.title}</div>
              <div className="truncate text-xs text-muted-foreground">{it.meta}</div>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(it.time), { addSuffix: true, locale: uz })}
            </span>
          </div>
        )
      })}
    </div>
  )
}

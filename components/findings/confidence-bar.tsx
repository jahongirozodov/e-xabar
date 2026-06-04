import { cn } from "@/lib/utils"

export function confidenceColor(v: number): string {
  return v >= 0.85 ? "var(--success)" : v >= 0.6 ? "var(--sev-h)" : "var(--sev-c)"
}

export function ConfidenceBar({ v, large }: { v: number; large?: boolean }) {
  const pct = Math.round(v * 100)
  const color = confidenceColor(v)
  return (
    <div className="flex items-center gap-2">
      <div className={cn("overflow-hidden rounded-full bg-muted", large ? "h-2 flex-1" : "h-1.5 w-16")}>
        <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      {!large && <span className="font-mono text-xs text-muted-foreground">{pct}%</span>}
    </div>
  )
}

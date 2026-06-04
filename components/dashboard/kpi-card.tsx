import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

type Tone = "neutral" | "bad" | "good"

function toneColor(tone: Tone): string {
  if (tone === "bad") return "var(--sev-c)"
  if (tone === "good") return "var(--success)"
  return "var(--muted-foreground)"
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  delta,
  dir,
  tone,
  sub,
}: {
  label: string
  value: string | number
  icon: LucideIcon
  delta: string
  dir: "up" | "down"
  tone: Tone
  sub: string
}) {
  const color = toneColor(tone)
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className="grid size-8 place-items-center rounded-md bg-muted text-muted-foreground">
            <Icon className="size-4" />
          </span>
        </div>
        <div className="mt-2 text-3xl font-bold tracking-tight tabular-nums">{value}</div>
        <div className="mt-2 flex items-center gap-2 text-xs">
          <span
            className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-medium"
            style={{ color, backgroundColor: `color-mix(in oklab, ${color} 14%, transparent)` }}
          >
            {dir === "up" ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {delta}
          </span>
          <span className="text-muted-foreground">{sub}</span>
        </div>
      </CardContent>
    </Card>
  )
}

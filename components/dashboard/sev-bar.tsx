import type { SevBreakdown } from "@/lib/actions/dashboard.actions"

const SEGS = [
  ["c", "--sev-c"],
  ["h", "--sev-h"],
  ["m", "--sev-m"],
  ["l", "--sev-l"],
] as const

export function SevBar({ b }: { b: SevBreakdown }) {
  const total = b.c + b.h + b.m + b.l || 1
  return (
    <div
      className="flex h-1.5 w-full overflow-hidden rounded-full bg-muted"
      title={`C:${b.c} H:${b.h} M:${b.m} L:${b.l}`}
    >
      {SEGS.filter(([k]) => b[k] > 0).map(([k, varName]) => (
        <span key={k} style={{ width: `${(b[k] / total) * 100}%`, background: `var(${varName})` }} />
      ))}
    </div>
  )
}

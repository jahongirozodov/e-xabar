"use client"

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"

export interface DonutDatum {
  label: string
  value: number
  color: string
}

export function DonutChart({
  data,
  centerLabel = "Jami",
  size = 200,
  thickness = 26,
}: {
  data: DonutDatum[]
  centerLabel?: string
  size?: number
  thickness?: number
}) {
  const total = data.reduce((a, d) => a + d.value, 0)
  const outer = size / 2
  const inner = outer - thickness

  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <ResponsiveContainer width={size} height={size}>
          <PieChart>
            <Pie
              data={data.length ? data : [{ label: "—", value: 1, color: "var(--muted)" }]}
              dataKey="value"
              innerRadius={inner}
              outerRadius={outer}
              paddingAngle={2}
              startAngle={90}
              endAngle={-270}
              stroke="none"
            >
              {(data.length ? data : [{ color: "var(--muted)" }]).map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold">{total}</div>
          <div className="text-xs text-muted-foreground">{centerLabel}</div>
        </div>
      </div>

      <div className="flex min-w-40 flex-1 flex-col gap-2">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2 text-sm">
            <span className="size-2.5 rounded-full" style={{ background: d.color }} />
            <span className="flex-1">{d.label}</span>
            <span className="text-muted-foreground">{total ? Math.round((d.value / total) * 100) : 0}%</span>
            <span className="w-8 text-right font-mono font-medium">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

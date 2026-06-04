"use client"

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

export interface LineSeries {
  key: string
  label: string
  color: string // CSS var yoki rang
  area?: boolean
}

function ChartTooltip({ active, payload, label, series }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
      <div className="mb-1 font-medium">{label}</div>
      {payload.map((p: any) => {
        const s = series.find((x: LineSeries) => x.key === p.dataKey)
        return (
          <div key={p.dataKey} className="flex items-center gap-2">
            <span className="size-2 rounded-full" style={{ background: s?.color }} />
            <span className="text-muted-foreground">{s?.label ?? p.dataKey}</span>
            <span className="ml-auto font-mono font-medium">{p.value}</span>
          </div>
        )
      })}
    </div>
  )
}

export function LineChart({
  data,
  xKey,
  series,
  height = 272,
}: {
  data: readonly object[]
  xKey: string
  series: LineSeries[]
  height?: number
}) {
  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data as object[]} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <defs>
            {series
              .filter((s) => s.area)
              .map((s) => (
                <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0} />
                </linearGradient>
              ))}
          </defs>
          <CartesianGrid strokeDasharray="3 4" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey={xKey}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={48}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={40}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          />
          <Tooltip content={<ChartTooltip series={series} />} cursor={{ stroke: "var(--muted-foreground)", strokeDasharray: "3 3" }} />
          {series.map((s) =>
            s.area ? (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stroke={s.color}
                strokeWidth={2}
                fill={`url(#grad-${s.key})`}
                dot={false}
                activeDot={{ r: 3.5, strokeWidth: 2, fill: "var(--card)" }}
              />
            ) : (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stroke={s.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3.5, strokeWidth: 2, fill: "var(--card)" }}
              />
            )
          )}
        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-2 flex items-center justify-center gap-5">
        {series.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-2.5 rounded-full" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  )
}

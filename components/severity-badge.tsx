import { cn } from "@/lib/utils"
import { Severity, SEVERITY_LABEL_UZ, severityVar } from "@/lib/severity"

export function SeverityBadge({
  sev,
  className,
}: {
  sev: Severity
  className?: string
}) {
  const color = severityVar(sev)
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap",
        className
      )}
      style={{
        color,
        backgroundColor: `color-mix(in oklab, ${color} 14%, transparent)`,
      }}
    >
      {SEVERITY_LABEL_UZ[sev]}
    </span>
  )
}

export function KevBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full px-1.5 py-px text-[0.625rem] font-bold tracking-wide",
        className
      )}
      style={{
        color: "var(--kev)",
        backgroundColor: "color-mix(in oklab, var(--kev) 16%, transparent)",
      }}
    >
      KEV
    </span>
  )
}

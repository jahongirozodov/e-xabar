import type { FindingStatus } from "@prisma/client"
import { cn } from "@/lib/utils"
import { FINDING_STATUS_LABEL_UZ, findingStatusTone, statusToneVar } from "@/lib/findings"

export function StatusBadge({ status, className }: { status: FindingStatus; className?: string }) {
  const c = statusToneVar(findingStatusTone(status))
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        className
      )}
      style={{ color: c, backgroundColor: `color-mix(in oklab, ${c} 14%, transparent)` }}
    >
      {FINDING_STATUS_LABEL_UZ[status]}
    </span>
  )
}

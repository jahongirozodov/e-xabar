import type { RoleName } from "@prisma/client"
import { cn } from "@/lib/utils"
import { ROLE_LABEL_UZ } from "@/lib/nav"

const ROLE_VAR: Record<RoleName, string> = {
  ADMIN: "var(--kev)",
  SPECIALIST: "var(--sev-l)",
  SECTION_HEAD: "var(--sev-h)",
  DEPARTMENT_HEAD: "var(--success)",
}

export function RoleBadge({ role, className }: { role: RoleName; className?: string }) {
  const v = ROLE_VAR[role]
  return (
    <span
      className={cn("inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-medium", className)}
      style={{ color: v, backgroundColor: `color-mix(in oklab, ${v} 14%, transparent)` }}
    >
      {ROLE_LABEL_UZ[role]}
    </span>
  )
}

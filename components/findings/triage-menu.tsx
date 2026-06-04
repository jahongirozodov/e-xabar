"use client"

import * as React from "react"
import type { FindingStatus } from "@prisma/client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FINDING_STATUS_LABEL_UZ } from "@/lib/findings"

const TRIAGE_OPTIONS: FindingStatus[] = [
  "APPLICABLE",
  "IN_PROGRESS",
  "PATCHED",
  "NOT_APPLICABLE",
  "ACCEPTED_RISK",
  "NEEDS_INVESTIGATION",
]

export function TriageMenu({
  trigger,
  onPick,
  align = "end",
}: {
  trigger: React.ReactNode
  onPick: (status: FindingStatus) => void
  align?: "start" | "end"
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        <DropdownMenuLabel>Holatga o&apos;tkazish</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {TRIAGE_OPTIONS.map((s) => (
          <DropdownMenuItem key={s} onSelect={() => onPick(s)}>
            {FINDING_STATUS_LABEL_UZ[s]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

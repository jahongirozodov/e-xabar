"use client"

import type { Column } from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: {
  column: Column<TData, TValue>
  title: string
  className?: string
}) {
  if (!column.getCanSort()) {
    return <span className={className}>{title}</span>
  }
  const sorted = column.getIsSorted()
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("-ml-2 h-8 data-[state=open]:bg-accent", className)}
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      <span>{title}</span>
      {sorted === "asc" ? (
        <ChevronUp className="size-3.5" />
      ) : sorted === "desc" ? (
        <ChevronDown className="size-3.5" />
      ) : (
        <ArrowUpDown className="size-3.5 opacity-50" />
      )}
    </Button>
  )
}

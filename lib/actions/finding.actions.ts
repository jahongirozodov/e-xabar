"use server"

import { revalidatePath } from "next/cache"
import type { FindingStatus } from "@prisma/client"
import { prisma } from "@/lib/db/prisma"
import { requirePermission } from "@/lib/rbac/guard"
import { logAudit } from "@/lib/services/audit.service"

const TRIAGE_STATUSES: ReadonlyArray<FindingStatus> = [
  "APPLICABLE",
  "NOT_APPLICABLE",
  "ACCEPTED_RISK",
  "IN_PROGRESS",
  "PATCHED",
  "NEEDS_INVESTIGATION",
]

export async function updateFindingStatus(
  ids: string[],
  status: FindingStatus
): Promise<{ ok: boolean; count?: number; error?: string }> {
  const session = await requirePermission("triage:manage")
  if (!ids.length) return { ok: false, error: "Topilma tanlanmagan" }

  const isTriage = TRIAGE_STATUSES.includes(status)
  const res = await prisma.finding.updateMany({
    where: { id: { in: ids } },
    data: {
      status,
      ...(isTriage ? { triagedById: session.user.id, triagedAt: new Date() } : {}),
    },
  })

  await logAudit(
    "TRIAGE_DECISION",
    "finding",
    ids.length === 1 ? ids[0] : undefined,
    { status, count: res.count }
  )
  revalidatePath("/findings")
  return { ok: true, count: res.count }
}

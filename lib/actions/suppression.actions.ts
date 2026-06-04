"use server"

import { revalidatePath } from "next/cache"
import type { Prisma, SuppressionScope } from "@prisma/client"
import { prisma } from "@/lib/db/prisma"
import { requirePermission } from "@/lib/rbac/guard"
import { logAudit } from "@/lib/services/audit.service"
import {
  suppressionFormSchema,
  buildTarget,
  type SuppressionFormValues,
} from "@/lib/validations/suppression.schema"

type ActionResult = { ok: true } | { ok: false; error: string }

export async function createSuppression(values: SuppressionFormValues): Promise<ActionResult> {
  const session = await requirePermission("suppressions:manage")
  const parsed = suppressionFormSchema.safeParse(values)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Validatsiya xatosi" }
  const v = parsed.data

  const expiresAt = new Date(Date.now() + Number(v.days) * 86_400_000)

  let filter: Prisma.InputJsonValue | undefined
  if (v.scope === "CVE_ASSET") filter = { assetRef: v.assetRef?.trim() ?? "" }
  else if (v.scope === "ASSET_ATTR") filter = { key: v.attrKey ?? "environment", value: v.attrVal ?? "" }

  const s = await prisma.suppression.create({
    data: {
      scope: v.scope as SuppressionScope,
      cveId: ["CVE", "CVE_ASSET", "CVE_VENDOR"].includes(v.scope) ? v.cveId?.trim() : null,
      vendor: v.scope === "CVE_VENDOR" ? v.vendor?.trim() : null,
      assetAttributeFilter: filter,
      reason: v.reason,
      createdById: session.user.id,
      expiresAt,
    },
  })
  await logAudit("CREATE_SUPPRESSION", "suppression", s.id, { target: buildTarget(v), days: v.days })
  revalidatePath("/suppressions")
  return { ok: true }
}

export async function toggleSuppression(id: string, active: boolean): Promise<ActionResult> {
  await requirePermission("suppressions:manage")
  await prisma.suppression.update({ where: { id }, data: { isActive: active } })
  revalidatePath("/suppressions")
  return { ok: true }
}

export async function deleteSuppression(id: string): Promise<ActionResult> {
  await requirePermission("suppressions:manage")
  await prisma.suppression.delete({ where: { id } })
  await logAudit("DELETE_SUPPRESSION", "suppression", id)
  revalidatePath("/suppressions")
  return { ok: true }
}

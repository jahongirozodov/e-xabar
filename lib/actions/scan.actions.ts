"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db/prisma"
import { requirePermission } from "@/lib/rbac/guard"
import { logAudit } from "@/lib/services/audit.service"
import { runMatching } from "@/lib/services/matching.service"
import { generateNotifications } from "@/lib/services/notification.service"

// Qo'lda skan — matching engine + xabarnoma generatsiyasi (asset × CVE → Finding → email).
export async function runManualScan(): Promise<{
  ok: boolean
  created: number
  recurring: number
  emails: number
}> {
  const session = await requirePermission("scans:run")
  const assets = await prisma.asset.count()
  const now = new Date()
  const scan = await prisma.scanRun.create({
    data: {
      scanType: "MANUAL",
      status: "RUNNING",
      startedAt: now,
      triggeredById: session.user.id,
      assetsScanned: assets,
    },
  })

  const { created, recurring } = await runMatching(scan.id)
  const { created: emails } = await generateNotifications(scan.id)

  await prisma.scanRun.update({
    where: { id: scan.id },
    data: {
      status: "COMPLETED",
      finishedAt: new Date(),
      findingsNew: created,
      findingsRecurring: recurring,
      emailsSent: emails,
    },
  })

  await logAudit("RUN_SCAN", "scan", scan.id, { assets, created, recurring, emails })
  revalidatePath("/scans")
  revalidatePath("/findings")
  revalidatePath("/notifications")
  revalidatePath("/dashboard")
  return { ok: true, created, recurring, emails }
}

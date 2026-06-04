import "server-only"
import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db/prisma"
import { auth } from "@/lib/auth/auth"

// Audit yozuvi — best-effort (xatolik asosiy amalni buzmasligi kerak).
export async function logAudit(
  action: string,
  entityType?: string,
  entityId?: string,
  newValue?: Prisma.InputJsonValue
) {
  try {
    const session = await auth()
    await prisma.auditLog.create({
      data: {
        actorId: session?.user?.id ?? null,
        action,
        entityType: entityType ?? null,
        entityId: entityId ?? null,
        newValue: newValue ?? undefined,
      },
    })
  } catch {
    // jurnalga yozib bo'lmasa — jim
  }
}

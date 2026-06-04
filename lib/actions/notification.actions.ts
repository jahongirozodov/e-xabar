"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db/prisma"
import { requirePermission } from "@/lib/rbac/guard"
import { logAudit } from "@/lib/services/audit.service"
import { sendRawEmail } from "@/lib/services/email.service"

// Saqlangan email shablonini mas'ulga AYNAN qayta yuboradi.
export async function resendNotification(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  await requirePermission("scans:run")

  const n = await prisma.notification.findUnique({
    where: { id },
    include: { employee: { select: { email: true, fullName: true } } },
  })
  if (!n) return { ok: false, error: "Xabarnoma topilmadi." }
  if (!n.emailBodyHtml) return { ok: false, error: "Saqlangan shablon yo'q — qayta yuborib bo'lmaydi." }
  if (!n.employee.email) return { ok: false, error: "Qabul qiluvchining email manzili yo'q." }

  const res = await sendRawEmail({
    to: n.employee.email,
    subject: n.emailSubject,
    html: n.emailBodyHtml,
  })

  await prisma.notification.update({
    where: { id },
    data: {
      deliveryAttempts: { increment: 1 },
      status: res.sent ? "SENT" : "FAILED",
      sentAt: res.sent ? new Date() : n.sentAt,
      errorMessage: res.sent ? null : res.error ?? null,
    },
  })

  await logAudit("RESEND_NOTIFICATION", "notification", id, {
    to: n.employee.email,
    sent: res.sent,
  })
  revalidatePath("/notifications")

  return res.sent ? { ok: true } : { ok: false, error: res.error ?? "Yuborilmadi." }
}

// NOT server-only — RSC action'lar VA BullMQ worker'lar ham ishlatadi.
import crypto from "crypto"
import { prisma } from "@/lib/db/prisma"
import { sendAlertEmail, type SendResult } from "@/lib/services/email.service"
import type { AlertFinding } from "@/emails/vulnerability-alert"

export interface NotifyResult {
  created: number
  recipients: number
  emailsSent: number
}

const DEADLINE_DAYS = 7

function appUrl(): string {
  return process.env.AUTH_URL ?? process.env.APP_URL ?? "http://localhost:3001"
}

function recommendation(fixed: string | undefined): string {
  return fixed
    ? `Tuzatilgan versiyaga (${fixed}) yangilang yoki patch o'rnating.`
    : "Ishlab chiqaruvchi tavsiyasiga ko'ra patch/yangilanish o'rnating."
}

interface AffectedInfo {
  fixed?: string
}

// Yuqori ishonchli, harakat talab qiladigan topilmalarni egasi bo'yicha guruhlab
// xabarnoma yaratadi va real SMTP orqali email yuboradi (SMTP yo'q bo'lsa simulyatsiya).
export async function generateNotifications(scanRunId?: string): Promise<NotifyResult> {
  const findings = await prisma.finding.findMany({
    where: {
      confidenceScore: { gte: 0.7 },
      status: { in: ["NEW", "APPLICABLE"] },
      notificationSentAt: null,
    },
    include: {
      vulnerability: {
        select: {
          cveId: true,
          title: true,
          severity: true,
          cvssV3Score: true,
          isKev: true,
          affectedVersions: true,
        },
      },
      asset: {
        include: {
          employees: { where: { unassignedAt: null, role: "owner" }, include: { employee: true } },
          object: { select: { name: true, number: true } },
        },
      },
    },
  })

  const byEmp = new Map<string, { employeeId: string; items: typeof findings }>()
  for (const f of findings) {
    const owner = f.asset.employees[0]?.employee
    if (!owner) continue
    if (!byEmp.has(owner.id)) byEmp.set(owner.id, { employeeId: owner.id, items: [] })
    byEmp.get(owner.id)!.items.push(f)
  }

  let created = 0
  let emailsSent = 0

  for (const { employeeId, items } of byEmp.values()) {
    const owner = items[0].asset.employees[0]?.employee
    const crit = items.filter((i) => i.vulnerability.severity === "CRITICAL").length
    const high = items.filter((i) => i.vulnerability.severity === "HIGH").length
    const kev = items.filter((i) => i.vulnerability.isKev).length
    const ackToken = crypto.randomBytes(16).toString("hex")
    // Bir xodim ko'p MAI'ga ega bo'lishi mumkin — mavzuda MAI sonini ko'rsatamiz.
    const maiCount = new Set(items.map((i) => i.asset.object?.name ?? "—")).size
    const subject =
      `${items.length} ta zaiflik aniqlandi` +
      (maiCount > 1 ? ` — ${maiCount} ta MAI` : "") +
      (kev ? ` · ${kev} shoshilinch (KEV)` : "")

    // Email yuborish (SMTP yo'q bo'lsa simulyatsiya, pipeline davom etadi).
    let emailResult: SendResult = { sent: false, error: "NO_RECIPIENT" }
    if (owner?.email) {
      const alertFindings: AlertFinding[] = items.map((i) => {
        const sev = i.vulnerability.severity
        const aff = i.vulnerability.affectedVersions as AffectedInfo | null
        return {
          cveId: i.vulnerability.cveId,
          title: i.vulnerability.title ?? i.vulnerability.cveId,
          severity:
            sev === "CRITICAL" || sev === "HIGH" || sev === "MEDIUM" || sev === "LOW" ? sev : "LOW",
          cvss: i.vulnerability.cvssV3Score ? Number(i.vulnerability.cvssV3Score) : 0,
          assetName: i.asset.name,
          assetVersion: i.asset.version ?? "",
          hostname: i.asset.hostname ?? "—",
          isKev: i.vulnerability.isKev,
          recommendation: recommendation(aff?.fixed),
          maiName: i.asset.object?.name ?? "MAI biriktirilmagan",
          maiNumber: i.asset.object?.number ?? undefined,
        }
      })
      emailResult = await sendAlertEmail({
        to: owner.email,
        employeeName: owner.fullName ?? owner.email,
        subject,
        findings: alertFindings,
        ackUrl: `${appUrl()}/api/ack/${ackToken}`,
        deadlineDays: DEADLINE_DAYS,
      })
    }
    if (emailResult.sent) emailsSent++

    await prisma.notification.create({
      data: {
        employeeId,
        scanRunId: scanRunId ?? null,
        emailSubject: subject,
        findingsCount: items.length,
        findingsCriticalCount: crit,
        findingsHighCount: high,
        status: emailResult.sent ? "SENT" : "FAILED",
        sentAt: emailResult.sent ? new Date() : null,
        deliveryAttempts: 1,
        errorMessage: emailResult.sent ? null : emailResult.error ?? null,
        emailBodyHtml: emailResult.html ?? null,
        ackToken,
        notificationFindings: { create: items.map((i) => ({ findingId: i.id })) },
      },
    })

    await prisma.finding.updateMany({
      where: { id: { in: items.map((i) => i.id) } },
      data: { notificationSentAt: new Date(), status: "NOTIFIED" },
    })
    created++
  }

  return { created, recipients: byEmp.size, emailsSent }
}

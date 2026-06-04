// NOT server-only — RSC action'lar VA worker'lar/cron ham ishlatadi.
import { prisma } from "@/lib/db/prisma"
import { matchPair } from "./matching.service"

export interface VerifyResult {
  checked: number
  stillVulnerable: number
  resolved: number
  escalated: number
}

// Muddati o'tgan (xabar yuborilgan) topilmalarni qayta tekshiradi:
//  - hali zaif  → PENDING_VERIFICATION (qayta ko'rib chiqish), eskalatsiya
//  - tuzatilgan → CLOSED (hal qilingan)
// Default chegara — 7 kun. Offline ishlaydi (matchPair lokal mantiq).
export async function runVerification(thresholdDays = 7): Promise<VerifyResult> {
  const cutoff = new Date(Date.now() - thresholdDays * 86_400_000)

  const findings = await prisma.finding.findMany({
    where: {
      status: { in: ["NOTIFIED", "ACKNOWLEDGED", "IN_PROGRESS", "PENDING_VERIFICATION"] },
      notificationSentAt: { lt: cutoff },
      OR: [{ lastVerifiedAt: null }, { lastVerifiedAt: { lt: cutoff } }],
    },
    include: { asset: true, vulnerability: true },
  })

  let stillVulnerable = 0
  let resolved = 0
  let escalated = 0
  const now = new Date()

  for (const f of findings) {
    const still = matchPair(f.asset, f.vulnerability)
    if (still) {
      stillVulnerable++
      if (f.status !== "PENDING_VERIFICATION") escalated++
      await prisma.finding.update({
        where: { id: f.id },
        data: { status: "PENDING_VERIFICATION", lastVerifiedAt: now, lastSeenAt: now },
      })
    } else {
      resolved++
      await prisma.finding.update({
        where: { id: f.id },
        data: { status: "CLOSED", lastVerifiedAt: now },
      })
    }
  }

  return { checked: findings.length, stillVulnerable, resolved, escalated }
}

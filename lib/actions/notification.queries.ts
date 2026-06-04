import "server-only"
import { format } from "date-fns"
import { prisma } from "@/lib/db/prisma"
import type { NotificationStatus } from "@prisma/client"

export interface NotifRow {
  id: string
  who: string
  email: string
  mai: string
  subj: string
  cnt: number
  crit: number
  high: number
  status: NotificationStatus
  sent: string
  ack: string | null
  html: string | null
}

export async function getNotifications(): Promise<NotifRow[]> {
  const ns = await prisma.notification.findMany({
    include: {
      employee: { select: { fullName: true, email: true } },
      notificationFindings: {
        include: {
          finding: { include: { asset: { include: { object: { select: { name: true } } } } } },
        },
      },
    },
    orderBy: { sentAt: "desc" },
    take: 100,
  })
  return ns.map((n) => {
    const maiNames = [
      ...new Set(
        n.notificationFindings
          .map((nf) => nf.finding.asset.object?.name)
          .filter((x): x is string => !!x)
      ),
    ]
    return {
      id: n.id,
      who: n.employee.fullName,
      email: n.employee.email,
      mai: maiNames.length ? maiNames.join(", ") : "—",
      subj: n.emailSubject,
      cnt: n.findingsCount,
      crit: n.findingsCriticalCount,
      high: n.findingsHighCount,
      status: n.status,
      sent: n.sentAt ? format(n.sentAt, "yyyy-MM-dd HH:mm") : "—",
      ack: n.acknowledgedAt ? format(n.acknowledgedAt, "yyyy-MM-dd HH:mm") : null,
      html: n.emailBodyHtml,
    }
  })
}

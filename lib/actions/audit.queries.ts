import "server-only"
import { format } from "date-fns"
import { uz } from "date-fns/locale"
import { prisma } from "@/lib/db/prisma"

export interface AuditRow {
  id: string
  actorName: string
  action: string
  detail: string
  dateLabel: string
  timeLabel: string
  ip: string
}

function buildDetail(action: string, newValue: unknown, entityId: string | null): string {
  const v = (newValue ?? {}) as Record<string, unknown>
  switch (action) {
    case "CREATE_ASSET":
    case "UPDATE_ASSET":
      return v.name ? `${v.name} ${v.version ?? ""}`.trim() : (entityId ?? "—")
    case "DELETE_ASSET":
      return entityId ? `Vosita ${entityId.slice(0, 8)}…` : "—"
    case "IMPORT_INVENTORY":
      return `${v.assetsUpserted ?? 0} vosita · ${v.employeesUpserted ?? 0} xodim`
    case "TRIAGE_DECISION":
      return `${v.count ?? 1} ta topilma → ${v.status ?? ""}`
    default:
      return typeof v === "object" && Object.keys(v).length ? JSON.stringify(v) : "—"
  }
}

export async function getAuditLogs(limit = 200): Promise<AuditRow[]> {
  const logs = await prisma.auditLog.findMany({
    include: { actor: { select: { fullName: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  })

  return logs.map((l) => ({
    id: l.id,
    actorName: l.actor?.fullName ?? "Tizim",
    action: l.action,
    detail: buildDetail(l.action, l.newValue, l.entityId),
    dateLabel: format(l.createdAt, "d MMMM yyyy", { locale: uz }),
    timeLabel: format(l.createdAt, "HH:mm"),
    ip: l.ipAddress ?? "—",
  }))
}

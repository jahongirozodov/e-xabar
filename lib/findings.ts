import { FindingStatus } from "@prisma/client"

export const FINDING_STATUS_LABEL_UZ: Record<FindingStatus, string> = {
  NEW: "Yangi",
  PENDING_REVIEW: "Ko'rib chiqilmoqda",
  APPLICABLE: "Tegishli",
  NOTIFIED: "Xabar berilgan",
  ACKNOWLEDGED: "Tasdiqlangan",
  IN_PROGRESS: "Jarayonda",
  PATCHED: "Tuzatilgan",
  PENDING_VERIFICATION: "Tekshirilmoqda",
  VERIFIED: "Verifikatsiya qilingan",
  CLOSED: "Yopilgan",
  NOT_APPLICABLE: "Tegishli emas",
  ACCEPTED_RISK: "Xavf qabul qilingan",
  NEEDS_INVESTIGATION: "Tekshirish kerak",
  PATCH_FAILED: "Patch muvaffaqiyatsiz",
}

export type StatusTone = "default" | "info" | "warn" | "good" | "crit"

export function findingStatusTone(s: FindingStatus): StatusTone {
  switch (s) {
    case "NEW":
      return "info"
    case "PENDING_REVIEW":
    case "NEEDS_INVESTIGATION":
      return "warn"
    case "NOTIFIED":
    case "IN_PROGRESS":
    case "PENDING_VERIFICATION":
      return "default"
    case "PATCHED":
    case "VERIFIED":
    case "CLOSED":
    case "NOT_APPLICABLE":
      return "good"
    case "APPLICABLE":
    case "ACKNOWLEDGED":
    case "ACCEPTED_RISK":
    case "PATCH_FAILED":
      return "crit"
    default:
      return "default"
  }
}

// Status tone → CSS rang
export function statusToneVar(tone: StatusTone): string {
  switch (tone) {
    case "info":
      return "var(--sev-l)"
    case "warn":
      return "var(--sev-h)"
    case "crit":
      return "var(--sev-c)"
    case "good":
      return "var(--success)"
    default:
      return "var(--muted-foreground)"
  }
}

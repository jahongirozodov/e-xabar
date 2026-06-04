export type AuditTone = "new" | "info" | "warn" | "crit" | "mute"

export interface ActionMeta {
  label: string
  icon: string
  tone: AuditTone
}

export const ACTION_META: Record<string, ActionMeta> = {
  LOGIN: { label: "Tizimga kirish", icon: "log-in", tone: "mute" },
  CREATE_ASSET: { label: "Vosita qo'shildi", icon: "plus", tone: "new" },
  UPDATE_ASSET: { label: "Vosita tahrirlandi", icon: "pencil", tone: "mute" },
  DELETE_ASSET: { label: "Vosita o'chirildi", icon: "trash-2", tone: "crit" },
  IMPORT_INVENTORY: { label: "Inventar import", icon: "download", tone: "new" },
  TRIAGE_DECISION: { label: "Triage qarori", icon: "list-checks", tone: "new" },
  RUN_SCAN: { label: "Skan ishga tushirildi", icon: "radar", tone: "info" },
  CREATE_SUPPRESSION: { label: "Bostirish qoidasi", icon: "ban", tone: "warn" },
  SEND_NOTIFICATION: { label: "Xabarnoma yuborildi", icon: "mail", tone: "info" },
  UPDATE_SETTINGS: { label: "Sozlama o'zgartirildi", icon: "settings", tone: "mute" },
}

export function actionMeta(action: string): ActionMeta {
  return ACTION_META[action] ?? { label: action, icon: "activity", tone: "mute" }
}

export function auditToneVar(tone: AuditTone): string {
  switch (tone) {
    case "new":
      return "var(--sev-l)"
    case "info":
      return "var(--kev)"
    case "warn":
      return "var(--sev-h)"
    case "crit":
      return "var(--sev-c)"
    default:
      return "var(--muted-foreground)"
  }
}

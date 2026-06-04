import { Severity } from "@prisma/client"

export { Severity }

export const SEVERITY_LABEL_UZ: Record<Severity, string> = {
  CRITICAL: "Kritik",
  HIGH: "Yuqori",
  MEDIUM: "O'rta",
  LOW: "Past",
  NONE: "—",
}

// Severity → CSS o'zgaruvchi (inline style uchun).
export function severityVar(sev: Severity): string {
  switch (sev) {
    case "CRITICAL":
      return "var(--sev-c)"
    case "HIGH":
      return "var(--sev-h)"
    case "MEDIUM":
      return "var(--sev-m)"
    case "LOW":
      return "var(--sev-l)"
    default:
      return "var(--muted-foreground)"
  }
}

// Severity → Tailwind token nomi (`text-sev-c`, `bg-sev-c` uchun).
export function severityToken(sev: Severity): string {
  switch (sev) {
    case "CRITICAL":
      return "sev-c"
    case "HIGH":
      return "sev-h"
    case "MEDIUM":
      return "sev-m"
    case "LOW":
      return "sev-l"
    default:
      return "muted-foreground"
  }
}

// CVSS bal → severity (NVD chegaralari).
export function cvssToSeverity(score: number | null | undefined): Severity {
  if (score == null) return "NONE"
  if (score >= 9) return "CRITICAL"
  if (score >= 7) return "HIGH"
  if (score >= 4) return "MEDIUM"
  if (score > 0) return "LOW"
  return "NONE"
}

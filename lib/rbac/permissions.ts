import { RoleName } from "@prisma/client"

export type Permission =
  | "dashboard:view"
  | "reports:view"
  | "reports:export"
  | "employees:manage"
  | "assets:manage"
  | "findings:manage"
  | "triage:manage"
  | "suppressions:manage"
  | "scans:run"
  | "auditlog:view"
  | "users:manage"
  | "settings:manage"

export const ROLE_PERMISSIONS: Record<RoleName, Permission[]> = {
  SPECIALIST: [
    "dashboard:view",
    "reports:view",
    "reports:export",
    "employees:manage",
    "assets:manage",
    "findings:manage",
    "triage:manage",
    "suppressions:manage",
    "scans:run",
    "auditlog:view",
  ],
  ADMIN: [
    "dashboard:view",
    "reports:view",
    "reports:export",
    "users:manage",
    "settings:manage",
    "auditlog:view",
  ],
  SECTION_HEAD: ["dashboard:view", "reports:view", "reports:export", "auditlog:view"],
  DEPARTMENT_HEAD: ["dashboard:view", "reports:view", "reports:export", "auditlog:view"],
}

// Foydalanuvchining barcha ruxsatlari (ko'p rol birlashtiriladi).
export function getPermissions(roles: RoleName[]): Set<Permission> {
  const perms = new Set<Permission>()
  for (const role of roles) {
    ROLE_PERMISSIONS[role]?.forEach((p) => perms.add(p))
  }
  return perms
}

export function hasPermission(roles: RoleName[], permission: Permission): boolean {
  return getPermissions(roles).has(permission)
}

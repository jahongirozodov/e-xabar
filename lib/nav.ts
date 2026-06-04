import type { Permission } from "@/lib/rbac/permissions"
import type { RoleName } from "@prisma/client"
import { getPermissions } from "@/lib/rbac/permissions"

export type NavBadgeKey = "findings" | "triage"

export interface NavItem {
  href: string
  label: string
  icon: string // lucide-react ikon kaliti (sidebar map qiladi)
  permission: Permission
  badgeKey?: NavBadgeKey
  badgeTone?: "default" | "warning"
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const NAV: NavGroup[] = [
  {
    label: "Monitoring",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "layout-dashboard", permission: "dashboard:view" },
      { href: "/assets", label: "Vositalar", icon: "server", permission: "assets:manage" },
      { href: "/findings", label: "Topilmalar", icon: "bug", permission: "findings:manage", badgeKey: "findings" },
      { href: "/triage", label: "Triage", icon: "list-checks", permission: "triage:manage", badgeKey: "triage", badgeTone: "warning" },
      { href: "/vulnerabilities", label: "CVE bazasi", icon: "shield", permission: "findings:manage" },
    ],
  },
  {
    label: "Operatsiyalar",
    items: [
      { href: "/scans", label: "Skanlar", icon: "radar", permission: "scans:run" },
      { href: "/notifications", label: "Xabarnomalar", icon: "mail", permission: "findings:manage" },
      { href: "/suppressions", label: "Bostirishlar", icon: "ban", permission: "suppressions:manage" },
    ],
  },
  {
    label: "Tizim",
    items: [
      { href: "/reports", label: "Hisobotlar", icon: "bar-chart-3", permission: "reports:view" },
      { href: "/audit-log", label: "Audit jurnali", icon: "file-text", permission: "auditlog:view" },
      { href: "/admin/users", label: "Foydalanuvchilar", icon: "users", permission: "users:manage" },
      { href: "/admin/settings", label: "Sozlamalar", icon: "settings", permission: "settings:manage" },
    ],
  },
]

// Sahifa sarlavhasi (topbar breadcrumb + h1).
export const PAGE_META: Record<string, { title: string; sub: string }> = {
  "/dashboard": { title: "Boshqaruv paneli", sub: "Zaiflik holatining umumiy ko'rinishi va so'nggi faollik." },
  "/assets": { title: "Vositalar", sub: "Inventardagi vositalar va ularning zaifliklari." },
  "/findings": { title: "Topilmalar", sub: "Aniqlangan topilmalar ro'yxati." },
  "/triage": { title: "Triage", sub: "Ko'rib chiqishni kutayotgan topilmalar." },
  "/vulnerabilities": { title: "CVE bazasi", sub: "Manbalardan yig'ilgan zaifliklar bilim bazasi." },
  "/scans": { title: "Skanlar", sub: "Skanlar tarixi va qo'lda ishga tushirish." },
  "/notifications": { title: "Xabarnomalar", sub: "Xodimlarga yuborilgan xabarnomalar." },
  "/suppressions": { title: "Bostirishlar", sub: "Topilmalarni vaqtincha (muddatli) yashirish qoidalari — soxta yoki qabul qilingan risklar uchun. Muddat tugasa topilma qayta ko'rinadi." },
  "/reports": { title: "Hisobotlar", sub: "Hisobotlar va eksport." },
  "/audit-log": { title: "Audit jurnali", sub: "Tizimdagi barcha amallar jurnali." },
  "/admin/users": { title: "Foydalanuvchilar", sub: "Tizim foydalanuvchilari va rollar (RBAC)." },
  "/admin/settings": { title: "Sozlamalar", sub: "Tizim va integratsiya sozlamalari." },
  "/profile": { title: "Profil", sub: "Hisob ma'lumotlari va xavfsizlik sozlamalari." },
}

export const ROLE_LABEL_UZ: Record<RoleName, string> = {
  ADMIN: "Administrator",
  SPECIALIST: "Mutaxassis",
  SECTION_HEAD: "Bo'lim boshlig'i",
  DEPARTMENT_HEAD: "Departament boshlig'i",
}

// Rollarga qarab nav guruhlarini filtrlash (faqat ruxsat bor itemlar).
export function filterNavByRoles(roles: RoleName[]): NavGroup[] {
  const perms = getPermissions(roles)
  return NAV.map((g) => ({
    ...g,
    items: g.items.filter((i) => perms.has(i.permission)),
  })).filter((g) => g.items.length > 0)
}

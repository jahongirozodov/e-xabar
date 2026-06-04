"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Shield,
  LayoutDashboard,
  Server,
  Bug,
  ListChecks,
  Radar,
  Mail,
  Ban,
  BarChart3,
  FileText,
  Users,
  Settings,
  ChevronsUpDown,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { NavGroup, NavBadgeKey } from "@/lib/nav"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const ICONS: Record<string, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  server: Server,
  bug: Bug,
  "list-checks": ListChecks,
  shield: Shield,
  radar: Radar,
  mail: Mail,
  ban: Ban,
  "bar-chart-3": BarChart3,
  "file-text": FileText,
  users: Users,
  settings: Settings,
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function AppSidebar({
  groups,
  badges,
  user,
  collapsed,
  onNavigate,
}: {
  groups: NavGroup[]
  badges: Partial<Record<NavBadgeKey, number>>
  user: { name: string; role: string }
  collapsed: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-4 overflow-y-auto p-2 pt-3">
        {groups.map((group) => (
          <div key={group.label} className="flex flex-col gap-0.5">
            {!collapsed && (
              <div className="px-3 py-1 text-xs font-medium text-muted-foreground">{group.label}</div>
            )}
            {group.items.map((item) => {
              const Icon = ICONS[item.icon] ?? Shield
              const active = pathname === item.href || pathname.startsWith(item.href + "/")
              const badge = item.badgeKey ? badges[item.badgeKey] : undefined
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent",
                    collapsed && "justify-center px-2",
                    active && "bg-sidebar-accent font-semibold"
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                  {!collapsed && badge != null && badge > 0 && (
                    <span
                      className={cn(
                        "grid h-[18px] min-w-[18px] place-items-center rounded-full px-1.5 text-[0.6875rem] font-semibold",
                        item.badgeTone === "warning"
                          ? "text-background"
                          : "bg-primary text-primary-foreground"
                      )}
                      style={
                        item.badgeTone === "warning"
                          ? { backgroundColor: "var(--sev-h)" }
                          : undefined
                      }
                    >
                      {badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer user */}
      <div className="border-t border-sidebar-border p-2">
        <Link
          href="/profile"
          onClick={onNavigate}
          title={collapsed ? user.name : undefined}
          className={cn(
            "flex items-center gap-2.5 rounded-md px-2 py-2 transition-colors hover:bg-sidebar-accent",
            collapsed && "justify-center"
          )}
        >
          <Avatar className="size-7">
            <AvatarFallback className="text-xs">{initials(user.name)}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium leading-tight">{user.name}</div>
              <div className="truncate text-xs text-muted-foreground">{user.role}</div>
            </div>
          )}
          {!collapsed && <ChevronsUpDown className="size-3.5 text-muted-foreground" />}
        </Link>
      </div>
    </aside>
  )
}

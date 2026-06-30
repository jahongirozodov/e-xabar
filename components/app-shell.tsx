"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { AppSidebar } from "./app-sidebar"
import { AppTopbar } from "./app-topbar"
import { PAGE_META } from "@/lib/nav"
import type { NavGroup, NavBadgeKey } from "@/lib/nav"

interface ShellUser {
  name: string
  email: string
  role: string
  initials: string
}

export function AppShell({
  groups,
  badges,
  user,
  children,
}: {
  groups: NavGroup[]
  badges: Partial<Record<NavBadgeKey, number>>
  user: ShellUser
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const pathname = usePathname()
  const meta = PAGE_META[pathname] ?? { title: "OGOH MAI", sub: "" }

  function toggle() {
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches) {
      setCollapsed((c) => !c)
    } else {
      setMobileOpen((o) => !o)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden md:flex">
        <AppSidebar
          groups={groups}
          badges={badges}
          user={{ name: user.name, role: user.role }}
          collapsed={collapsed}
        />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full shadow-lg">
            <AppSidebar
              groups={groups}
              badges={badges}
              user={{ name: user.name, role: user.role }}
              collapsed={false}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar
          title={meta.title}
          onToggleSidebar={toggle}
          user={{ name: user.name, email: user.email, initials: user.initials }}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="w-full p-5">
            <div className="mb-5">
              <h1 className="text-2xl font-bold tracking-tight">{meta.title}</h1>
              {meta.sub && <p className="text-sm text-muted-foreground">{meta.sub}</p>}
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

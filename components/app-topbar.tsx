"use client"

import * as React from "react"
import Link from "next/link"
import {
  PanelLeft,
  ChevronRight,
  Search,
  Sun,
  Moon,
  Bell,
  LogOut,
  User,
  Settings,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOutAction } from "@/lib/actions/auth.actions"

export function AppTopbar({
  title,
  onToggleSidebar,
  user,
}: {
  title: string
  onToggleSidebar: () => void
  user: { name: string; email: string; initials: string }
}) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  const isDark = mounted ? resolvedTheme === "dark" : true

  return (
    <header className="sticky top-0 z-20 flex h-14 flex-none items-center justify-between gap-4 border-b border-border bg-background/80 px-2 pr-3 backdrop-blur">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar} aria-label="Menyu">
          <PanelLeft className="size-[18px]" />
        </Button>
        <div className="mx-1 h-5 w-px bg-border" />
        <nav className="flex items-center gap-1.5 text-sm">
          <span className="text-muted-foreground">OGOH MAI</span>
          <ChevronRight className="size-3.5 text-muted-foreground" />
          <span className="font-medium">{title}</span>
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative hidden sm:block">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-[15px] -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="CVE, vosita yoki xodim..."
            className="h-9 w-56 pl-8 pr-12"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border bg-muted px-1.5 py-0.5 font-mono text-[0.625rem] text-muted-foreground">
            ⌘K
          </kbd>
        </div>

        <Button variant="ghost" size="icon" onClick={() => setTheme(isDark ? "light" : "dark")} aria-label="Mavzu">
          {isDark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Ogohlantirishlar" className="relative">
              <Bell className="size-[18px]" />
              <span
                className="absolute right-2 top-2 size-1.5 rounded-full"
                style={{ backgroundColor: "var(--sev-c)" }}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Ogohlantirishlar</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-sm">3 ta KEV topilma aniqlandi</DropdownMenuItem>
            <DropdownMenuItem className="text-sm">Skan yakunlandi — 8 vosita</DropdownMenuItem>
            <DropdownMenuItem className="text-sm">NVD manbasi qayta ulandi</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar className="size-8">
                <AvatarFallback className="text-xs">{user.initials}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <div className="text-sm font-medium">{user.name}</div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <User className="size-4" /> Profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/settings">
                <Settings className="size-4" /> Sozlamalar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={(e) => {
                e.preventDefault()
                void signOutAction()
              }}
            >
              <LogOut className="size-4" /> Chiqish
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

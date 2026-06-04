"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"
import {
  Plus,
  Users as UsersIcon,
  CircleCheck,
  Shield,
  ShieldCheck,
  MoreHorizontal,
  Pencil,
  Ban,
  Trash2,
} from "lucide-react"
import type { UserRow } from "@/lib/actions/user.queries"
import { setUserStatus, deleteUser } from "@/lib/actions/user.actions"
import { DataTable } from "@/components/data-table/data-table"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { RoleBadge } from "./role-badge"
import { UserFormDialog } from "./user-form-dialog"

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase()
}

function Stat({ icon: Icon, value, label, color }: { icon: typeof UsersIcon; value: number; label: string; color?: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <span
          className="grid size-9 place-items-center rounded-md"
          style={color ? { color, backgroundColor: `color-mix(in oklab, ${color} 14%, transparent)` } : { background: "var(--muted)" }}
        >
          <Icon className="size-4" />
        </span>
        <div>
          <div className="text-xl font-bold tabular-nums">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  )
}

export function UsersView({ users }: { users: UserRow[] }) {
  const router = useRouter()
  const [formOpen, setFormOpen] = React.useState(false)
  const [formMode, setFormMode] = React.useState<"create" | "edit">("create")
  const [formUser, setFormUser] = React.useState<UserRow | null>(null)

  const total = users.length
  const active = users.filter((u) => u.active).length
  const admins = users.filter((u) => u.roles.includes("ADMIN")).length

  async function onToggleStatus(u: UserRow) {
    const res = await setUserStatus(u.id, !u.active)
    if (res.ok) {
      toast.success(u.active ? "Bloklandi" : "Faollashtirildi")
      router.refresh()
    } else toast.error(res.error)
  }
  async function onDelete(u: UserRow) {
    if (!window.confirm(`${u.name} o'chirilsinmi?`)) return
    const res = await deleteUser(u.id)
    if (res.ok) {
      toast.success("Foydalanuvchi o'chirildi")
      router.refresh()
    } else toast.error(res.error)
  }

  const columns: ColumnDef<UserRow>[] = React.useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Foydalanuvchi",
        cell: ({ row }) => {
          const u = row.original
          return (
            <div className="flex items-center gap-2.5">
              <Avatar className="size-8">
                <AvatarFallback className="text-xs">{initials(u.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  {u.name}
                  {u.isYou && (
                    <span className="rounded bg-secondary px-1.5 py-px text-[0.625rem] text-muted-foreground">Siz</span>
                  )}
                </div>
                <div className="font-mono text-[0.6875rem] text-muted-foreground">{u.email}</div>
              </div>
            </div>
          )
        },
      },
      {
        id: "roles",
        header: "Rollar",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.roles.map((r) => (
              <RoleBadge key={r} role={r} />
            ))}
          </div>
        ),
      },
      {
        accessorKey: "totp",
        header: "2FA",
        cell: ({ row }) =>
          row.original.totp ? (
            <span className="inline-flex items-center gap-1 text-xs" style={{ color: "var(--success)" }}>
              <ShieldCheck className="size-3.5" /> Yoqilgan
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Shield className="size-3.5" /> O&apos;chiq
            </span>
          ),
      },
      {
        accessorKey: "active",
        header: "Holat",
        cell: ({ row }) => {
          const a = row.original.active
          const c = a ? "var(--success)" : "var(--muted-foreground)"
          return (
            <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ color: c, backgroundColor: `color-mix(in oklab, ${c} 14%, transparent)` }}>
              {a ? "Faol" : "Nofaol"}
            </span>
          )
        },
      },
      {
        accessorKey: "createdAt",
        header: "Qo'shilgan",
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.createdAt}</span>,
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          const u = row.original
          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onSelect={() => {
                      setFormUser(u)
                      setFormMode("edit")
                      setFormOpen(true)
                    }}
                  >
                    <Pencil className="size-4" /> Tahrirlash
                  </DropdownMenuItem>
                  {!u.isYou && (
                    <DropdownMenuItem onSelect={() => onToggleStatus(u)}>
                      {u.active ? <Ban className="size-4" /> : <CircleCheck className="size-4" />}
                      {u.active ? "Bloklash" : "Faollashtirish"}
                    </DropdownMenuItem>
                  )}
                  {!u.isYou && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onSelect={() => onDelete(u)}>
                        <Trash2 className="size-4" /> O&apos;chirish
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router]
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat icon={UsersIcon} value={total} label="Jami foydalanuvchi" />
        <Stat icon={CircleCheck} value={active} label="Faol" color="var(--success)" />
        <Stat icon={Shield} value={admins} label="Administrator" color="var(--kev)" />
      </div>

      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={() => {
            setFormUser(null)
            setFormMode("create")
            setFormOpen(true)
          }}
        >
          <Plus className="size-4" /> Foydalanuvchi qo&apos;shish
        </Button>
      </div>

      <DataTable columns={columns} data={users} searchPlaceholder="Ism yoki email..." pageSize={12} />

      <div className="text-xs text-muted-foreground">
        {total} ta foydalanuvchi · bir foydalanuvchi bir nechta rolga ega bo&apos;lishi mumkin
      </div>

      <UserFormDialog open={formOpen} onOpenChange={setFormOpen} mode={formMode} user={formUser} />
    </div>
  )
}

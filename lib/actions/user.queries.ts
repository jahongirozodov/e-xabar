import "server-only"
import { prisma } from "@/lib/db/prisma"
import { auth } from "@/lib/auth/auth"
import type { RoleName } from "@prisma/client"

export interface UserRow {
  id: string
  name: string
  email: string
  roles: RoleName[]
  totp: boolean
  active: boolean
  isYou: boolean
  createdAt: string
}

export async function getUsers(): Promise<UserRow[]> {
  const session = await auth()
  const meId = session?.user?.id
  const users = await prisma.user.findMany({
    include: { roles: { include: { role: true } } },
    orderBy: { createdAt: "asc" },
  })
  return users.map((u) => ({
    id: u.id,
    name: u.fullName,
    email: u.email,
    roles: u.roles.map((r) => r.role.name),
    totp: u.totpEnabled,
    active: u.status === "ACTIVE",
    isYou: u.id === meId,
    createdAt: u.createdAt.toISOString().slice(0, 10),
  }))
}

import "server-only"
import { prisma } from "@/lib/db/prisma"
import { auth } from "@/lib/auth/auth"
import type { RoleName } from "@prisma/client"

export interface ProfileData {
  id: string
  name: string
  email: string
  roles: RoleName[]
  totpEnabled: boolean
}

export async function getProfile(): Promise<ProfileData> {
  const session = await auth()
  const u = await prisma.user.findUniqueOrThrow({
    where: { id: session!.user.id },
    include: { roles: { include: { role: true } } },
  })
  return {
    id: u.id,
    name: u.fullName,
    email: u.email,
    roles: u.roles.map((r) => r.role.name),
    totpEnabled: u.totpEnabled,
  }
}

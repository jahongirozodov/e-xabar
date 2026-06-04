import { RoleName } from "@prisma/client"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth/auth"
import { hasPermission, type Permission } from "./permissions"

// Server Action / Route Handler ichida ishlatish uchun (throw qiladi).
export async function requirePermission(permission: Permission) {
  const session = await auth()
  if (!session?.user) {
    throw new Error("UNAUTHORIZED")
  }
  const roles = (session.user.roles ?? []) as RoleName[]
  if (!hasPermission(roles, permission)) {
    throw new Error("FORBIDDEN")
  }
  return session
}

// Sahifa (server component) ichida — xatolik o'rniga redirect.
export async function requirePagePermission(permission: Permission) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  const roles = (session.user.roles ?? []) as RoleName[]
  if (!hasPermission(roles, permission)) redirect("/dashboard")
  return session
}

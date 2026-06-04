"use server"

import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { Prisma, type RoleName } from "@prisma/client"
import { prisma } from "@/lib/db/prisma"
import { requirePermission } from "@/lib/rbac/guard"
import { logAudit } from "@/lib/services/audit.service"
import { userFormSchema, type UserFormValues } from "@/lib/validations/user.schema"

const DEFAULT_PASSWORD = "Parol@12345"

type ActionResult = { ok: true } | { ok: false; error: string }

async function roleIdsByName(names: RoleName[]): Promise<number[]> {
  const roles = await prisma.role.findMany({ where: { name: { in: names } } })
  return roles.map((r) => r.id)
}

export async function createUser(values: UserFormValues): Promise<ActionResult> {
  await requirePermission("users:manage")
  const parsed = userFormSchema.safeParse(values)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Validatsiya xatosi" }
  const v = parsed.data
  try {
    const hash = await bcrypt.hash(DEFAULT_PASSWORD, 12)
    const ids = await roleIdsByName(v.roles as RoleName[])
    const u = await prisma.user.create({
      data: {
        fullName: v.fullName,
        email: v.email,
        passwordHash: hash,
        roles: { create: ids.map((roleId) => ({ roleId })) },
      },
    })
    await logAudit("CREATE_USER", "user", u.id, { name: v.fullName })
    revalidatePath("/admin/users")
    return { ok: true }
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, error: "Bu email allaqachon mavjud." }
    }
    throw e
  }
}

export async function updateUser(id: string, values: UserFormValues): Promise<ActionResult> {
  await requirePermission("users:manage")
  const parsed = userFormSchema.safeParse(values)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Validatsiya xatosi" }
  const v = parsed.data
  try {
    const ids = await roleIdsByName(v.roles as RoleName[])
    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id }, data: { fullName: v.fullName, email: v.email } })
      await tx.userRole.deleteMany({ where: { userId: id } })
      await tx.userRole.createMany({ data: ids.map((roleId) => ({ userId: id, roleId })) })
    })
    await logAudit("UPDATE_USER", "user", id, { name: v.fullName })
    revalidatePath("/admin/users")
    return { ok: true }
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, error: "Bu email allaqachon mavjud." }
    }
    throw e
  }
}

export async function setUserStatus(id: string, active: boolean): Promise<ActionResult> {
  const session = await requirePermission("users:manage")
  if (id === session.user.id && !active) {
    return { ok: false, error: "O'zingizni bloklay olmaysiz." }
  }
  await prisma.user.update({ where: { id }, data: { status: active ? "ACTIVE" : "INACTIVE" } })
  await logAudit(active ? "ACTIVATE_USER" : "DEACTIVATE_USER", "user", id)
  revalidatePath("/admin/users")
  return { ok: true }
}

export async function deleteUser(id: string): Promise<ActionResult> {
  const session = await requirePermission("users:manage")
  if (id === session.user.id) {
    return { ok: false, error: "O'zingizni o'chira olmaysiz." }
  }
  await prisma.user.delete({ where: { id } })
  await logAudit("DELETE_USER", "user", id)
  revalidatePath("/admin/users")
  return { ok: true }
}

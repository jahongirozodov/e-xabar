"use server"

import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { authenticator } from "otplib"
import { prisma } from "@/lib/db/prisma"
import { auth } from "@/lib/auth/auth"
import { encrypt } from "@/lib/utils/crypto"
import { logAudit } from "@/lib/services/audit.service"

type Result = { ok: true } | { ok: false; error: string }

async function meId(): Promise<string> {
  const s = await auth()
  if (!s?.user?.id) throw new Error("UNAUTHORIZED")
  return s.user.id
}

export async function updateProfile(fullName: string): Promise<Result> {
  const id = await meId()
  if (!fullName.trim()) return { ok: false, error: "Ism majburiy" }
  await prisma.user.update({ where: { id }, data: { fullName: fullName.trim() } })
  await logAudit("UPDATE_PROFILE", "user", id)
  revalidatePath("/profile")
  return { ok: true }
}

export async function changePassword(current: string, next: string): Promise<Result> {
  const id = await meId()
  if (next.length < 12) return { ok: false, error: "Yangi parol kamida 12 belgi bo'lishi kerak" }
  const u = await prisma.user.findUniqueOrThrow({ where: { id } })
  if (!(await bcrypt.compare(current, u.passwordHash))) {
    return { ok: false, error: "Joriy parol noto'g'ri" }
  }
  await prisma.user.update({ where: { id }, data: { passwordHash: await bcrypt.hash(next, 12) } })
  await logAudit("CHANGE_PASSWORD", "user", id)
  return { ok: true }
}

export async function startTotpEnroll(): Promise<{ secret: string; otpauth: string }> {
  const id = await meId()
  const u = await prisma.user.findUniqueOrThrow({ where: { id } })
  const secret = authenticator.generateSecret()
  const otpauth = authenticator.keyuri(u.email, "e-Xabar", secret)
  return { secret, otpauth }
}

export async function confirmTotpEnroll(secret: string, code: string): Promise<Result> {
  const id = await meId()
  if (!authenticator.verify({ token: code.trim(), secret })) {
    return { ok: false, error: "Tasdiqlash kodi noto'g'ri" }
  }
  await prisma.user.update({ where: { id }, data: { totpSecret: encrypt(secret), totpEnabled: true } })
  await logAudit("ENABLE_2FA", "user", id)
  revalidatePath("/profile")
  return { ok: true }
}

export async function disableTotp(password: string): Promise<Result> {
  const id = await meId()
  const u = await prisma.user.findUniqueOrThrow({ where: { id } })
  if (!(await bcrypt.compare(password, u.passwordHash))) {
    return { ok: false, error: "Parol noto'g'ri" }
  }
  await prisma.user.update({ where: { id }, data: { totpEnabled: false, totpSecret: null } })
  await logAudit("DISABLE_2FA", "user", id)
  revalidatePath("/profile")
  return { ok: true }
}

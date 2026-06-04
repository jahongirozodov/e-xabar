"use server"

import bcrypt from "bcryptjs"
import { AuthError } from "next-auth"
import { prisma } from "@/lib/db/prisma"
import { signIn, signOut } from "@/lib/auth/auth"

const INVALID = "Email yoki parol noto'g'ri."

// 1-bosqich: parolni tekshiradi va 2FA kerakligini aytadi (hali kirmaydi).
export async function precheckCredentials(
  email: string,
  password: string
): Promise<{ ok: boolean; needs2fa: boolean; error?: string }> {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || user.status !== "ACTIVE") {
    return { ok: false, needs2fa: false, error: INVALID }
  }
  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    return { ok: false, needs2fa: false, error: INVALID }
  }
  // Dev'da 2FA vaqtincha o'chirilgan — kod so'ralmaydi.
  const twoFaDisabled = process.env.NODE_ENV !== "production"
  return { ok: true, needs2fa: twoFaDisabled ? false : user.totpEnabled }
}

// 2-bosqich (yoki 2FA o'chiq bo'lsa darhol): haqiqiy signIn.
export async function authenticate(
  email: string,
  password: string,
  totp?: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await signIn("credentials", { email, password, totp, redirect: false })
    return { ok: true }
  } catch (e) {
    if (e instanceof AuthError) {
      return { ok: false, error: totp ? "Tasdiqlash kodi noto'g'ri." : INVALID }
    }
    throw e
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: "/login" })
}

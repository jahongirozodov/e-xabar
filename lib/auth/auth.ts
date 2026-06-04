import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { authenticator } from "otplib"
import { prisma } from "@/lib/db/prisma"
import { authConfig } from "./auth.config"
import { decrypt } from "@/lib/utils/crypto"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
        totp: {},
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined
        const password = credentials?.password as string | undefined
        const totp = credentials?.totp as string | undefined
        if (!email || !password) return null

        const user = await prisma.user.findUnique({
          where: { email },
          include: { roles: { include: { role: true } } },
        })
        if (!user || user.status !== "ACTIVE") return null

        const valid = await bcrypt.compare(password, user.passwordHash)
        if (!valid) return null

        // 2FA tekshirish (faqat yoqilgan bo'lsa). Dev'da vaqtincha o'chirilgan.
        const twoFaDisabled = process.env.NODE_ENV !== "production"
        if (!twoFaDisabled && user.totpEnabled && user.totpSecret) {
          if (!totp) return null
          const secret = decrypt(user.totpSecret)
          const ok = authenticator.verify({ token: totp, secret })
          if (!ok) return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          roles: user.roles.map((r) => r.role.name),
        }
      },
    }),
  ],
})

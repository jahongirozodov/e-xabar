import type { NextAuthConfig } from "next-auth"
import type { RoleName } from "@prisma/client"

// Edge-safe konfiguratsiya — faqat callbacks (Node import yo'q). middleware ishlatadi.
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/employees",
  "/assets",
  "/assignments",
  "/findings",
  "/triage",
  "/suppressions",
  "/vulnerabilities",
  "/scans",
  "/reports",
  "/notifications",
  "/audit-log",
  "/admin",
]

export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 30 * 60 }, // 30 daqiqa
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isProtected = PROTECTED_PREFIXES.some((p) => nextUrl.pathname.startsWith(p))
      if (isProtected) return isLoggedIn
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.roles = user.roles as RoleName[]
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.roles = (token.roles ?? []) as RoleName[]
      }
      return session
    },
  },
  providers: [],
} satisfies NextAuthConfig

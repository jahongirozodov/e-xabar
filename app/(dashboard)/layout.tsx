import { redirect } from "next/navigation"
import type { RoleName } from "@prisma/client"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { filterNavByRoles, ROLE_LABEL_UZ } from "@/lib/nav"
import { AppShell } from "@/components/app-shell"

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const roles = (session.user.roles ?? []) as RoleName[]
  const groups = filterNavByRoles(roles)

  const [findingsActive, triagePending] = await Promise.all([
    prisma.finding.count({ where: { status: { notIn: ["CLOSED", "NOT_APPLICABLE"] } } }),
    prisma.finding.count({ where: { status: "PENDING_REVIEW" } }),
  ])

  const name = session.user.name ?? "Foydalanuvchi"
  const user = {
    name,
    email: session.user.email ?? "",
    role: roles[0] ? ROLE_LABEL_UZ[roles[0]] : "",
    initials: initials(name),
  }

  return (
    <AppShell groups={groups} badges={{ findings: findingsActive, triage: triagePending }} user={user}>
      {children}
    </AppShell>
  )
}

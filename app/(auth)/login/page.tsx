import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth/auth"
import { LoginView } from "@/components/auth/login-view"

export const metadata: Metadata = {
  title: "Kirish — OGOH MAI",
}

export default async function LoginPage() {
  const session = await auth()
  if (session?.user) redirect("/dashboard")
  return <LoginView />
}

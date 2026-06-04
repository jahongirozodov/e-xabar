"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { precheckCredentials, authenticate } from "@/lib/actions/auth.actions"

const credSchema = z.object({
  email: z.string().email("Email formati noto'g'ri."),
  password: z.string().min(6, "Parol kamida 6 belgidan iborat bo'lishi kerak."),
})
type CredValues = z.infer<typeof credSchema>

export function LoginView() {
  const router = useRouter()
  const [step, setStep] = React.useState<"cred" | "otp">("cred")
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState("")
  const [code, setCode] = React.useState(["", "", "", "", "", ""])
  const otpRefs = React.useRef<(HTMLInputElement | null)[]>([])

  const form = useForm<CredValues>({
    resolver: zodResolver(credSchema),
    defaultValues: { email: "", password: "" },
  })

  function goDashboard() {
    router.push("/dashboard")
    router.refresh()
  }

  async function onCredSubmit(values: CredValues) {
    setError("")
    setBusy(true)
    try {
      const pre = await precheckCredentials(values.email, values.password)
      if (!pre.ok) {
        setError(pre.error ?? "Kirish amalga oshmadi.")
        return
      }
      if (pre.needs2fa) {
        setStep("otp")
        setTimeout(() => otpRefs.current[0]?.focus(), 50)
        return
      }
      const res = await authenticate(values.email, values.password)
      if (!res.ok) {
        setError(res.error ?? "Kirish amalga oshmadi.")
        return
      }
      goDashboard()
    } finally {
      setBusy(false)
    }
  }

  function setDigit(i: number, v: string) {
    const d = v.replace(/\D/g, "").slice(-1)
    const next = [...code]
    next[i] = d
    setCode(next)
    if (d && i < 5) otpRefs.current[i + 1]?.focus()
  }

  function onKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !code[i] && i > 0) otpRefs.current[i - 1]?.focus()
  }

  function onPaste(e: React.ClipboardEvent) {
    const t = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6)
    if (!t) return
    e.preventDefault()
    const n = ["", "", "", "", "", ""]
    t.split("").forEach((d, i) => (n[i] = d))
    setCode(n)
    otpRefs.current[Math.min(t.length, 5)]?.focus()
  }

  async function onOtpSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (code.join("").length < 6) {
      setError("6 xonali kodni kiriting.")
      return
    }
    setBusy(true)
    try {
      const { email, password } = form.getValues()
      const res = await authenticate(email, password, code.join(""))
      if (!res.ok) {
        setError(res.error ?? "Kirish amalga oshmadi.")
        return
      }
      goDashboard()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-8">
      {/* Forma paneli — markazlashtirilgan */}
      <div className="w-full max-w-[360px] rounded-2xl border bg-card p-8 shadow-sm">
        {step === "cred" ? (
            <form onSubmit={form.handleSubmit(onCredSubmit)} className="flex flex-col gap-[1.125rem]">
              <div>
                <h2 className="mb-1.5 text-2xl font-bold tracking-tight">Tizimga kirish</h2>
                <p className="text-sm leading-snug text-muted-foreground">
                  Hisobingizga kirish uchun ma&apos;lumotlarni kiriting.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ism@example.uz"
                  autoFocus
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Parol</Label>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
                  >
                    Parolni unutdingizmi?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...form.register("password")}
                />
                {form.formState.errors.password && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-1.5 rounded-md bg-destructive/10 px-2.5 py-2 text-[0.8125rem] text-destructive">
                  <AlertTriangle className="size-3.5 shrink-0" /> {error}
                </div>
              )}

              <Button type="submit" disabled={busy} className="h-10 w-full">
                {busy ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" /> Tekshirilmoqda...
                  </>
                ) : (
                  <>
                    Davom etish <ChevronRight className="size-4" />
                  </>
                )}
              </Button>

            </form>
          ) : (
            <form onSubmit={onOtpSubmit} className="flex flex-col gap-[1.125rem]">
              <button
                type="button"
                onClick={() => {
                  setStep("cred")
                  setError("")
                  setCode(["", "", "", "", "", ""])
                }}
                className="inline-flex items-center gap-1 self-start text-[0.8125rem] text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="size-4" /> Orqaga
              </button>

              <div>
                <div className="mb-3.5 inline-flex size-12 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <ShieldCheck className="size-[22px]" />
                </div>
                <h2 className="mb-1.5 text-2xl font-bold tracking-tight">
                  Ikki bosqichli tasdiqlash
                </h2>
                <p className="text-sm leading-snug text-muted-foreground">
                  Autentifikator ilovasidagi 6 xonali kodni kiriting.
                </p>
              </div>

              <div className="flex gap-2" onPaste={onPaste}>
                {code.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      otpRefs.current[i] = el
                    }}
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => setDigit(i, e.target.value)}
                    onKeyDown={(e) => onKey(i, e)}
                    className="h-[52px] w-full rounded-md border border-input bg-background text-center font-mono text-xl font-semibold outline-none transition focus:border-ring focus:ring-[3px] focus:ring-ring/30"
                  />
                ))}
              </div>

              {error && (
                <div className="flex items-center gap-1.5 rounded-md bg-destructive/10 px-2.5 py-2 text-[0.8125rem] text-destructive">
                  <AlertTriangle className="size-3.5 shrink-0" /> {error}
                </div>
              )}

              <Button type="submit" disabled={busy} className="h-10 w-full">
                {busy ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" /> Kirilmoqda...
                  </>
                ) : (
                  "Tasdiqlash va kirish"
                )}
              </Button>
            </form>
          )}
      </div>
    </div>
  )
}

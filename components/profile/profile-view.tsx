"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ShieldCheck, Shield, Monitor } from "lucide-react"
import type { ProfileData } from "@/lib/actions/profile.queries"
import {
  updateProfile,
  changePassword,
  startTotpEnroll,
  confirmTotpEnroll,
  disableTotp,
} from "@/lib/actions/profile.actions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { RoleBadge } from "@/components/users/role-badge"

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase()
}

export function ProfileView({ profile }: { profile: ProfileData }) {
  const router = useRouter()
  const [name, setName] = React.useState(profile.name)
  const [cur, setCur] = React.useState("")
  const [nw, setNw] = React.useState("")
  const [conf, setConf] = React.useState("")
  const [enroll, setEnroll] = React.useState<{ secret: string; otpauth: string } | null>(null)
  const [code, setCode] = React.useState("")
  const [disablePw, setDisablePw] = React.useState("")

  async function onSaveName() {
    const res = await updateProfile(name)
    if (res.ok) {
      toast.success("Profil yangilandi")
      router.refresh()
    } else toast.error(res.error)
  }
  async function onChangePw() {
    if (nw !== conf) {
      toast.error("Yangi parollar mos emas")
      return
    }
    const res = await changePassword(cur, nw)
    if (res.ok) {
      toast.success("Parol o'zgartirildi")
      setCur("")
      setNw("")
      setConf("")
    } else toast.error(res.error)
  }
  async function onStartEnroll() {
    setEnroll(await startTotpEnroll())
    setCode("")
  }
  async function onConfirmEnroll() {
    if (!enroll) return
    const res = await confirmTotpEnroll(enroll.secret, code)
    if (res.ok) {
      toast.success("2FA yoqildi")
      setEnroll(null)
      router.refresh()
    } else toast.error(res.error)
  }
  async function onDisable() {
    const res = await disableTotp(disablePw)
    if (res.ok) {
      toast.success("2FA o'chirildi")
      setDisablePw("")
      router.refresh()
    } else toast.error(res.error)
  }

  return (
    <div className="max-w-3xl">
      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-center gap-5 p-6">
          <Avatar className="size-14">
            <AvatarFallback className="text-lg">{initials(profile.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-lg font-semibold">{profile.name}</span>
              {profile.roles.map((r) => (
                <RoleBadge key={r} role={r} />
              ))}
              {profile.totpEnabled && (
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium" style={{ color: "var(--success)", background: "color-mix(in oklab, var(--success) 14%, transparent)" }}>
                  <ShieldCheck className="size-3" /> 2FA yoqilgan
                </span>
              )}
            </div>
            <div className="mt-1 font-mono text-sm text-muted-foreground">{profile.email}</div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">Hisob</TabsTrigger>
          <TabsTrigger value="security">Xavfsizlik</TabsTrigger>
          <TabsTrigger value="sessions">Seanslar</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader><CardTitle>Shaxsiy ma&apos;lumotlar</CardTitle><CardDescription>Profil va aloqa ma&apos;lumotlari.</CardDescription></CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label>To&apos;liq ism</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Email</Label>
                <Input value={profile.email} disabled />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Rol</Label>
                <Input value={profile.roles.join(", ")} disabled />
                <p className="text-xs text-muted-foreground">Rolni faqat administrator o&apos;zgartiradi.</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={onSaveName}>O&apos;zgarishlarni saqlash</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="flex flex-col gap-4">
          <Card>
            <CardHeader><CardTitle>Parolni o&apos;zgartirish</CardTitle><CardDescription>Kamida 12 belgi.</CardDescription></CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label>Joriy parol</Label>
                <Input type="password" value={cur} onChange={(e) => setCur(e.target.value)} />
              </div>
              <div />
              <div className="flex flex-col gap-1.5">
                <Label>Yangi parol</Label>
                <Input type="password" value={nw} onChange={(e) => setNw(e.target.value)} placeholder="Yangi parol" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Tasdiqlang</Label>
                <Input type="password" value={conf} onChange={(e) => setConf(e.target.value)} placeholder="Takrorlang" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={onChangePw} disabled={!cur || !nw}>Parolni yangilash</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader><CardTitle>Ikki bosqichli autentifikatsiya</CardTitle><CardDescription>TOTP ilovasi (Google Authenticator, Authy).</CardDescription></CardHeader>
            <CardContent className="flex flex-col gap-4">
              {profile.totpEnabled ? (
                <div className="flex flex-col gap-2">
                  <div className="inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-1 text-sm" style={{ color: "var(--success)", background: "color-mix(in oklab, var(--success) 14%, transparent)" }}>
                    <ShieldCheck className="size-4" /> 2FA yoqilgan
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex flex-col gap-1.5">
                      <Label>O&apos;chirish uchun parol</Label>
                      <Input type="password" value={disablePw} onChange={(e) => setDisablePw(e.target.value)} className="w-56" />
                    </div>
                    <Button variant="destructive" onClick={onDisable} disabled={!disablePw}>
                      2FA o&apos;chirish
                    </Button>
                  </div>
                </div>
              ) : enroll ? (
                <div className="flex flex-col gap-3 rounded-lg border p-4">
                  <div className="flex items-center gap-2 text-sm font-medium"><Shield className="size-4" /> Sozlash</div>
                  <p className="text-xs text-muted-foreground">
                    Quyidagi maxfiy kalitni autentifikator ilovasiga qo&apos;ling, so&apos;ng 6 xonali kodni kiriting.
                  </p>
                  <code className="break-all rounded bg-muted px-2 py-1.5 font-mono text-xs">{enroll.secret}</code>
                  <div className="flex items-end gap-2">
                    <div className="flex flex-col gap-1.5">
                      <Label>Tasdiqlash kodi</Label>
                      <Input value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" maxLength={6} className="w-40 font-mono" />
                    </div>
                    <Button onClick={onConfirmEnroll} disabled={code.length < 6}>Tasdiqlash</Button>
                    <Button variant="ghost" onClick={() => setEnroll(null)}>Bekor</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <div className="text-sm font-medium">TOTP autentifikator</div>
                    <div className="text-xs text-muted-foreground">Kirishda 6 xonali bir martalik kod so&apos;raladi.</div>
                  </div>
                  <Button variant="outline" onClick={onStartEnroll}>Yoqish</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardHeader><CardTitle>Faol seans</CardTitle><CardDescription>JWT strategiyasi — joriy seans (30 daqiqa).</CardDescription></CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <span className="grid size-9 place-items-center rounded-md bg-muted"><Monitor className="size-4" /></span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    Joriy brauzer
                    <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ color: "var(--success)", background: "color-mix(in oklab, var(--success) 14%, transparent)" }}>Joriy seans</span>
                  </div>
                  <div className="text-xs text-muted-foreground">JWT token · 30 daqiqada avtomatik tugaydi</div>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                To&apos;liq seans boshqaruvi (qurilmalar ro&apos;yxati) DB-session rejimida qo&apos;shiladi.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

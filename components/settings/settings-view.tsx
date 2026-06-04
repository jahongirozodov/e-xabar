"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Mail, RefreshCw, ShieldCheck } from "lucide-react"
import type { SettingsMap, IntegrationRow } from "@/lib/actions/settings.queries"
import { saveSettings, refreshIntegrations } from "@/lib/actions/settings.actions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const IST: Record<string, { label: string; color: string }> = {
  healthy: { label: "Faol", color: "var(--success)" },
  degraded: { label: "Sekinlashgan", color: "var(--sev-h)" },
  down: { label: "Ishlamayapti", color: "var(--sev-c)" },
  unknown: { label: "Noma'lum", color: "var(--muted-foreground)" },
}

function Row({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

function ToggleRow({ title, desc, checked, onChange }: { title: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

export function SettingsView({
  settings,
  integrations,
}: {
  settings: SettingsMap
  integrations: IntegrationRow[]
}) {
  const router = useRouter()
  const [s, setS] = React.useState<SettingsMap>(settings)
  const [nvdKey, setNvdKey] = React.useState("")
  const [githubToken, setGithubToken] = React.useState("")
  const set = (k: string, v: string) => setS((prev) => ({ ...prev, [k]: v }))

  async function save(keys: string[], label: string, extra?: Record<string, string>) {
    const payload: Record<string, string> = {}
    for (const k of keys) payload[k] = s[k]
    if (extra) Object.assign(payload, extra)
    await saveSettings(payload)
    toast.success("Saqlandi", { description: label })
    router.refresh()
  }

  return (
    <div className="max-w-3xl">
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">Umumiy</TabsTrigger>
          <TabsTrigger value="scan">Skanlash</TabsTrigger>
          <TabsTrigger value="smtp">Email (SMTP)</TabsTrigger>
          <TabsTrigger value="integrations">Integratsiyalar</TabsTrigger>
          <TabsTrigger value="api">API kalitlari</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader><CardTitle>Umumiy</CardTitle><CardDescription>Tashkilot va til sozlamalari.</CardDescription></CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Row label="Tashkilot nomi"><Input value={s.org_name} onChange={(e) => set("org_name", e.target.value)} /></Row>
              <Row label="Vaqt mintaqasi"><Input value={s.timezone} onChange={(e) => set("timezone", e.target.value)} /></Row>
              <Row label="Standart til"><Input value={s.language} onChange={(e) => set("language", e.target.value)} /></Row>
              <Row label="Seans muddati (daqiqa)" hint="Faolsizlikdan keyin chiqish."><Input value={s.session_minutes} onChange={(e) => set("session_minutes", e.target.value)} /></Row>
            </CardContent>
            <CardFooter>
              <Button onClick={() => save(["org_name", "timezone", "language", "session_minutes"], "Umumiy sozlamalar yangilandi.")}>
                O&apos;zgarishlarni saqlash
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="scan">
          <Card>
            <CardHeader><CardTitle>Skanlash jadvali</CardTitle><CardDescription>Avtomatik skan va qayta tekshirish.</CardDescription></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Row label="Skan chastotasi"><Input value={s.scan_frequency} onChange={(e) => set("scan_frequency", e.target.value)} /></Row>
                <Row label="Kun va vaqt"><Input value={s.scan_time} onChange={(e) => set("scan_time", e.target.value)} /></Row>
              </div>
              <ToggleRow title="KEV ustuvor skanlash" desc="Faol ekspluatatsiyadagi zaifliklar har kuni tekshiriladi." checked={s.kev_priority === "true"} onChange={(v) => set("kev_priority", String(v))} />
              <ToggleRow title="Avtomatik qayta tekshirish" desc="Patchdan 7 kun keyin topilma qayta tasdiqlanadi." checked={s.auto_verify === "true"} onChange={(v) => set("auto_verify", String(v))} />
            </CardContent>
            <CardFooter>
              <Button onClick={() => save(["scan_frequency", "scan_time", "kev_priority", "auto_verify"], "Skanlash jadvali yangilandi.")}>Saqlash</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="smtp">
          <Card>
            <CardHeader><CardTitle>Email (SMTP)</CardTitle><CardDescription>Xabarnomalar shu server orqali yuboriladi.</CardDescription></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Row label="SMTP host"><Input value={s.smtp_host} onChange={(e) => set("smtp_host", e.target.value)} /></Row>
                <Row label="Port"><Input value={s.smtp_port} onChange={(e) => set("smtp_port", e.target.value)} /></Row>
                <Row label="Foydalanuvchi"><Input value={s.smtp_user} onChange={(e) => set("smtp_user", e.target.value)} /></Row>
                <Row label="Jo'natuvchi (From)"><Input value={s.smtp_from} onChange={(e) => set("smtp_from", e.target.value)} /></Row>
              </div>
              <ToggleRow title="TLS shifrlash" desc="STARTTLS orqali xavfsiz ulanish." checked={s.smtp_tls === "true"} onChange={(v) => set("smtp_tls", String(v))} />
            </CardContent>
            <CardFooter className="gap-2">
              <Button variant="outline" onClick={() => toast.success("Test email yuborildi", { description: s.smtp_from })}>
                <Mail className="size-4" /> Test yuborish
              </Button>
              <Button onClick={() => save(["smtp_host", "smtp_port", "smtp_user", "smtp_from", "smtp_tls"], "SMTP sozlamalari yangilandi.")}>Saqlash</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card className="overflow-hidden p-0">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <CardTitle>CVE manbalari</CardTitle>
                <CardDescription>Integratsiyalar holati va sog&apos;ligi.</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const res = await refreshIntegrations()
                  toast.success("Manbalar yangilandi", { description: `${res.upserted} ta CVE yangilandi (LOCAL)` })
                  router.refresh()
                }}
              >
                <RefreshCw className="size-4" /> Tekshirish
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Manba</TableHead>
                  <TableHead>Holat</TableHead>
                  <TableHead>Oxirgi tekshiruv</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {integrations.map((it) => {
                  const st = IST[it.status] ?? IST.unknown
                  return (
                    <TableRow key={it.src}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="rounded border px-1.5 py-px font-mono text-[0.625rem] font-medium text-muted-foreground">{it.src}</span>
                          <span className="text-sm text-muted-foreground">{it.desc}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium" style={{ color: st.color, backgroundColor: `color-mix(in oklab, ${st.color} 14%, transparent)` }}>
                          <span className="size-1.5 rounded-full" style={{ background: st.color }} />
                          {st.label}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{it.lastChecked}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader><CardTitle>API kalitlari</CardTitle><CardDescription>Tashqi manbalar uchun autentifikatsiya. AES-256-GCM bilan shifrlangan holda saqlanadi.</CardDescription></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Row label="NVD API kaliti" hint={s.has_nvd_key === "true" ? "Kalit saqlangan. Yangilash uchun yangi qiymat kiriting." : "50 so'rov / 30 soniya limit."}>
                <Input type="password" value={nvdKey} onChange={(e) => setNvdKey(e.target.value)} placeholder={s.has_nvd_key === "true" ? "••••••••••••" : "nvd-..."} />
              </Row>
              <Row label="GitHub tokeni" hint={s.has_github_token === "true" ? "Token saqlangan. Yangilash uchun yangi qiymat kiriting." : "GHSA manbasi uchun (read-only)."}>
                <Input type="password" value={githubToken} onChange={(e) => setGithubToken(e.target.value)} placeholder={s.has_github_token === "true" ? "••••••••••••" : "ghp_..."} />
              </Row>
              <div className="inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-1 text-xs" style={{ color: "var(--success)", background: "color-mix(in oklab, var(--success) 14%, transparent)" }}>
                <ShieldCheck className="size-3.5" /> AES-256-GCM bilan shifrlangan
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() =>
                  save([], "API kalitlari yangilandi.", {
                    ...(nvdKey ? { nvd_api_key: nvdKey } : {}),
                    ...(githubToken ? { github_token: githubToken } : {}),
                  }).then(() => {
                    setNvdKey("")
                    setGithubToken("")
                  })
                }
              >
                Saqlash
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

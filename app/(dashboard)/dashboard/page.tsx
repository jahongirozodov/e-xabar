import { Server, Bug, Flame, ShieldAlert, Package, Download, Radar, ChevronRight } from "lucide-react"
import { getDashboardData } from "@/lib/actions/dashboard.actions"
import { SEVERITY_LABEL_UZ, severityVar } from "@/lib/severity"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { SevBar } from "@/components/dashboard/sev-bar"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { LineChart } from "@/components/charts/line-chart"
import { DonutChart } from "@/components/charts/donut-chart"
import { KevBadge } from "@/components/severity-badge"

const RANGES = ["7 kun", "30 kun", "90 kun"]

export default async function DashboardPage() {
  const d = await getDashboardData()

  const donutData = [
    { label: SEVERITY_LABEL_UZ.CRITICAL, value: d.severityDist.CRITICAL, color: "var(--sev-c)" },
    { label: SEVERITY_LABEL_UZ.HIGH, value: d.severityDist.HIGH, color: "var(--sev-h)" },
    { label: SEVERITY_LABEL_UZ.MEDIUM, value: d.severityDist.MEDIUM, color: "var(--sev-m)" },
    { label: SEVERITY_LABEL_UZ.LOW, value: d.severityDist.LOW, color: "var(--sev-l)" },
  ]

  return (
    <div className="flex flex-col gap-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-md border bg-card p-0.5">
          {RANGES.map((r) => (
            <span
              key={r}
              className={
                "rounded px-3 py-1 text-sm " +
                (r === "90 kun" ? "bg-secondary font-medium" : "text-muted-foreground")
              }
            >
              {r}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="size-4" /> Eksport
          </Button>
          <Button size="sm">
            <Radar className="size-4" /> Skan ishga tushirish
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Jami vositalar" value={d.totalAssets} icon={Server} delta="+3.2%" dir="up" tone="neutral" sub="o'tgan oyga nisbatan" />
        <KpiCard label="Aktiv topilmalar" value={d.activeCount} icon={Bug} delta="+18" dir="up" tone="bad" sub="so'nggi 7 kun" />
        <KpiCard label="Critical + High" value={d.criticalHigh} icon={Flame} delta="−8" dir="down" tone="good" sub="so'nggi 7 kun" />
        <KpiCard label="KEV topilmalar" value={d.kev} icon={ShieldAlert} delta="+3" dir="up" tone="bad" sub="faol ekspluatatsiya" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Topilmalar dinamikasi</CardTitle>
            <CardDescription>So&apos;nggi 90 kun · aktiv va yuqori darajali topilmalar</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChart
              data={d.trend}
              xKey="label"
              series={[
                { key: "active", label: "Aktiv topilmalar", color: "var(--sev-l)", area: true },
                { key: "crit", label: "Critical + High", color: "var(--sev-c)" },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Darajalar bo&apos;yicha</CardTitle>
            <CardDescription>{d.activeCount} ta aktiv topilma</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart data={donutData} centerLabel="Topilma" />
          </CardContent>
        </Card>
      </div>

      {/* Bottom: top assets + activity */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <CardTitle>TOP-10 zaif vosita</CardTitle>
              <CardDescription>Topilmalar soni bo&apos;yicha</CardDescription>
            </div>
            <Button variant="ghost" size="sm">
              Hammasi <ChevronRight className="size-3.5" />
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-8">#</TableHead>
                <TableHead>Vosita</TableHead>
                <TableHead>Platforma</TableHead>
                <TableHead className="w-40">Topilmalar</TableHead>
                <TableHead className="w-16 text-right">CVSS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {d.topAssets.map((a, i) => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono text-muted-foreground">{i + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <span className="grid size-7 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                        <Package className="size-[15px]" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-sm font-medium">
                          <span className="truncate">{a.name}</span>
                          <span className="font-mono text-xs text-muted-foreground">{a.version}</span>
                          {a.kev && <KevBadge />}
                        </div>
                        <div className="text-xs text-muted-foreground">{a.hostname ?? "—"}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {a.platform ?? "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="size-2 shrink-0 rounded-full" style={{ background: severityVar(a.topSeverity) }} />
                      <span className="w-5 font-mono text-sm">{a.count}</span>
                      <SevBar b={a.breakdown} />
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium" style={{ color: severityVar(a.topSeverity) }}>
                    {a.maxCvss != null ? a.maxCvss.toFixed(1) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <CardTitle>So&apos;nggi faoliyat</CardTitle>
              <CardDescription>Tizim hodisalari</CardDescription>
            </div>
          </div>
          <ActivityFeed items={d.activity} />
        </Card>
      </div>
    </div>
  )
}

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer"
import * as React from "react"
import type { ReportData } from "@/lib/services/report.service"

const TYPE_LABEL: Record<string, string> = {
  weekly: "Haftalik",
  monthly: "Oylik",
  adhoc: "Ad-hoc",
}
const SEV_LABEL = ["Kritik", "Yuqori", "O'rta", "Past"]
const SEV_KEYS = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const
const SEV_COLOR = ["#d4351c", "#d4791c", "#b8860b", "#1c6fd4"]

function d(x: Date): string {
  return x.toISOString().slice(0, 10)
}

const s = StyleSheet.create({
  page: { padding: 36, fontSize: 10, color: "#18181b", fontFamily: "Helvetica" },
  header: { borderBottom: "2 solid #18181b", paddingBottom: 8, marginBottom: 16 },
  brand: { fontSize: 16, fontWeight: 700 },
  sub: { fontSize: 9, color: "#71717a", marginTop: 2 },
  h2: { fontSize: 12, fontWeight: 700, marginTop: 16, marginBottom: 8 },
  row: { flexDirection: "row" },
  kpiBox: { flex: 1, border: "1 solid #e4e4e7", borderRadius: 4, padding: 8, marginRight: 6 },
  kpiNum: { fontSize: 18, fontWeight: 700 },
  kpiLbl: { fontSize: 8, color: "#71717a", marginTop: 2 },
  sevRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  sevDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  sevLbl: { width: 60 },
  bar: { height: 8, borderRadius: 2 },
  th: { flexDirection: "row", borderBottom: "1 solid #18181b", paddingBottom: 4, marginBottom: 4, fontWeight: 700, fontSize: 9 },
  td: { flexDirection: "row", paddingVertical: 3, borderBottom: "0.5 solid #e4e4e7", fontSize: 9 },
  cName: { flex: 3 },
  cHost: { flex: 2, color: "#71717a" },
  cNum: { flex: 1, textAlign: "right" },
  footer: { position: "absolute", bottom: 24, left: 36, right: 36, fontSize: 8, color: "#a1a1aa", textAlign: "center", borderTop: "0.5 solid #e4e4e7", paddingTop: 6 },
})

function ReportPdf({ data }: { data: ReportData }) {
  const sevMax = Math.max(1, ...SEV_KEYS.map((k) => data.severity[k]))
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Text style={s.brand}>e-Xabar — Kiberxavfsizlik hisoboti</Text>
          <Text style={s.sub}>
            {TYPE_LABEL[data.reportType] ?? data.reportType} · davr {d(data.periodStart)} — {d(data.periodEnd)} ·
            yaratildi {d(data.generatedAt)}
          </Text>
        </View>

        <View style={s.row}>
          <View style={s.kpiBox}>
            <Text style={s.kpiNum}>{data.totals.findings}</Text>
            <Text style={s.kpiLbl}>Faol topilma</Text>
          </View>
          <View style={s.kpiBox}>
            <Text style={[s.kpiNum, { color: "#d4351c" }]}>{data.totals.kevFindings}</Text>
            <Text style={s.kpiLbl}>KEV topilma</Text>
          </View>
          <View style={s.kpiBox}>
            <Text style={s.kpiNum}>{data.totals.assets}</Text>
            <Text style={s.kpiLbl}>Vositalar</Text>
          </View>
          <View style={[s.kpiBox, { marginRight: 0 }]}>
            <Text style={s.kpiNum}>{data.totals.vulnerabilities}</Text>
            <Text style={s.kpiLbl}>CVE bazasi</Text>
          </View>
        </View>

        <Text style={s.h2}>Jiddiylik bo&apos;yicha taqsimot</Text>
        {SEV_KEYS.map((k, i) => (
          <View key={k} style={s.sevRow}>
            <View style={[s.sevDot, { backgroundColor: SEV_COLOR[i] }]} />
            <Text style={s.sevLbl}>{SEV_LABEL[i]}</Text>
            <View style={{ flex: 1, marginRight: 8 }}>
              <View style={[s.bar, { backgroundColor: SEV_COLOR[i], width: `${(data.severity[k] / sevMax) * 100}%` }]} />
            </View>
            <Text style={{ width: 24, textAlign: "right" }}>{data.severity[k]}</Text>
          </View>
        ))}

        <Text style={s.h2}>Davr ko&apos;rsatkichlari</Text>
        <View style={s.row}>
          <View style={s.kpiBox}>
            <Text style={s.kpiNum}>{data.newFindingsInPeriod}</Text>
            <Text style={s.kpiLbl}>Yangi topilma (davr)</Text>
          </View>
          <View style={s.kpiBox}>
            <Text style={s.kpiNum}>{data.scans.completed}/{data.scans.total}</Text>
            <Text style={s.kpiLbl}>Skan (yakunlangan/jami)</Text>
          </View>
          <View style={[s.kpiBox, { marginRight: 0 }]}>
            <Text style={s.kpiNum}>{data.notifications.acknowledged}/{data.notifications.sent}</Text>
            <Text style={s.kpiLbl}>Xabar (tasdiq/yuborilgan)</Text>
          </View>
        </View>

        <Text style={s.h2}>Eng zaif vositalar (TOP {data.topAssets.length})</Text>
        <View style={s.th}>
          <Text style={s.cName}>Vosita</Text>
          <Text style={s.cHost}>Xost</Text>
          <Text style={s.cNum}>Kritik</Text>
          <Text style={s.cNum}>Jami</Text>
        </View>
        {data.topAssets.map((a, i) => (
          <View key={i} style={s.td}>
            <Text style={s.cName}>{a.name} {a.version}</Text>
            <Text style={s.cHost}>{a.hostname}</Text>
            <Text style={[s.cNum, { color: a.crit ? "#d4351c" : "#18181b" }]}>{a.crit}</Text>
            <Text style={s.cNum}>{a.count}</Text>
          </View>
        ))}
        {data.topAssets.length === 0 && <Text style={{ color: "#a1a1aa", marginTop: 6 }}>Topilma yo&apos;q.</Text>}

        <Text style={s.footer}>e-Xabar · avtomatik hisobot · maxfiy — faqat ichki foydalanish uchun</Text>
      </Page>
    </Document>
  )
}

export function renderReportPdf(data: ReportData): Promise<Buffer> {
  return renderToBuffer(<ReportPdf data={data} />)
}

import "server-only"
import { formatDistanceToNow } from "date-fns"
import { uz } from "date-fns/locale"
import { prisma } from "@/lib/db/prisma"
import { decrypt } from "@/lib/utils/crypto"

export const SETTING_KEYS = [
  "org_name",
  "language",
  "timezone",
  "session_minutes",
  "scan_frequency",
  "scan_time",
  "kev_priority",
  "auto_verify",
  "smtp_host",
  "smtp_port",
  "smtp_user",
  "smtp_from",
  "smtp_tls",
] as const

export type SettingsMap = Record<string, string>

const DEFAULTS: SettingsMap = {
  org_name: "Misol tashkiloti",
  language: "uz",
  timezone: "Asia/Tashkent",
  session_minutes: "30",
  scan_frequency: "weekly",
  scan_time: "sun_02",
  kev_priority: "true",
  auto_verify: "true",
  smtp_host: "smtp-relay.gmail.com",
  smtp_port: "587",
  smtp_user: "",
  smtp_from: "security@example.uz",
  smtp_tls: "true",
}

export async function getSettings(): Promise<SettingsMap> {
  const rows = await prisma.systemSetting.findMany({ where: { key: { in: [...SETTING_KEYS] } } })
  const map: SettingsMap = { ...DEFAULTS }
  for (const r of rows) {
    try {
      map[r.key] = decrypt(r.valueEncrypted)
    } catch {
      // shifrni ocholmasa — default qoladi
    }
  }
  // API kalitlari mavjudligini bayroq sifatida (qiymat oshkor qilinmaydi)
  const apiKeys = await prisma.systemSetting.findMany({
    where: { key: { in: ["nvd_api_key", "github_token"] } },
    select: { key: true },
  })
  map.has_nvd_key = apiKeys.some((k) => k.key === "nvd_api_key") ? "true" : "false"
  map.has_github_token = apiKeys.some((k) => k.key === "github_token") ? "true" : "false"
  return map
}

const SOURCES: [string, string][] = [
  ["NVD", "National Vulnerability Database"],
  ["OSV", "Open Source Vulnerabilities (Google)"],
  ["GHSA", "GitHub Security Advisories"],
  ["KEV", "CISA Known Exploited Vulnerabilities"],
  ["USN", "Ubuntu Security Notices"],
  ["DSA", "Debian Security Advisories"],
]

export interface IntegrationRow {
  src: string
  desc: string
  status: string
  lastChecked: string
}

export async function getIntegrations(): Promise<IntegrationRow[]> {
  const health = await prisma.integrationHealth.findMany()
  const bySrc = new Map(health.map((h) => [h.source, h]))
  return SOURCES.map(([src, desc]) => {
    const h = bySrc.get(src)
    return {
      src,
      desc,
      status: h?.status ?? "unknown",
      lastChecked: h?.lastCheckedAt
        ? formatDistanceToNow(h.lastCheckedAt, { addSuffix: true, locale: uz })
        : "—",
    }
  })
}

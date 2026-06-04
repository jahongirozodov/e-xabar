"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db/prisma"
import { requirePermission } from "@/lib/rbac/guard"
import { encrypt } from "@/lib/utils/crypto"
import { logAudit } from "@/lib/services/audit.service"
import { runIngestion } from "@/lib/services/ingestion.service"
import { localFeedAdapter } from "@/lib/adapters/local-feed.adapter"

export async function saveSettings(values: Record<string, string>): Promise<{ ok: boolean }> {
  await requirePermission("settings:manage")
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === "") continue
    await prisma.systemSetting.upsert({
      where: { key },
      update: { valueEncrypted: encrypt(value) },
      create: { key, valueEncrypted: encrypt(value) },
    })
  }
  await logAudit("UPDATE_SETTINGS", "settings", undefined, { keys: Object.keys(values) })
  revalidatePath("/admin/settings")
  return { ok: true }
}

// CVE manbalarini tekshirish/yangilash (offline LOCAL feed; tarmoq manbalari worker orqali).
export async function refreshIntegrations(): Promise<{ ok: boolean; upserted: number }> {
  await requirePermission("settings:manage")
  const res = await runIngestion([localFeedAdapter])
  const upserted = res.reduce((a, r) => a + r.upserted, 0)
  await logAudit("CHECK_INTEGRATIONS", "settings", undefined, { upserted })
  revalidatePath("/admin/settings")
  return { ok: true, upserted }
}

"use server"

import type { Prisma, AssetCategory } from "@prisma/client"
import { prisma } from "@/lib/db/prisma"
import { requirePermission } from "@/lib/rbac/guard"
import { logAudit } from "@/lib/services/audit.service"
import { importSchema, type ImportTool } from "@/lib/validations/import.schema"
import { extractVersion } from "@/lib/import/version"

export interface ImportResult {
  success: boolean
  totalItems: number
  objectsUpserted: number
  employeesUpserted: number
  assetsUpserted: number
  errors: { index: number; field: string; message: string }[]
}

// Vosita massivini (INFO yoki CYBERSEC) asset sifatida yozadi + mas'ulni owner qiladi.
async function processTools(
  tx: Prisma.TransactionClient,
  tools: ImportTool[] | null | undefined,
  category: AssetCategory,
  objectId: string,
  employeeId: string | null
): Promise<number> {
  if (!tools?.length) return 0
  let count = 0
  for (const tool of tools) {
    const toolName = tool.name
    // Obyekt ichida bir xil nomli vosita takror kelishi mumkin (mas. Nginx x2) → upsert bittaga yig'adi.
    const asset = await tx.asset.upsert({
      where: { name_objectId_category: { name: toolName, objectId, category } },
      update: {
        vendor: tool.manufacturer ?? null,
        toolType: tool.type ?? null,
        version: tool.version ?? extractVersion(toolName),
      },
      create: {
        name: toolName,
        vendor: tool.manufacturer ?? null,
        toolType: tool.type ?? null,
        version: tool.version ?? extractVersion(toolName),
        category,
        objectId,
      },
    })
    count++

    if (employeeId) {
      await tx.employeeAsset.upsert({
        where: { employeeId_assetId: { employeeId, assetId: asset.id } },
        update: { unassignedAt: null, role: "owner" },
        create: { employeeId, assetId: asset.id, role: "owner" },
      })
    }
  }
  return count
}

// Butun inventarni tozalaydi (toza import uchun) — FK tartibida.
async function wipeInventory(tx: Prisma.TransactionClient) {
  await tx.notificationFinding.deleteMany({})
  await tx.notification.deleteMany({})
  await tx.finding.deleteMany({})
  await tx.suppression.deleteMany({})
  await tx.employeeAsset.deleteMany({})
  await tx.assetAttribute.deleteMany({})
  await tx.asset.deleteMany({})
  await tx.monitoredObject.deleteMany({})
  await tx.organization.deleteMany({})
  await tx.employee.deleteMany({})
}

export async function importInventory(jsonData: unknown): Promise<ImportResult> {
  await requirePermission("assets:manage")

  const parsed = importSchema.safeParse(jsonData)
  if (!parsed.success) {
    return {
      success: false,
      totalItems: 0,
      objectsUpserted: 0,
      employeesUpserted: 0,
      assetsUpserted: 0,
      errors: parsed.error.issues.map((i) => ({
        index: typeof i.path[0] === "number" ? i.path[0] : 0,
        field: i.path.slice(1).join("."),
        message: i.message,
      })),
    }
  }

  const items = parsed.data
  let objectsUpserted = 0
  let employeesUpserted = 0
  let assetsUpserted = 0

  await prisma.$transaction(
    async (tx) => {
      // Toza import — eski inventar o'chiriladi.
      await wipeInventory(tx)

      // Org nomi bo'yicha kesh (takror upsert oldini olish).
      const orgCache = new Map<string, string>()

      for (const { stuff } of items) {
        // 1. Tashkilot (organizationName) — ixtiyoriy.
        let organizationId: string | null = null
        const orgName = stuff.organizationName?.trim()
        if (orgName) {
          const cached = orgCache.get(orgName)
          if (cached) {
            organizationId = cached
          } else {
            const org = await tx.organization.create({ data: { name: orgName } })
            organizationId = org.id
            orgCache.set(orgName, org.id)
          }
        }

        // 2. Mas'ul xodim (stuff) — email bo'lsa.
        const email = stuff.emails?.[0]?.trim()
        let employeeId: string | null = null
        if (email) {
          const employee = await tx.employee.upsert({
            where: { email },
            update: { fullName: stuff.fullName, department: orgName ?? null },
            create: { email, fullName: stuff.fullName, department: orgName ?? null },
          })
          employeeId = employee.id
          employeesUpserted++
        }

        // 3. Obyektlar (stuff.objects) — bir xodim ko'p obyektga mas'ul bo'lishi mumkin.
        for (const obj of stuff.objects ?? []) {
          const monitored = await tx.monitoredObject.create({
            data: { name: obj.name, organizationId, responsibleId: employeeId },
          })
          objectsUpserted++

          // 4. Vositalar — INFO (infotools) + CYBERSEC (cyberSecToolList).
          assetsUpserted += await processTools(tx, obj.infotools, "INFO", monitored.id, employeeId)
          assetsUpserted += await processTools(tx, obj.cyberSecToolList, "CYBERSEC", monitored.id, employeeId)
        }
      }
    },
    { timeout: 60000 }
  )

  await logAudit("IMPORT_INVENTORY", "inventory", undefined, {
    items: items.length,
    objectsUpserted,
    employeesUpserted,
    assetsUpserted,
  })

  return {
    success: true,
    totalItems: items.length,
    objectsUpserted,
    employeesUpserted,
    assetsUpserted,
    errors: [],
  }
}

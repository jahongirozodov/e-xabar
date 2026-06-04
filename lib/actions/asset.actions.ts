"use server"

import { revalidatePath } from "next/cache"
import { Prisma, type AssetCategory } from "@prisma/client"
import { prisma } from "@/lib/db/prisma"
import { requirePermission } from "@/lib/rbac/guard"
import { logAudit } from "@/lib/services/audit.service"
import { assetFormSchema, type AssetFormValues } from "@/lib/validations/asset.schema"

type ActionResult = { ok: true; id?: string } | { ok: false; error: string }

const DUP_MSG = "Shu nom, obyekt va kategoriya bilan vosita allaqachon mavjud."

function clean(v?: string): string | null {
  return v && v !== "none" ? v : null
}

async function assignOwner(
  tx: Prisma.TransactionClient,
  assetId: string,
  ownerId?: string
) {
  const id = clean(ownerId)
  if (!id) return
  await tx.employeeAsset.updateMany({
    where: { assetId, role: "owner" },
    data: { role: "user" },
  })
  await tx.employeeAsset.upsert({
    where: { employeeId_assetId: { employeeId: id, assetId } },
    update: { role: "owner", unassignedAt: null },
    create: { employeeId: id, assetId, role: "owner" },
  })
}

function buildData(v: AssetFormValues) {
  return {
    name: v.name,
    vendor: clean(v.vendor),
    version: clean(v.version),
    category: v.category as AssetCategory,
    toolType: clean(v.toolType),
    objectId: clean(v.objectId),
    purl: clean(v.purl),
    cpeUri: clean(v.cpe),
    description: clean(v.description),
  }
}

export async function createAsset(values: AssetFormValues): Promise<ActionResult> {
  await requirePermission("assets:manage")
  const parsed = assetFormSchema.safeParse(values)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Validatsiya xatosi" }
  }
  const v = parsed.data

  try {
    const id = await prisma.$transaction(async (tx) => {
      const asset = await tx.asset.create({ data: buildData(v) })
      await assignOwner(tx, asset.id, v.ownerId)
      return asset.id
    })
    await logAudit("CREATE_ASSET", "asset", id, { name: v.name, category: v.category })
    revalidatePath("/assets")
    return { ok: true, id }
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, error: DUP_MSG }
    }
    throw e
  }
}

export async function updateAsset(id: string, values: AssetFormValues): Promise<ActionResult> {
  await requirePermission("assets:manage")
  const parsed = assetFormSchema.safeParse(values)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Validatsiya xatosi" }
  }
  const v = parsed.data

  try {
    await prisma.$transaction(async (tx) => {
      await tx.asset.update({ where: { id }, data: buildData(v) })
      await assignOwner(tx, id, v.ownerId)
    })
    await logAudit("UPDATE_ASSET", "asset", id, { name: v.name, category: v.category })
    revalidatePath("/assets")
    return { ok: true, id }
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, error: DUP_MSG }
    }
    throw e
  }
}

export async function deleteAsset(id: string): Promise<ActionResult> {
  await requirePermission("assets:manage")
  try {
    await prisma.asset.delete({ where: { id } })
    await logAudit("DELETE_ASSET", "asset", id)
    revalidatePath("/assets")
    return { ok: true }
  } catch {
    return { ok: false, error: "O'chirib bo'lmadi." }
  }
}

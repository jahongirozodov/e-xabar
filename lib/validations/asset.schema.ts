import { z } from "zod"

// Vosita kategoriyasi — Kiberxavfsizlik / Axborotlashtirish
export const ASSET_CATEGORY = ["CYBERSEC", "INFO"] as const
export type AssetCategoryValue = (typeof ASSET_CATEGORY)[number]

export const ASSET_CATEGORY_LABEL_UZ: Record<AssetCategoryValue, string> = {
  CYBERSEC: "Kiberxavfsizlik vositasi",
  INFO: "Axborotlashtirish vositasi",
}

export const ASSET_CATEGORY_SHORT_UZ: Record<AssetCategoryValue, string> = {
  CYBERSEC: "Kiberxavfsizlik",
  INFO: "Axborotlashtirish",
}

// Kategoriya → CSS rang o'zgaruvchisi
export const ASSET_CATEGORY_VAR: Record<AssetCategoryValue, string> = {
  CYBERSEC: "var(--sev-c)",
  INFO: "var(--success)",
}

export const assetFormSchema = z.object({
  name: z.string().min(1, "Nomi majburiy"),
  vendor: z.string().optional(),
  category: z.enum(ASSET_CATEGORY),
  toolType: z.string().optional(),
  objectId: z.string().optional(),
  ownerId: z.string().optional(),
  version: z.string().optional(),
  purl: z.string().optional(),
  cpe: z.string().optional(),
  description: z.string().optional(),
})

export type AssetFormValues = z.infer<typeof assetFormSchema>

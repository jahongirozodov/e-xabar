import { z } from "zod"

export const SUPP_SCOPES = ["CVE", "CVE_ASSET", "CVE_VENDOR", "ASSET_ATTR", "GLOBAL"] as const
export const SUPP_DAYS = ["30", "60", "90", "180"] as const

export const SCOPE_META: Record<(typeof SUPP_SCOPES)[number], { label: string; icon: string }> = {
  CVE: { label: "CVE bo'yicha", icon: "bug" },
  CVE_ASSET: { label: "CVE + vosita", icon: "package" },
  CVE_VENDOR: { label: "CVE + ishlab chiqaruvchi", icon: "server" },
  ASSET_ATTR: { label: "Vosita atributi", icon: "filter" },
  GLOBAL: { label: "Global", icon: "shield" },
}

export const ATTR_OPTIONS: Record<string, string[]> = {
  environment: ["production", "staging", "dev"],
  criticality: ["high", "medium", "low"],
  internet_facing: ["true", "false"],
}

export const suppressionFormSchema = z
  .object({
    scope: z.enum(SUPP_SCOPES),
    cveId: z.string().optional(),
    vendor: z.string().optional(),
    assetRef: z.string().optional(),
    attrKey: z.string().optional(),
    attrVal: z.string().optional(),
    reason: z.string().min(1, "Sabab majburiy"),
    days: z.enum(SUPP_DAYS),
  })
  .refine((d) => !["CVE", "CVE_ASSET", "CVE_VENDOR"].includes(d.scope) || !!d.cveId?.trim(), {
    message: "CVE-ID majburiy",
    path: ["cveId"],
  })
  .refine((d) => d.scope !== "CVE_VENDOR" || !!d.vendor?.trim(), {
    message: "Ishlab chiqaruvchi majburiy",
    path: ["vendor"],
  })
  .refine((d) => d.scope !== "CVE_ASSET" || !!d.assetRef?.trim(), {
    message: "Vosita yoki xost majburiy",
    path: ["assetRef"],
  })
  .refine((d) => d.scope !== "ASSET_ATTR" || !!d.attrVal?.trim(), {
    message: "Atribut qiymati majburiy",
    path: ["attrVal"],
  })

export type SuppressionFormValues = z.infer<typeof suppressionFormSchema>

export function buildTarget(f: SuppressionFormValues): string {
  switch (f.scope) {
    case "CVE":
      return f.cveId?.trim() ?? ""
    case "CVE_ASSET":
      return `${f.cveId?.trim() ?? ""} · ${f.assetRef?.trim() ?? ""}`
    case "CVE_VENDOR":
      return `${f.cveId?.trim() ?? ""} · ${f.vendor?.trim() ?? ""}`
    case "ASSET_ATTR":
      return `${f.attrKey ?? "environment"} = ${f.attrVal ?? ""}`
    default:
      return "Barcha topilmalar"
  }
}

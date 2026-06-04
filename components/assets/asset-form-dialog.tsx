"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import type { AssetRow, EmployeeOption, ObjectOption } from "@/lib/actions/asset.queries"
import { createAsset, updateAsset } from "@/lib/actions/asset.actions"
import {
  assetFormSchema,
  type AssetFormValues,
  ASSET_CATEGORY,
  ASSET_CATEGORY_LABEL_UZ,
} from "@/lib/validations/asset.schema"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function blank(): AssetFormValues {
  return {
    name: "",
    vendor: "",
    category: "INFO",
    toolType: "",
    objectId: "none",
    ownerId: "",
    version: "",
    purl: "",
    cpe: "",
    description: "",
  }
}

function fromAsset(a: AssetRow): AssetFormValues {
  return {
    name: a.name,
    vendor: a.vendor ?? "",
    category: a.category,
    toolType: a.toolType ?? "",
    objectId: a.objectId ?? "none",
    ownerId: a.ownerId ?? "",
    version: a.version ?? "",
    purl: a.purl ?? "",
    cpe: a.cpeUri ?? "",
    description: "",
  }
}

export function AssetFormDialog({
  open,
  onOpenChange,
  mode,
  asset,
  employees,
  objects,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  mode: "create" | "edit"
  asset?: AssetRow | null
  employees: EmployeeOption[]
  objects: ObjectOption[]
}) {
  const router = useRouter()
  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: blank(),
  })

  React.useEffect(() => {
    if (open) {
      form.reset(mode === "edit" && asset ? fromAsset(asset) : blank())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, asset])

  async function onSubmit(values: AssetFormValues) {
    const res =
      mode === "edit" && asset
        ? await updateAsset(asset.id, values)
        : await createAsset(values)
    if (!res.ok) {
      toast.error(res.error)
      return
    }
    toast.success(mode === "edit" ? "Vosita yangilandi" : "Vosita qo'shildi", {
      description: values.name,
    })
    onOpenChange(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>{mode === "edit" ? "Vositani tahrirlash" : "Vosita qo'shish"}</DialogTitle>
          <DialogDescription>
            Nomi va kategoriya majburiy. Obyekt, ishlab chiqaruvchi va versiya ixtiyoriy.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="max-h-[60vh] space-y-4 overflow-y-auto px-6 py-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vosita nomi</FormLabel>
                      <FormControl>
                        <Input placeholder="PaloAlto 3220" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vendor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ishlab chiqaruvchi</FormLabel>
                      <FormControl>
                        <Input placeholder="Palo Alto Networks" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategoriya</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ASSET_CATEGORY.map((c) => (
                            <SelectItem key={c} value={c}>
                              {ASSET_CATEGORY_LABEL_UZ[c]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="toolType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Turi</FormLabel>
                      <FormControl>
                        <Input placeholder="Tarmoqlararo ekran (Firewall)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="objectId"
                  render={({ field }) => (
                    <FormItem className="min-w-0">
                      <FormLabel>Obyekt</FormLabel>
                      <Select value={field.value || "none"} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full min-w-0">
                            <SelectValue placeholder="— tanlanmagan —" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">— tanlanmagan —</SelectItem>
                          {objects.map((o) => (
                            <SelectItem key={o.id} value={o.id}>
                              {o.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="version"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Versiya (ixtiyoriy)</FormLabel>
                      <FormControl>
                        <Input placeholder="10.2.16" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="ownerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mas&apos;ul xodim</FormLabel>
                    <Select value={field.value || "none"} onValueChange={(v) => field.onChange(v === "none" ? "" : v)}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="— tanlanmagan —" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">— tanlanmagan —</SelectItem>
                        {employees.map((e) => (
                          <SelectItem key={e.id} value={e.id}>
                            {e.fullName}
                            {e.department ? ` · ${e.department}` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="border-t pt-3 text-sm font-medium text-muted-foreground">
                Identifikatorlar (ixtiyoriy)
              </div>
              <FormField
                control={form.control}
                name="purl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PURL</FormLabel>
                    <FormControl>
                      <Input placeholder="pkg:deb/ubuntu/openssl@1.1.1f" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cpe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPE</FormLabel>
                    <FormControl>
                      <Input placeholder="cpe:2.3:a:openssl:openssl:1.1.1f:*:*:*:*:*:*:*" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="border-t px-6 py-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Bekor qilish
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Saqlash
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

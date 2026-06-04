"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Eye, AlertTriangle } from "lucide-react"
import { createSuppression } from "@/lib/actions/suppression.actions"
import {
  suppressionFormSchema,
  type SuppressionFormValues,
  SUPP_SCOPES,
  SUPP_DAYS,
  SCOPE_META,
  ATTR_OPTIONS,
  buildTarget,
} from "@/lib/validations/suppression.schema"
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
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function SuppressionFormDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const router = useRouter()
  const form = useForm<SuppressionFormValues>({
    resolver: zodResolver(suppressionFormSchema),
    defaultValues: {
      scope: "CVE",
      cveId: "",
      vendor: "",
      assetRef: "",
      attrKey: "environment",
      attrVal: "production",
      reason: "",
      days: "90",
    },
  })

  React.useEffect(() => {
    if (open) form.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const values = form.watch()
  const scope = values.scope
  const needsCve = scope === "CVE" || scope === "CVE_ASSET" || scope === "CVE_VENDOR"

  async function onSubmit(v: SuppressionFormValues) {
    const res = await createSuppression(v)
    if (!res.ok) {
      toast.error(res.error)
      return
    }
    toast.success("Qoida qo'shildi", { description: buildTarget(v) })
    onOpenChange(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Bostirish qoidasi qo&apos;shish</DialogTitle>
          <DialogDescription>
            Qoida muddati majburiy. Muddat tugagach topilmalar qayta faollashadi.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="max-h-[60vh] space-y-4 overflow-y-auto px-6 py-4">
              <FormField
                control={form.control}
                name="scope"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Qamrov</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SUPP_SCOPES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {SCOPE_META[s].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {needsCve && (
                <FormField
                  control={form.control}
                  name="cveId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CVE-ID</FormLabel>
                      <FormControl>
                        <Input placeholder="CVE-2023-29491" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {scope === "CVE_ASSET" && (
                <FormField
                  control={form.control}
                  name="assetRef"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vosita yoki xost</FormLabel>
                      <FormControl>
                        <Input placeholder="OpenSSL yoki WS-IT-042" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {scope === "CVE_VENDOR" && (
                <FormField
                  control={form.control}
                  name="vendor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ishlab chiqaruvchi</FormLabel>
                      <FormControl>
                        <Input placeholder="OpenSSL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {scope === "ASSET_ATTR" && (
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="attrKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Atribut</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(v) => {
                            field.onChange(v)
                            form.setValue("attrVal", ATTR_OPTIONS[v]?.[0] ?? "")
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.keys(ATTR_OPTIONS).map((k) => (
                              <SelectItem key={k} value={k}>
                                {k}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="attrVal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Qiymat</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(ATTR_OPTIONS[values.attrKey ?? "environment"] ?? []).map((v) => (
                              <SelectItem key={v} value={v}>
                                {v}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              )}
              {scope === "GLOBAL" && (
                <div
                  className="flex items-start gap-2 rounded-md border p-3 text-xs"
                  style={{ color: "var(--sev-h)", borderColor: "color-mix(in oklab, var(--sev-h) 28%, transparent)", background: "color-mix(in oklab, var(--sev-h) 12%, transparent)" }}
                >
                  <AlertTriangle className="size-4 shrink-0" />
                  <span>
                    Bu qoida tizimdagi <b>barcha</b> mos topilmalarga ta&apos;sir qiladi. Ehtiyot bo&apos;ling.
                  </span>
                </div>
              )}

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sabab</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Nima uchun bostirilmoqda..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amal qilish muddati</FormLabel>
                    <div className="flex gap-1 rounded-md border p-0.5">
                      {SUPP_DAYS.map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => field.onChange(d)}
                          className={cn(
                            "flex-1 rounded px-2 py-1 text-sm transition-colors",
                            field.value === d ? "bg-secondary font-medium" : "text-muted-foreground hover:bg-accent"
                          )}
                        >
                          {d} kun
                        </button>
                      ))}
                    </div>
                  </FormItem>
                )}
              />

              <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Eye className="size-3.5" /> Ko&apos;rinish
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-muted-foreground">Qamrov</span>
                  <span className="font-medium">{SCOPE_META[scope].label}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-muted-foreground">Nishon</span>
                  <span className="font-mono text-xs">{buildTarget(values) || "—"}</span>
                </div>
              </div>
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

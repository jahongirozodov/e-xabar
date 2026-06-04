"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Check } from "lucide-react"
import type { RoleName } from "@prisma/client"
import type { UserRow } from "@/lib/actions/user.queries"
import { createUser, updateUser } from "@/lib/actions/user.actions"
import { userFormSchema, type UserFormValues, ROLE_NAMES } from "@/lib/validations/user.schema"
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
import { cn } from "@/lib/utils"
import { RoleBadge } from "./role-badge"

export function UserFormDialog({
  open,
  onOpenChange,
  mode,
  user,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  mode: "create" | "edit"
  user?: UserRow | null
}) {
  const router = useRouter()
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: { fullName: "", email: "", roles: ["SPECIALIST"] },
  })

  React.useEffect(() => {
    if (open) {
      form.reset(
        mode === "edit" && user
          ? { fullName: user.name, email: user.email, roles: user.roles }
          : { fullName: "", email: "", roles: ["SPECIALIST"] }
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, user])

  async function onSubmit(values: UserFormValues) {
    const res = mode === "edit" && user ? await updateUser(user.id, values) : await createUser(values)
    if (!res.ok) {
      toast.error(res.error)
      return
    }
    toast.success(mode === "edit" ? "Foydalanuvchi yangilandi" : "Foydalanuvchi qo'shildi", {
      description: values.fullName,
    })
    onOpenChange(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Foydalanuvchini tahrirlash" : "Foydalanuvchi qo'shish"}</DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Ism va rollarni o'zgartiring."
              : "Yangi foydalanuvchiga rol(lar) tayinlang. Boshlang'ich parol: Parol@12345"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To&apos;liq ism</FormLabel>
                    <FormControl>
                      <Input placeholder="Ism Familiya" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="ism@example.uz" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="roles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rollar</FormLabel>
                  <div className="flex flex-col gap-1.5">
                    {ROLE_NAMES.map((r) => {
                      const active = field.value.includes(r)
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() =>
                            field.onChange(
                              active ? field.value.filter((x) => x !== r) : [...field.value, r]
                            )
                          }
                          className={cn(
                            "flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors hover:bg-accent",
                            active && "border-primary"
                          )}
                        >
                          <span className="grid size-4 place-items-center">
                            {active && <Check className="size-3.5" />}
                          </span>
                          <RoleBadge role={r as RoleName} />
                        </button>
                      )
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
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

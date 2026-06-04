import { z } from "zod"

export const ROLE_NAMES = ["ADMIN", "SPECIALIST", "SECTION_HEAD", "DEPARTMENT_HEAD"] as const

export const userFormSchema = z.object({
  fullName: z.string().min(1, "Ism majburiy"),
  email: z.string().email("Email formati noto'g'ri"),
  roles: z.array(z.enum(ROLE_NAMES)).min(1, "Kamida bitta rol tanlang"),
})

export type UserFormValues = z.infer<typeof userFormSchema>

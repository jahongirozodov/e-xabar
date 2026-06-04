import { z } from "zod"

// Import format v3 — XODIM-markazli (grouped by stuff).
// Massiv element = { stuff: { fullName, organizationName?, emails[], objects[] } }.
// Har xodim → N obyekt. Har obyekt → name + infotools[] (INFO) + cyberSecToolList[] (CYBERSEC).
// Vosita = { name (string), version?, manufacturer?, type? }.

const toolItemSchema = z
  .object({
    name: z.string().min(1, "Vosita nomi majburiy"),
    version: z.string().nullish(),
    manufacturer: z.string().nullish(),
    type: z.string().nullish(),
  })
  .passthrough()

const objectSchema = z
  .object({
    name: z.string().min(1, "Obyekt nomi majburiy"),
    infotools: z.array(toolItemSchema).nullish(),
    cyberSecToolList: z.array(toolItemSchema).nullish(),
  })
  .passthrough()

const stuffSchema = z
  .object({
    fullName: z.string().min(1, "Mas'ul F.I.Sh. majburiy"),
    organizationName: z.string().nullish(),
    emails: z.array(z.string()).nullish(),
    objects: z.array(objectSchema).nullish(),
  })
  .passthrough()

export const importEmployeeSchema = z
  .object({
    stuff: stuffSchema,
  })
  .passthrough()

export const importSchema = z.array(importEmployeeSchema)

export type ImportEmployee = z.infer<typeof importEmployeeSchema>
export type ImportObject = z.infer<typeof objectSchema>
export type ImportTool = z.infer<typeof toolItemSchema>

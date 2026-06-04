"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Upload } from "lucide-react"
import { importInventory, type ImportResult } from "@/lib/actions/import.actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

const SAMPLE = JSON.stringify(
  [
    {
      stuff: {
        fullName: "Ivan Ivanov Ivanovich",
        organizationName: "Uztelecom",
        emails: ["ivan@gmail.uz"],
        objects: [
          {
            name: "Uztelecomning ichki boshqaruv axborot tizimi",
            infotools: [
              { name: "Nginx", version: "1.25.3", manufacturer: "F5 Networks", type: "Veb-server" },
            ],
            cyberSecToolList: [
              { name: "Splunk Enterprise", version: "9.1.2", manufacturer: "Splunk", type: "SIEM" },
            ],
          },
          {
            name: "Soliq qo'mitasi hujjat aylanish tizimi",
            infotools: [
              { name: "Ubuntu Server", version: "20.04", manufacturer: "Canonical", type: "Operatsion tizim" },
            ],
            cyberSecToolList: [
              { name: "PaloAlto 3220", version: "v11.0.2", manufacturer: "Palo Alto Networks", type: "Tarmoqlararo ekran (Firewall)" },
            ],
          },
        ],
      },
    },
  ],
  null,
  2
)

export function ImportDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const router = useRouter()
  const [text, setText] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const [result, setResult] = React.useState<ImportResult | null>(null)

  React.useEffect(() => {
    if (open) {
      setText("")
      setResult(null)
    }
  }, [open])

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setText(await file.text())
  }

  async function onImport() {
    setResult(null)
    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch {
      toast.error("JSON formati noto'g'ri")
      return
    }
    setBusy(true)
    try {
      const res = await importInventory(parsed)
      setResult(res)
      if (res.success) {
        toast.success("Import yakunlandi", {
          description: `${res.objectsUpserted} obyekt · ${res.assetsUpserted} vosita`,
        })
        router.refresh()
      } else {
        toast.error(`${res.errors.length} ta xato`)
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>JSON import</DialogTitle>
          <DialogDescription>
            Xodim formatida JSON joylashtiring yoki fayl yuklang (stuff · organizationName ·
            objects · infotools · cyberSecToolList). Eslatma: import butun eski inventarni
            almashtiradi.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <label className="cursor-pointer">
                <Upload className="size-4" /> Fayl yuklash
                <input type="file" accept=".json,application/json" className="hidden" onChange={onFile} />
              </label>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setText(SAMPLE)}>
              Namuna
            </Button>
          </div>

          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='[{ "stuff": { "fullName": "...", "organizationName": "...", "emails": [...], "objects": [{ "name": "...", "infotools": [...], "cyberSecToolList": [...] }] } }]'
            className="h-56 font-mono text-xs"
          />

          {result && !result.success && (
            <div className="max-h-40 overflow-y-auto rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-xs">
              <div className="mb-1 font-medium text-destructive">{result.errors.length} ta xato:</div>
              {result.errors.map((er, i) => (
                <div key={i} className="text-muted-foreground">
                  #{er.index} {er.field && <span className="font-mono">{er.field}</span>} — {er.message}
                </div>
              ))}
            </div>
          )}

          {result && result.success && (
            <div className="rounded-lg border border-[color-mix(in_oklab,var(--success)_30%,transparent)] bg-[color-mix(in_oklab,var(--success)_10%,transparent)] p-3 text-sm">
              {result.employeesUpserted} mas&apos;ul · {result.objectsUpserted} obyekt ·{" "}
              {result.assetsUpserted} vosita import qilindi.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Yopish
          </Button>
          <Button onClick={onImport} disabled={busy || !text.trim()}>
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

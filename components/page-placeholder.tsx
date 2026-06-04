import { Card, CardContent } from "@/components/ui/card"
import { Inbox } from "lucide-react"

export function PagePlaceholder({ title }: { title?: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
        <div className="grid size-11 place-items-center rounded-lg bg-muted">
          <Inbox className="size-5" />
        </div>
        <div className="font-semibold text-foreground">{title ?? "Tez orada"}</div>
        <div className="text-sm">Bu bo&apos;lim keyingi bosqichda tayyorlanadi.</div>
      </CardContent>
    </Card>
  )
}

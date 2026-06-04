import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

function page(title: string, body: string, ok: boolean) {
  return `<!doctype html><html lang="uz"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="font-family:Arial,Helvetica,sans-serif;background:#f4f4f5;margin:0;padding:48px 16px;text-align:center;color:#18181b">
<div style="max-width:480px;margin:0 auto;background:#fff;border:1px solid #e4e4e7;border-radius:12px;padding:32px">
<div style="font-size:40px">${ok ? "✅" : "⚠️"}</div>
<h1 style="font-size:20px;margin:12px 0 8px">${title}</h1>
<p style="color:#52525b;font-size:14px;line-height:1.6;margin:0">${body}</p>
<p style="color:#a1a1aa;font-size:12px;margin-top:24px">e-Xabar · Kiberxavfsizlik markazi</p>
</div></body></html>`
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const notif = await prisma.notification.findUnique({ where: { ackToken: token } })

  if (!notif) {
    return new NextResponse(page("Topilmadi", "Bu havola yaroqsiz yoki muddati o'tgan.", false), {
      status: 404,
      headers: { "content-type": "text/html; charset=utf-8" },
    })
  }

  if (!notif.acknowledgedAt) {
    await prisma.notification.update({
      where: { id: notif.id },
      data: { acknowledgedAt: new Date() },
    })
  }

  return new NextResponse(
    page(
      "Tasdiqlandi",
      "Ogohlantirishni ko'rib chiqqaningiz uchun rahmat. Iltimos, zaifliklarni imkon qadar tezroq bartaraf eting.",
      true
    ),
    { headers: { "content-type": "text/html; charset=utf-8" } }
  )
}

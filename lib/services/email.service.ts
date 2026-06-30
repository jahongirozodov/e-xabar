// NOT server-only — action'lar, worker'lar va notification pipeline ishlatadi.
import { writeFileSync, unlinkSync } from "fs"
import { join } from "path"
import { tmpdir } from "os"
import nodemailer, { type Transporter } from "nodemailer"
import { render } from "@react-email/components"
import { VulnerabilityAlert, type AlertFinding } from "@/emails/vulnerability-alert"
import { buildNotificationExcel } from "@/lib/reports/notification-excel"
import { logger } from "@/lib/utils/logger"

export interface SendAlertInput {
  to: string
  employeeName: string
  subject: string
  findings: AlertFinding[]
  ackUrl: string
  deadlineDays: number
}

export interface SendResult {
  sent: boolean
  error?: string
  html?: string
}

let cached: Transporter | null = null

function getTransport(): Transporter | null {
  if (cached) return cached
  const host = process.env.SMTP_HOST
  if (!host) return null
  const port = Number(process.env.SMTP_PORT ?? 587)
  cached = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD ?? "" }
      : undefined,
    tls: { rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== "false" },
  })
  return cached
}

// Zaiflik ogohlantirishini SMTP orqali yuboradi. SMTP sozlanmagan bo'lsa —
// simulyatsiya (yuborilmadi, lekin pipeline buzilmaydi).
export async function sendAlertEmail(input: SendAlertInput): Promise<SendResult> {
  const html = await render(
    VulnerabilityAlert({
      employeeName: input.employeeName,
      findings: input.findings,
      ackUrl: input.ackUrl,
      deadlineDays: input.deadlineDays,
    })
  )

  const transport = getTransport()
  if (!transport) {
    logger.warn({ to: input.to }, "SMTP sozlanmagan — email simulyatsiya qilindi")
    return { sent: false, error: "SMTP_NOT_CONFIGURED", html }
  }

  let tmpPath: string | null = null
  try {
    const date = new Date().toISOString().slice(0, 10)
    const safeName = input.employeeName.replace(/\s+/g, "-")
    let attachments: nodemailer.SendMailOptions["attachments"] = []
    try {
      const excelBuf = await buildNotificationExcel(input.employeeName, input.findings)
      const fname = `zaifliklar-${safeName}-${date}.xlsx`
      tmpPath = join(tmpdir(), fname)
      writeFileSync(tmpPath, excelBuf)
      attachments = [
        {
          filename: fname,
          path: tmpPath,
          contentType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      ]
    } catch (excelErr) {
      logger.warn({ err: excelErr }, "Excel biriktirma yaratilmadi — emailsiz yuboriladi")
    }

    await transport.sendMail({
      from: process.env.SMTP_FROM ?? "security@example.uz",
      to: input.to,
      subject: input.subject,
      html,
      attachments,
    })
    if (tmpPath) try { unlinkSync(tmpPath) } catch { /* ignore */ }
    logger.info({ to: input.to }, "Ogohlantirish emaili yuborildi")
    return { sent: true, html }
  } catch (e) {
    if (tmpPath) try { unlinkSync(tmpPath) } catch { /* ignore */ }
    const error = e instanceof Error ? e.message : String(e)
    logger.error({ to: input.to, error }, "Email yuborishda xato")
    return { sent: false, error, html }
  }
}

// Tayyor HTML'ni xom holda yuboradi (xabarnomani qayta yuborish uchun).
export async function sendRawEmail(input: {
  to: string
  subject: string
  html: string
}): Promise<SendResult> {
  const transport = getTransport()
  if (!transport) {
    logger.warn({ to: input.to }, "SMTP sozlanmagan — qayta yuborish simulyatsiya qilindi")
    return { sent: false, error: "SMTP_NOT_CONFIGURED" }
  }
  try {
    await transport.sendMail({
      from: process.env.SMTP_FROM ?? "security@example.uz",
      to: input.to,
      subject: input.subject,
      html: input.html,
    })
    logger.info({ to: input.to }, "Xabarnoma qayta yuborildi")
    return { sent: true }
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e)
    logger.error({ to: input.to, error }, "Qayta yuborishda xato")
    return { sent: false, error }
  }
}

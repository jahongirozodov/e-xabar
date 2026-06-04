import "dotenv/config"
import { prisma } from "@/lib/db/prisma"
import { runVerification } from "@/lib/services/verification.service"

// Foydalanish: npm run verify [kunlar]   (default: 7)
// Muddati o'tgan topilmalarni qayta tekshiradi (offline ishlaydi).
const days = Number(process.argv[2] ?? "7")

async function main() {
  console.log(`Verification — chegara ${days} kun`)
  const r = await runVerification(days)
  console.log(
    `  tekshirildi=${r.checked} · hali_zaif=${r.stillVulnerable} · hal_qilingan=${r.resolved} · eskalatsiya=${r.escalated}`
  )
  await prisma.$disconnect()
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

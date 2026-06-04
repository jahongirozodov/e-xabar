// Bir martalik: matching logikasi o'zgargani (stopword + vendor qat'iy filtri) uchun
// BARCHA eskirgan findinglarni tozalab, to'liq qayta hisoblaydi.
// NotificationFinding onDelete:Cascade → finding o'chirilsa avtomatik tozalanadi.
// Ishga tushirish: npx tsx scripts/rematch.ts
import { prisma } from "@/lib/db/prisma"
import { runMatching } from "@/lib/services/matching.service"

async function main() {
  const del = await prisma.finding.deleteMany({})
  console.log(`deleted findings: ${del.count}`)

  const res = await runMatching()
  console.log("rematch:", res)

  await prisma.$disconnect()
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})

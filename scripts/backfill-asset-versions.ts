// Bir martalik: version=null assetlarni nomdan ajratilgan versiya bilan to'ldiradi
// + Cisco Catalyst/SD-WAN assetlarining noto'g'ri vendorini (Uzinfocom/bo'sh) "Cisco" ga to'g'irlaydi.
// Ishga tushirish: npx tsx scripts/backfill-asset-versions.ts
import { prisma } from "@/lib/db/prisma"
import { extractVersion } from "@/lib/import/version"

async function main() {
  // 1) Versiya backfill
  const nulls = await prisma.asset.findMany({
    where: { version: null },
    select: { id: true, name: true },
  })
  let filled = 0
  for (const a of nulls) {
    const v = extractVersion(a.name)
    if (v) {
      await prisma.asset.update({ where: { id: a.id }, data: { version: v } })
      filled++
      console.log(`version: ${a.name} -> ${v}`)
    }
  }

  // 2) Cisco Catalyst / SD-WAN vendorini to'g'irlash
  const cisco = await prisma.asset.findMany({
    where: {
      OR: [
        { name: { contains: "catalyst", mode: "insensitive" } },
        { name: { contains: "sd-wan", mode: "insensitive" } },
        { name: { contains: "sd_wan", mode: "insensitive" } },
      ],
    },
    select: { id: true, name: true, vendor: true },
  })
  let vfix = 0
  for (const a of cisco) {
    if (!a.vendor || /uzinfocom/i.test(a.vendor)) {
      await prisma.asset.update({ where: { id: a.id }, data: { vendor: "Cisco" } })
      vfix++
      console.log(`vendor: ${a.name} -> Cisco (was ${a.vendor ?? "null"})`)
    }
  }

  console.log(`DONE filled=${filled} vendorFixed=${vfix}`)
  await prisma.$disconnect()
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})

import { PrismaClient, RoleName } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // ---- Rollar (foydalanuvchilar uchun shart) ----
  for (const name of Object.values(RoleName)) {
    await prisma.role.upsert({ where: { name }, update: {}, create: { name } })
  }
  const roleByName = Object.fromEntries(
    (await prisma.role.findMany()).map((r) => [r.name, r.id])
  ) as Record<RoleName, number>

  // ---- Foydalanuvchilar ----
  const passwordHash = await bcrypt.hash("Admin@12345", 12)
  const users: { email: string; fullName: string; roles: RoleName[] }[] = [
    { email: "admin@example.uz", fullName: "Tizim administratori", roles: ["ADMIN", "SPECIALIST"] },
    { email: "specialist@example.uz", fullName: "Olimov Sardor", roles: ["SPECIALIST"] },
    { email: "boshliq@example.uz", fullName: "Rahimova Nilufar", roles: ["SECTION_HEAD"] },
  ]
  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { fullName: u.fullName },
      create: {
        email: u.email,
        fullName: u.fullName,
        passwordHash,
        roles: { create: u.roles.map((r) => ({ roleId: roleByName[r] })) },
      },
    })
  }

  const counts = {
    roles: await prisma.role.count(),
    users: await prisma.user.count(),
  }
  console.log("Seed tugadi:", counts)
  console.log("Admin: admin@example.uz / Admin@12345")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

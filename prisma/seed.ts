import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.role.createMany({
    data: [
      { name: 'instructor', description: 'Full access' },
      { name: 'student', description: 'Regular user' },
    ],
    skipDuplicates: true,
  })

  await prisma.user.create({
    data: {
      username: 'admin',
      password: 'password',
      role: { connect: { id: 1 } },
    },
  })
}

main()
  .then(() => {
    console.log('✅ Seeding complete')
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

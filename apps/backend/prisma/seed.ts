import { PrismaClient } from '../src/prisma/generated/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding roles...');
  
  await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN' },
  });

  await prisma.role.upsert({
    where: { name: 'SELLER' },
    update: {},
    create: { name: 'SELLER' },
  });

  await prisma.role.upsert({
    where: { name: 'BUYER' },
    update: {},
    create: { name: 'BUYER' },
  });
  
  console.log('✅ Roles seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

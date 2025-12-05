const prisma = require('../src/prisma');

async function main() {
  await prisma.$transaction([
    prisma.order.deleteMany(),
    prisma.training.deleteMany(),
  ]);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });

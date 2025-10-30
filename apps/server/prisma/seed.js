const { PrismaClient, Prisma } = require('@prisma/client');

const prisma = new PrismaClient();

const products = [
  {
    name: 'Artisan Olive Oil',
    sku: 'SKU-OLIVE-001',
    description: 'Cold pressed extra virgin olive oil from small batch producers.',
    price: new Prisma.Decimal('19.99'),
  },
  {
    name: 'Single Origin Coffee Beans',
    sku: 'SKU-COFFEE-002',
    description: 'Medium roast beans sourced from a single Colombian estate.',
    price: new Prisma.Decimal('14.50'),
  },
  {
    name: 'Ceramic Pour Over Set',
    sku: 'SKU-POUROVER-003',
    description: 'Handmade ceramic pour over coffee brewer with matching mug.',
    price: new Prisma.Decimal('39.00'),
  },
  {
    name: 'Organic Matcha Powder',
    sku: 'SKU-MATCHA-004',
    description: 'Stone-ground ceremonial grade matcha from Uji, Japan.',
    price: new Prisma.Decimal('24.75'),
  }
];

async function main() {
  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
      },
      create: product,
    });
  }
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

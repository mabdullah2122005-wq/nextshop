// Seeds an admin account, categories and demo products.
// Run with: npm run db:seed
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  { name: "Apparel", slug: "apparel" },
  { name: "Accessories", slug: "accessories" },
  { name: "Home", slug: "home" },
];

const products = [
  { name: "Classic Cotton Tee", category: "apparel", priceCents: 2500, stock: 120, featured: true, description: "A soft, breathable 100% organic cotton t-shirt with a relaxed fit." },
  { name: "Everyday Hoodie", category: "apparel", priceCents: 5900, stock: 60, featured: true, description: "Midweight fleece hoodie with a brushed interior and kangaroo pocket." },
  { name: "Canvas Chore Jacket", category: "apparel", priceCents: 11900, stock: 25, description: "Durable cotton canvas jacket with four utility pockets." },
  { name: "Leather Card Wallet", category: "accessories", priceCents: 3900, stock: 80, featured: true, description: "Slim full-grain leather wallet that holds up to six cards." },
  { name: "Wool Beanie", category: "accessories", priceCents: 2200, stock: 90, description: "Ribbed merino wool beanie, warm without the itch." },
  { name: "Everyday Tote", category: "accessories", priceCents: 3400, stock: 45, description: "Heavy canvas tote with an inner zip pocket." },
  { name: "Ceramic Pour-Over Set", category: "home", priceCents: 4800, stock: 30, featured: true, description: "Hand-glazed ceramic dripper and carafe for slow mornings." },
  { name: "Linen Throw Blanket", category: "home", priceCents: 8900, stock: 20, description: "Stonewashed linen throw that gets softer with every wash." },
];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin12345";

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN" },
    create: {
      email: adminEmail,
      name: "Store Admin",
      role: "ADMIN",
      passwordHash: await bcrypt.hash(adminPassword, 12),
    },
  });

  for (const c of categories) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }

  for (const p of products) {
    const slug = slugify(p.name);
    const category = await prisma.category.findUniqueOrThrow({ where: { slug: p.category } });
    await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        name: p.name,
        slug,
        description: p.description,
        priceCents: p.priceCents,
        stock: p.stock,
        featured: p.featured ?? false,
        imageUrl: `https://picsum.photos/seed/${slug}/800/800`,
        categoryId: category.id,
      },
    });
  }

  console.log(`Seeded. Admin login: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

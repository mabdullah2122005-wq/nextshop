// Seeds an admin account, categories, demo products, sample reviews and a coupon.
// Safe to re-run: everything is upserted. Run with: npm run db:seed
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const img = (id: string) => `https://images.unsplash.com/${id}?w=1000&q=80&auto=format&fit=crop`;

const categories = [
  { name: "Apparel", slug: "apparel", imageUrl: img("photo-1489987707025-afc232f7ea0f") },
  { name: "Accessories", slug: "accessories", imageUrl: img("photo-1553062407-98eeb64c6a62") },
  { name: "Home", slug: "home", imageUrl: img("photo-1513694203232-719a280e022f") },
];

const products = [
  { slug: "classic-cotton-tee", name: "Classic Cotton Tee", category: "apparel", priceCents: 2500, stock: 120, featured: true, image: "photo-1521572163474-6864f9cf17ab",
    description: "A soft, breathable 100% organic cotton t-shirt with a relaxed fit. Pre-washed so it keeps its shape, wash after wash." },
  { slug: "everyday-hoodie", name: "Everyday Hoodie", category: "apparel", priceCents: 5900, compareAtCents: 7500, stock: 60, featured: true, image: "photo-1556821840-3a63f95609a7",
    description: "Midweight fleece hoodie with a brushed interior, double-lined hood and kangaroo pocket. Your new favourite layer." },
  { slug: "rust-bomber-jacket", name: "Rust Bomber Jacket", category: "apparel", priceCents: 11900, stock: 25, featured: true, image: "photo-1591047139829-d91aecb6caea",
    description: "Lightweight bomber in a warm rust tone with ribbed cuffs, a two-way zip and a satin-smooth lining." },
  { slug: "chambray-button-shirt", name: "Chambray Button Shirt", category: "apparel", priceCents: 6400, stock: 40, image: "photo-1596755094514-f87e34085b2c",
    description: "Washed chambray shirt with a subtle print, mother-of-pearl buttons and a tailored-but-easy fit." },
  { slug: "leather-bifold-wallet", name: "Leather Bifold Wallet", category: "accessories", priceCents: 3900, stock: 80, featured: true, image: "photo-1627123424574-724758594e93",
    description: "Full-grain vegetable-tanned leather that develops a rich patina over time. Six card slots and a cash sleeve." },
  { slug: "minimal-smart-watch", name: "Minimal Smart Watch", category: "accessories", priceCents: 14900, compareAtCents: 17900, stock: 18, featured: true, image: "photo-1523275335684-37898b6baf30",
    description: "Clean, round-face smartwatch with heart-rate tracking, 7-day battery and a soft silicone strap." },
  { slug: "commuter-backpack", name: "Commuter Backpack", category: "accessories", priceCents: 8900, stock: 35, image: "photo-1553062407-98eeb64c6a62",
    description: "Water-resistant 20L backpack with a padded 16\" laptop sleeve, hidden back pocket and luggage strap." },
  { slug: "everyday-cap", name: "Everyday Cap", category: "accessories", priceCents: 2200, stock: 4, image: "photo-1588850561407-ed78c282e89b",
    description: "Structured six-panel cap with a breathable mesh back and an adjustable snap closure." },
  { slug: "stoneware-mug", name: "Stoneware Mug", category: "home", priceCents: 1800, stock: 150, image: "photo-1514228742587-6b1558fcca3d",
    description: "Hand-glazed 12oz stoneware mug. Dishwasher and microwave safe, and perfectly weighted in the hand." },
  { slug: "potted-succulent", name: "Potted Succulent", category: "home", priceCents: 2400, stock: 50, featured: true, image: "photo-1485955900006-10f4d324d411",
    description: "A low-maintenance aloe-style succulent in a matte mint ceramic pot. Thrives on a sunny windowsill." },
  { slug: "soy-wax-candle", name: "Soy Wax Candle", category: "home", priceCents: 3200, compareAtCents: 3800, stock: 70, featured: true, image: "photo-1602874801007-bd458bb1b8b6",
    description: "Hand-poured soy wax candle with notes of amber and cedar. 45-hour burn time, cotton wick." },
  { slug: "arc-floor-lamp", name: "Arc Floor Lamp", category: "home", priceCents: 12900, stock: 12, image: "photo-1507473885765-e6ed057f782c",
    description: "Matte charcoal floor lamp with an adjustable dome shade. Warm, directional light for reading corners." },
  { slug: "emerald-velvet-sofa", name: "Emerald Velvet Sofa", category: "home", priceCents: 89900, stock: 3, featured: true, image: "photo-1555041469-a586c61ea9bc",
    description: "A three-seater in deep emerald velvet with solid oak legs and high-resilience foam cushions." },
];

const reviewers = [
  { name: "Sarah K.", email: "sarah.demo@example.com" },
  { name: "James L.", email: "james.demo@example.com" },
  { name: "Priya M.", email: "priya.demo@example.com" },
];

const sampleReviews: Record<string, { rating: number; title: string; body: string }[]> = {
  "classic-cotton-tee": [
    { rating: 5, title: "Perfect basic", body: "Soft, true to size and it hasn't shrunk after many washes. Bought three more." },
    { rating: 4, title: "Great quality", body: "Really nice fabric. Slightly longer than I expected but I like it." },
  ],
  "everyday-hoodie": [
    { rating: 5, title: "So cosy", body: "Thick, warm and the hood actually stays up. Worth every penny." },
    { rating: 5, title: "Wear it daily", body: "The brushed inside is incredibly soft. Fast shipping too." },
    { rating: 4, title: "Love it", body: "Great fit, colour is exactly like the photos." },
  ],
  "leather-bifold-wallet": [{ rating: 5, title: "Beautiful leather", body: "Smells amazing and already starting to patina. Slim enough for a front pocket." }],
  "minimal-smart-watch": [
    { rating: 4, title: "Clean design", body: "Battery really does last a week. App could be better but the watch is great." },
    { rating: 5, title: "Exactly what I wanted", body: "No clutter, just the features I use. Looks great with everything." },
  ],
  "soy-wax-candle": [{ rating: 5, title: "Gorgeous scent", body: "Fills the room without being overpowering. Burns very evenly." }],
  "potted-succulent": [{ rating: 5, title: "Arrived healthy", body: "Well packaged and the pot is lovely. Great gift." }],
};

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin12345";

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN" },
    create: { email: adminEmail, name: "Store Admin", role: "ADMIN", passwordHash: await bcrypt.hash(adminPassword, 12) },
  });

  for (const c of categories) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: { imageUrl: c.imageUrl }, create: c });
  }

  for (const p of products) {
    const category = await prisma.category.findUniqueOrThrow({ where: { slug: p.category } });
    const data = {
      name: p.name,
      description: p.description,
      priceCents: p.priceCents,
      compareAtCents: p.compareAtCents ?? null,
      featured: p.featured ?? false,
      imageUrl: img(p.image),
      categoryId: category.id,
      active: true,
    };
    await prisma.product.upsert({ where: { slug: p.slug }, update: data, create: { ...data, slug: p.slug, stock: p.stock } });
  }

  // Hide demo products from earlier versions of the seed (kept, not deleted, in case orders reference them).
  await prisma.product.updateMany({
    where: { slug: { in: ["canvas-chore-jacket", "leather-card-wallet", "wool-beanie", "everyday-tote", "ceramic-pour-over-set", "linen-throw-blanket"] } },
    data: { active: false, featured: false },
  });

  const reviewerIds: string[] = [];
  const demoHash = await bcrypt.hash(crypto.randomUUID(), 4); // demo reviewers can't log in
  for (const r of reviewers) {
    const u = await prisma.user.upsert({ where: { email: r.email }, update: {}, create: { ...r, passwordHash: demoHash } });
    reviewerIds.push(u.id);
  }

  for (const [slug, reviews] of Object.entries(sampleReviews)) {
    const product = await prisma.product.findUniqueOrThrow({ where: { slug } });
    for (const [i, r] of reviews.entries()) {
      const userId = reviewerIds[i % reviewerIds.length];
      await prisma.review.upsert({
        where: { userId_productId: { userId, productId: product.id } },
        update: r,
        create: { ...r, userId, productId: product.id },
      });
    }
    const agg = await prisma.review.aggregate({ where: { productId: product.id }, _avg: { rating: true }, _count: true });
    await prisma.product.update({ where: { id: product.id }, data: { ratingAvg: agg._avg.rating ?? 0, ratingCount: agg._count } });
  }

  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: { code: "WELCOME10", kind: "PERCENT", value: 10, minOrderCents: 3000 },
  });

  console.log(`Seeded. Admin login: ${adminEmail} / ${adminPassword} · Coupon: WELCOME10`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

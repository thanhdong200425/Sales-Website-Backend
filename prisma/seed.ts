import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import "dotenv/config";

const prisma = new PrismaClient();

const categorySeeds = [
  { name: "Clothing", slug: "clothing" },
  { name: "Shoes", slug: "shoes" },
  { name: "Accessories", slug: "accessories" },
];

const styleAdjectives = [
  "Classic",
  "Modern",
  "Urban",
  "Minimal",
  "Essential",
  "Premium",
  "Casual",
  "Active",
  "Heritage",
  "Elevated",
];

const colors = [
  "#00C12B", // Green
  "#F50606", // Red
  "#F5DD06", // Yellow
  "#F57906", // Orange
  "#06CAF5", // Blue
  "#063AF5", // Dark Blue
  "#7D06F5", // Purple
  "#F506A4", // Pink
  "#FFFFFF", // White
  "#000000"  // Black
];

const sizes = [
  "XX-Small", "X-Small", "Small", "Medium", 
  "Large", "X-Large", "XX-Large", "3X-Large", "4X-Large"
];

const styles = [
  "Casual", "Formal", "Party", "Gym"
];

const productTypes = [
  "Tee",
  "Hoodie",
  "Denim Jacket",
  "Chino",
  "Windbreaker",
  "Sneaker",
  "Boot",
  "Loafer",
  "Sport Sandal",
  "Crossbody Bag",
  "Duffel",
  "Cap",
  "Scarf",
  "Wool Coat",
  "Crewneck",
];

const imagePool = [
  "https://images.unsplash.com/photo-1475180098004-ca77a66827be",
  "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b", 
  "https://images.unsplash.com/photo-1576566588028-4147f3842f27", 
  "https://images.unsplash.com/photo-1551028919-ac66e6a39d7e", 
  "https://images.unsplash.com/photo-1591047139829-d91aecb6caea", 
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff", 
  "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa", 
  "https://images.unsplash.com/photo-1549298916-b41d501d3772", 
  "https://images.unsplash.com/photo-1552346154-21d32810aba3", 
  "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a", 
  "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a", 
  "https://images.unsplash.com/photo-1578932750294-f5075e85f44a", 
  "https://images.unsplash.com/photo-1550614000-4b9519e092a9", 
];

const descriptions = [
  "Crafted from premium materials with a focus on everyday versatility.",
  "Designed for comfort and performance, perfect for long days on the move.",
  "Features subtle detailing and a relaxed fit for effortless style.",
  "Lightweight construction with reinforced seams for lasting wear.",
  "Inspired by streetwear classics and updated with modern tailoring.",
];

const currency = "USD";
const PRODUCT_COUNT = 100;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const randomFrom = <T>(items: T[]): T =>
  items[Math.floor(Math.random() * items.length)];

const randomPrice = () => (Math.floor(Math.random() * 120) + 30).toFixed(2);

const buildImages = (startIndex: number) => {
  const count = Math.floor(Math.random() * 3) + 1; // 1-3 images
  return Array.from({ length: count }).map((_, idx) => {
    const poolIndex = (startIndex + idx) % imagePool.length;
    return {
      url: `${imagePool[poolIndex]}?auto=format&fit=crop&w=1200&q=80`,
      altText: "Lifestyle product photo",
      position: idx,
    };
  });
};

async function main() {
  console.info("Seeding categories, products and admin user...");

  await prisma.favorite.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();

  const categories = await Promise.all(
    categorySeeds.map((category) =>
      prisma.productCategory.create({ data: category })
    )
  );

  const productPromises = Array.from({ length: PRODUCT_COUNT }).map(
    async (_, index) => {
      const adjective = randomFrom(styleAdjectives);
      const type = randomFrom(productTypes);
      const name = `${adjective} ${type}`;
      const slug = `${slugify(name)}-${index + 1}`;
      const category = categories[index % categories.length];

      return prisma.product.create({
        data: {
          name,
          slug,
          summary: randomFrom(descriptions),
          description: `${randomFrom(descriptions)} ${randomFrom(
            descriptions
          )}`,
          price: randomPrice(),
          currency,
          inStock: Math.random() > 0.1,
          featured: Math.random() > 0.7,
          status: "published",
          categoryId: category.id,
      color: randomFrom(colors),
      size: randomFrom(sizes),
      style: randomFrom(styles),
          images: {
            create: buildImages(index),
          },
        },
      });
    }
  );

  await Promise.all(productPromises);

  console.info(`Seeded ${PRODUCT_COUNT} products.`);

  await seedUser();
}

async function seedUser() {
  console.info("Seeding admin user...");

  const exists = await prisma.user.findUnique({
    where: { email: "admin@example.com" },
  });

  if (!exists) {
    await prisma.user.create({
      data: {
        email: "admin@example.com",
        password: await bcrypt.hash("123456", 10),
        name: "Admin",
      },
    });
    console.info("Admin created.");
  } else {
    console.info("Admin already exists, skipping...");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

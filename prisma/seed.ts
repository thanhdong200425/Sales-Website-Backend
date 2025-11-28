import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=600&auto=format&fit=crop', // T-shirt
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600&auto=format&fit=crop', // Gym
  'https://images.unsplash.com/photo-1620799140408-ed5341cd2431?q=80&w=600&auto=format&fit=crop', // Polo
  'https://images.unsplash.com/photo-1503341504253-dff4815485f1?q=80&w=600&auto=format&fit=crop', // Black Tee
  'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600&auto=format&fit=crop', // Jeans
  'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop', // Checkered
  'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=600&auto=format&fit=crop', // Shorts
]

const COLORS = [
  '#00C12B',
  '#F50606',
  '#F5DD06',
  '#F57906',
  '#06CAF5',
  '#000000',
  '#FFFFFF',
]

const SIZES = ['XX-Small', 'Small', 'Medium', 'Large', 'X-Large', '2X-Large', '3X-Large']

const PRODUCT_NAMES = [
  'Graphic T-shirt', 'Polo Shirt', 'Skinny Jeans', 'Bermuda Shorts',
  'Gym Tee', 'Party Shirt', 'Formal Trousers', 'Hoodie Basic', 'Slim Fit Shirt'
]

const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

async function main() {
  console.log('Cleaning database...')

  await prisma.productImage.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()

  console.log('Seeding Categories...')

  const cats = ['Casual', 'Formal', 'Party', 'Gym'];
  for (const c of cats) {
    await prisma.category.create({ data: { name: c, slug: c.toLowerCase() } })
  }
  // Ham Lap
  for (let i = 1; i <= 50; i++) {
    const categoryName = getRandom(cats);
    const baseName = getRandom(PRODUCT_NAMES);
    const randomColor = getRandom(COLORS);
    const randomSize = getRandom(SIZES);
    const randomImage = getRandom(SAMPLE_IMAGES);
    const randomPrice = getRandomInt(30, 300);

    const finalName = `${baseName} ${i} - ${categoryName} Edition`;

    await prisma.product.create({
      data: {
        name: finalName,

        slug: `${finalName.toLowerCase().replace(/ /g, '-')}-${Date.now()}`,
        price: randomPrice,
        description: `This is a high-quality ${baseName.toLowerCase()} suitable for ${categoryName} events.`,
        summary: `Best choice for ${categoryName} style.`,
        inStock: true,
        status: 'published',
        featured: i % 5 === 0,

        color: randomColor,
        size: randomSize,

        category: { connect: { name: categoryName } },

        images: {
          create: [
            { url: randomImage, position: 1, altText: finalName }
          ]
        }
      }
    })
  }

  console.log('Seeding finished. Database now has 50 products!')
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: `${process.env.DATABASE_URL}`,
});
const prisma = new PrismaClient({ adapter });

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
  console.info("Seeding categories and products...");

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
          images: {
            create: buildImages(index),
          },
        },
      });
    }
  );

  await Promise.all(productPromises);

  console.info(`Seeded ${PRODUCT_COUNT} products.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

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

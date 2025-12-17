import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import "dotenv/config";

const prisma = new PrismaClient();

const categorySeeds = [
  { name: "T-shirts", slug: "t-shirts" },
  { name: "Shorts", slug: "shorts" },
  { name: "Shirts", slug: "shirts" },
  { name: "Hoodie", slug: "hoodie" },
  { name: "Jeans", slug: "jeans" },
];

const adjectives = [
  "Urban", "Classic", "Vintage", "Modern", "Essential",
  "Premium", "Streetwear", "Cozy", "Slim-fit", "Oversized",
  "Heavyweight", "Lightweight", "Athletic", "Retro", "Minimalist"
];

const materials = [
  "Cotton", "Denim", "Linen", "Fleece", "Wool", "Polyester"
];

const colors = [
  { name: "Green", code: "#00C12B" },
  { name: "Red", code: "#F50606" },
  { name: "Yellow", code: "#F5DD06" },
  { name: "Orange", code: "#F57906" },
  { name: "Blue", code: "#06CAF5" },
  { name: "Dark Blue", code: "#063AF5" },
  { name: "Purple", code: "#7D06F5" },
  { name: "Pink", code: "#F506A4" },
  { name: "White", code: "#FFFFFF" },
  { name: "Black", code: "#000000" },
];

const sizes = [
  "XX-Small", "X-Small", "Small", "Medium",
  "Large", "X-Large", "XX-Large", "3X-Large"
];

const styles = [
  "Casual", "Formal", "Party", "Gym"
];

const imagePool = [
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
  "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a",
  "https://images.unsplash.com/photo-1576566588028-4147f3842f27",
  "https://images.unsplash.com/photo-1591047139829-d91aecb6caea",
  "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a",
  "https://images.unsplash.com/photo-1604176354204-9268737828fa",
  "https://images.unsplash.com/photo-1618354691373-d851c5c3a990",
  "https://images.unsplash.com/photo-1596755094514-f87e34085b2c",
  "https://images.unsplash.com/photo-1620799140408-ed5341cd2431",
  "https://images.unsplash.com/photo-1617137968427-85924c800a22",
  "https://images.unsplash.com/photo-1551028919-ac66e6a39d7e",
  "https://images.unsplash.com/photo-1591195853828-11db59a44f6b",
  "https://images.unsplash.com/photo-1562157873-818bc0726f68",
  "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c",
  "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f",
];

const descriptions = [
  "Crafted from premium materials with a focus on everyday versatility.",
  "Designed for comfort and performance, perfect for long days on the move.",
  "Features subtle detailing and a relaxed fit for effortless style.",
  "Lightweight construction with reinforced seams for lasting wear.",
  "Inspired by streetwear classics and updated with modern tailoring.",
  "A wardrobe staple that combines durability with a soft touch.",
  "Perfect for any season, offering breathable comfort and style.",
];

const currency = "USD";
const PRODUCT_COUNT = 200;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const randomFrom = <T>(items: T[]): T =>
  items[Math.floor(Math.random() * items.length)];

const randomPrice = () => Number(Math.floor(Math.random() * 120) + 30).toFixed(2);

const randomRating = () => Number((Math.random() * 2 + 3).toFixed(1));

const buildImages = (startIndex: number, productName: string) => {
  const count = Math.floor(Math.random() * 3) + 1; // 1-3 images
  return Array.from({ length: count }).map((_, idx) => {
    const poolIndex = (startIndex + idx) % imagePool.length;
    let url = imagePool[poolIndex];
    
    if (url.includes("unsplash")) {
        url = `${url}?auto=format&fit=crop&w=600&q=80`;
    }

    return {
      url: url,
      altText: `${productName} view ${idx + 1}`,
      position: idx,
    };
  });
};

async function getOrCreateAdmin() {
  console.info("Seeding admin user...");
  const password = await bcrypt.hash("123456", 10);

  const user = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password: password,
      name: "Admin",
      role: "vendor",
    },
  });

  return user;
}

async function main() {
  console.info("Seeding categories, products and admin user...");
  await prisma.favorite.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();

  const adminUser = await getOrCreateAdmin();

  const createdCategories = await Promise.all(
    categorySeeds.map((category) =>
      prisma.productCategory.create({ data: category })
    )
  );

  console.info(`Seeding ${PRODUCT_COUNT} products...`);

  const productPromises = Array.from({ length: PRODUCT_COUNT }).map(
    async (_, index) => {
      const category = index % createdCategories.length;
      const selectedCategory = createdCategories[category];
      
      const adj = randomFrom(adjectives);
      const mat = randomFrom(materials);
      
      let typeName = selectedCategory.name;
      if (typeName === "T-shirts") typeName = "T-shirt";
      if (typeName === "Shirts") typeName = "Shirt";
      
      const name = `${adj} ${mat} ${typeName}`;
      const slug = `${slugify(name)}-${index + 1000}`;

      const selectedColor = randomFrom(colors);

      return prisma.product.create({
        data: {
          name,
          slug,
          summary: randomFrom(descriptions),
          description: `${randomFrom(descriptions)} ${randomFrom(descriptions)}`,
          price: randomPrice(),
          currency,
          inStock: Math.random() > 0.1,
          stockLevel: Math.floor(Math.random() * 100),
          soldCount: Math.floor(Math.random() * 500),
          averageRating: randomRating(),
          totalReviews: Math.floor(Math.random() * 50) + 1,
          featured: Math.random() > 0.7,
          status: "published",
          category: {
            connect: { id: selectedCategory.id }
          },
          owner: {
            connect: { id: adminUser.id }
          },
          color: selectedColor.code,
          size: randomFrom(sizes),
          style: randomFrom(styles),
          images: {
            create: buildImages(index, name),
          },
        },
      });
    }
  );

  await Promise.all(productPromises);
  console.info(`Seeded successfully! Ready to test Search & Filter.`);
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
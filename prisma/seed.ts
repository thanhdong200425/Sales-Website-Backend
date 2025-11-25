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
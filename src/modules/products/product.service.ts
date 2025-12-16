import { prisma } from '../../../prisma/prisma';

export const getMyProducts = async (ownerId: number) => {
  return await prisma.product.findMany({
    where: { ownerId: Number(ownerId) },
    include: { category: true, images: true },
    orderBy: { createdAt: 'desc' },
  });
};

export const createProduct = async (data: any, ownerId: number, vendorId?: number) => {
  const slug = data.name.toLowerCase().replace(/ /g, '-') + '-' + Date.now();

  let categoryId = Number(data.categoryId);
  if (!categoryId) {
    const firstCategory = await prisma.productCategory.findFirst();
    categoryId = firstCategory
      ? firstCategory.id
      : (
          await prisma.productCategory.create({
            data: { name: 'General', slug: `general-${Date.now()}` },
          })
        ).id;
  }

  return await prisma.product.create({
    data: {
      name: data.name,
      slug: slug,
      price: Number(data.price),
      description: data.description || '',
      summary: data.summary || 'No summary provided',
      inStock: Number(data.stockLevel) > 0,
      stockLevel: Number(data.stockLevel) || 0,
      status: 'published',
      featured: false,
      currency: 'USD',
      color: data.color || '#000000',
      size: data.size || 'Medium',
      style: data.style || 'Casual',
      categoryId: categoryId,
      ownerId: Number(ownerId),
      ...(vendorId && { vendorId: Number(vendorId) }),
      images: {
        create: data.imageUrl
          ? [
              {
                url: data.imageUrl,
                altText: data.name,
                position: 0,
              },
            ]
          : [],
      },
    },
  });
};

export const deleteProduct = async (productId: number, ownerId: number) => {
  return await prisma.product.deleteMany({
    where: { id: Number(productId), ownerId: Number(ownerId) },
  });
};

export const updateProduct = async (id: number, data: any, ownerId: number) => {
  return await prisma.product.update({
    where: {
      id: id,
      ownerId: ownerId,
    },
    data: {
      name: data.name,
      price: Number(data.price),
      description: data.description,
      stockLevel: Number(data.stockLevel),
      inStock: Number(data.stockLevel) > 0,
      color: data.color,
      size: data.size,
      style: data.style,
      ...(data.imageUrl && {
        images: {
          deleteMany: {},
          create: [{ url: data.imageUrl, altText: data.name, position: 0 }],
        },
      }),
    },
  });
};

export const getProductById = async (id: number, ownerId: number) => {
  return await prisma.product.findFirst({
    where: { id: id, ownerId: ownerId },
    include: { images: true },
  });
};

import { prisma } from "../../../prisma/prisma";

export const getMyProducts = async (vendorId: number) => {
  return await prisma.product.findMany({
    where: { vendorId: Number(vendorId) },
    include: {
      category: true,
      images: {
        orderBy: { position: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const createProduct = async (
  data: any,
  vendorId?: number,
  userId?: number
) => {
  const slug = data.name.toLowerCase().replace(/ /g, "-") + "-" + Date.now();

  let categoryId = Number(data.categoryId);
  if (!categoryId) {
    const firstCategory = await prisma.productCategory.findFirst();
    categoryId = firstCategory
      ? firstCategory.id
      : (
          await prisma.productCategory.create({
            data: { name: "General", slug: `general-${Date.now()}` },
          })
        ).id;
  }

  return await prisma.product.create({
    data: {
      name: data.name,
      slug: slug,
      price: Number(data.price),
      description: data.description || "",
      summary: data.summary || "No summary provided",
      inStock: Number(data.stockLevel) > 0,
      stockLevel: Number(data.stockLevel) || 0,
      status: "published",
      featured: false,
      currency: "USD",
      color: data.color || "#000000",
      size: data.size || "Medium",
      style: data.style || "Casual",
      categoryId: categoryId,
      ...(vendorId && { vendorId: Number(vendorId) }),
      ...(userId && { ownerId: Number(userId) }),
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

export const deleteProduct = async (productId: number, vendorId: number) => {
  return await prisma.product.deleteMany({
    where: {
      id: Number(productId),
      vendorId: Number(vendorId),
    },
  });
};

export const updateProduct = async (
  id: number,
  data: any,
  vendorId: number
) => {
  return await prisma.product.update({
    where: {
      id: id,
      vendorId: vendorId,
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

export const getProductById = async (id: number, vendorId: number) => {
  return await prisma.product.findFirst({
    where: {
      id: id,
      vendorId: vendorId,
    },
    include: { images: true },
  });
};

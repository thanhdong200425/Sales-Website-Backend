import { prisma } from "../../../prisma/prisma";
import { Prisma } from "@prisma/client";

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
interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number | string; 
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  sortBy?: string;
  color?: string;
  style?: string;
}

export const getPublicProducts = async (params: ProductQueryParams) => {
  const {
    page = 1,
    limit = 12,
    search,
    minPrice,
    maxPrice,
    rating,
    inStock,
    sortBy,
    color,
    style,
  } = params;

  const skip = (page - 1) * limit;
  const where: Prisma.ProductWhereInput = {
    status: "published",
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } }
    ];
  }
  if (rating) {
    where.averageRating = { gte: Number(rating) };
  }

  if (params.categoryId) {
    const catParam = String(params.categoryId);
    const isId = !isNaN(Number(catParam));

    if (isId) {
      where.categoryId = Number(catParam);
    } else {
      where.category = {
        name: { equals: catParam, mode: "insensitive" },
      };
    }
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = Number(minPrice);
    if (maxPrice !== undefined) where.price.lte = Number(maxPrice);
  }

  if (inStock) {
    where.inStock = true;
  }

  if (color) {
    where.color = { equals: color, mode: "insensitive" };
  }
  if (style) {
    where.style = { equals: style, mode: "insensitive" };
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };

  switch (sortBy) {
    case "price_asc":
      orderBy = { price: "asc" };
      break;
    case "price_desc":
      orderBy = { price: "desc" };
      break;
    case "newest":
      orderBy = { createdAt: "desc" };
      break;
    case "popular":
      orderBy = { stockLevel: "asc" };
      break;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      take: Number(limit),
      skip: skip,
      include: {
        category: true,
        images: true,
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    data: products,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};
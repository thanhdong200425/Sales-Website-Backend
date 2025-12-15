import { prisma } from "../../../prisma/prisma";
import { Prisma } from "@prisma/client";

export const VendorDashboardService = {
  // Get overall vendor statistics
  async getVendorStats(vendorId: number) {
    // Get date ranges
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    // Get vendor's products
    const products = await prisma.product.findMany({
      where: { vendorId },
      include: {
        orderItems: {
          include: {
            order: true,
          },
        },
      },
    });

    const productIds = products.map((p) => p.id);

    // Total Revenue (all time)
    const revenueResult = await prisma.orderItem.aggregate({
      where: {
        productId: { in: productIds },
        order: { status: { in: ["COMPLETED", "DELIVERED"] } },
      },
      _sum: {
        price: true,
      },
    });

    // Revenue last month
    const revenueLastMonth = await prisma.orderItem.aggregate({
      where: {
        productId: { in: productIds },
        order: {
          status: { in: ["COMPLETED", "DELIVERED"] },
          createdAt: { gte: lastMonth },
        },
      },
      _sum: {
        price: true,
      },
    });

    const totalRevenue = Number(revenueResult._sum.price || 0);
    const lastMonthRevenue = Number(revenueLastMonth._sum.price || 0);
    const revenueChange = lastMonthRevenue > 0 ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1) : "0";

    // Active Orders (PROCESSING, PENDING, SHIPPED)
    const activeOrdersCount = await prisma.order.count({
      where: {
        items: {
          some: {
            productId: { in: productIds },
          },
        },
        status: { in: ["PROCESSING", "PENDING", "SHIPPED"] },
      },
    });

    // Active orders last month
    const activeOrdersLastMonth = await prisma.order.count({
      where: {
        items: {
          some: {
            productId: { in: productIds },
          },
        },
        status: { in: ["PROCESSING", "PENDING", "SHIPPED"] },
        createdAt: { gte: lastMonth },
      },
    });

    const activeOrdersChange = activeOrdersLastMonth > 0 ? 
      ((activeOrdersCount - activeOrdersLastMonth) / activeOrdersLastMonth * 100).toFixed(1) : "0";

    // Pending Payments
    const pendingPaymentsResult = await prisma.orderItem.aggregate({
      where: {
        productId: { in: productIds },
        order: { status: "PENDING" },
      },
      _sum: {
        price: true,
      },
    });

    const pendingPayments = Number(pendingPaymentsResult._sum.price || 0);

    // Get vendor's average rating
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      select: {
        averageRating: true,
        totalReviews: true,
      },
    });

    return {
      totalRevenue,
      revenueChange: parseFloat(revenueChange),
      activeOrders: activeOrdersCount,
      activeOrdersChange: parseFloat(activeOrdersChange),
      pendingPayments,
      averageRating: Number(vendor?.averageRating || 0),
      totalReviews: vendor?.totalReviews || 0,
    };
  },

  // Get revenue overview with time series data
  async getRevenueOverview(vendorId: number, period: string = "30days") {
    const products = await prisma.product.findMany({
      where: { vendorId },
      select: { id: true },
    });

    const productIds = products.map((p) => p.id);

    let startDate: Date;
    const now = new Date();

    switch (period) {
      case "7days":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "3months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case "30days":
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    // Get orders within date range
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            productId: { in: productIds },
          },
        },
        status: { in: ["COMPLETED", "DELIVERED"] },
        createdAt: { gte: startDate },
      },
      include: {
        items: {
          where: {
            productId: { in: productIds },
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Group by date
    const revenueByDate: { [key: string]: number } = {};

    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split("T")[0];
      const orderTotal = order.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

      if (revenueByDate[date]) {
        revenueByDate[date] += orderTotal;
      } else {
        revenueByDate[date] = orderTotal;
      }
    });

    // Convert to array format
    const data = Object.entries(revenueByDate).map(([date, revenue]) => ({
      date,
      revenue,
    }));

    return {
      period,
      data,
    };
  },

  // Get recent orders with pagination
  async getRecentOrders(
    vendorId: number,
    page: number = 1,
    limit: number = 10,
    status: string = "all"
  ) {
    const products = await prisma.product.findMany({
      where: { vendorId },
      select: { id: true },
    });

    const productIds = products.map((p) => p.id);

    const where: any = {
      items: {
        some: {
          productId: { in: productIds },
        },
      },
    };

    if (status !== "all") {
      where.status = status.toUpperCase();
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            where: {
              productId: { in: productIds },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.user.name || order.customerName,
        customerEmail: order.user.email,
        date: order.createdAt,
        amount: order.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0),
        status: order.status,
        trackingNumber: order.trackingNumber,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // Get order breakdown by status
  async getOrderBreakdown(vendorId: number) {
    const products = await prisma.product.findMany({
      where: { vendorId },
      select: { id: true },
    });

    const productIds = products.map((p) => p.id);

    const [completed, processing, pending, total] = await Promise.all([
      prisma.order.count({
        where: {
          items: { some: { productId: { in: productIds } } },
          status: { in: ["COMPLETED", "DELIVERED"] },
        },
      }),
      prisma.order.count({
        where: {
          items: { some: { productId: { in: productIds } } },
          status: { in: ["PROCESSING", "SHIPPED"] },
        },
      }),
      prisma.order.count({
        where: {
          items: { some: { productId: { in: productIds } } },
          status: "PENDING",
        },
      }),
      prisma.order.count({
        where: {
          items: { some: { productId: { in: productIds } } },
        },
      }),
    ]);

    return {
      total,
      completed,
      processing,
      pending,
      percentages: {
        completed: total > 0 ? ((completed / total) * 100).toFixed(1) : "0",
        processing: total > 0 ? ((processing / total) * 100).toFixed(1) : "0",
        pending: total > 0 ? ((pending / total) * 100).toFixed(1) : "0",
      },
    };
  },

  // Get product alerts (out of stock, low inventory)
  async getProductAlerts(vendorId: number) {
    const products = await prisma.product.findMany({
      where: { vendorId },
      select: {
        id: true,
        name: true,
        stockLevel: true,
        inStock: true,
      },
    });

    const outOfStock = products.filter((p) => p.stockLevel === 0 || !p.inStock);
    const lowInventory = products.filter((p) => p.stockLevel > 0 && p.stockLevel <= 5 && p.inStock);

    return {
      outOfStock: outOfStock.map((p) => ({
        id: p.id,
        name: p.name,
        stockLevel: p.stockLevel,
      })),
      lowInventory: lowInventory.map((p) => ({
        id: p.id,
        name: p.name,
        stockLevel: p.stockLevel,
      })),
    };
  },

  // Get performance metrics
  async getPerformanceMetrics(vendorId: number) {
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      select: {
        averageRating: true,
        totalReviews: true,
        responseTime: true,
        fulfillmentRate: true,
      },
    });

    if (!vendor) {
      throw new Error("Vendor not found");
    }

    return {
      customerRating: Number(vendor.averageRating || 0),
      totalReviews: vendor.totalReviews,
      averageResponseTime: vendor.responseTime, // in minutes
      fulfillmentRate: Number(vendor.fulfillmentRate || 0),
    };
  },
};


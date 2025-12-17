import { prisma } from "../../../prisma/prisma";

export const VendorOrdersService = {
  // Get sales analytics for vendor
  async getSalesAnalytics(vendorId: number, year?: number) {
    const currentYear = year || new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    // Get vendor's products
    const products = await prisma.product.findMany({
      where: { vendorId },
      select: { id: true },
    });

    const productIds = products.map((p) => p.id);

    if (productIds.length === 0) {
      return {
        totalRevenue: 0,
        revenueChange: 0,
        totalOrders: 0,
        ordersChange: 0,
        avgOrderValue: 0,
        avgOrderChange: 0,
        growthRate: 0,
        growthChange: 0,
        monthlyData: [],
        topProducts: [],
        recentOrders: [],
      };
    }

    // Calculate total revenue for the year
    const currentYearRevenue = await prisma.orderItem.aggregate({
      where: {
        productId: { in: productIds },
        order: {
          createdAt: {
            gte: startOfYear,
            lte: endOfYear,
          },
          status: { in: ["PROCESSING", "SHIPPED", "DELIVERED"] },
        },
      },
      _sum: {
        price: true,
      },
      _count: true,
    });

    // Calculate previous year revenue for comparison
    const lastYearStart = new Date(currentYear - 1, 0, 1);
    const lastYearEnd = new Date(currentYear - 1, 11, 31, 23, 59, 59);

    const lastYearRevenue = await prisma.orderItem.aggregate({
      where: {
        productId: { in: productIds },
        order: {
          createdAt: {
            gte: lastYearStart,
            lte: lastYearEnd,
          },
          status: { in: ["PROCESSING", "SHIPPED", "DELIVERED"] },
        },
      },
      _sum: {
        price: true,
      },
      _count: true,
    });

    // Calculate last month for comparison
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59
    );
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const lastMonthStats = await prisma.orderItem.aggregate({
      where: {
        productId: { in: productIds },
        order: {
          createdAt: {
            gte: lastMonth,
            lte: lastMonthEnd,
          },
          status: { in: ["PROCESSING", "SHIPPED", "DELIVERED"] },
        },
      },
      _sum: {
        price: true,
      },
      _count: true,
    });

    const currentMonthStats = await prisma.orderItem.aggregate({
      where: {
        productId: { in: productIds },
        order: {
          createdAt: {
            gte: currentMonthStart,
          },
          status: { in: ["PROCESSING", "SHIPPED", "DELIVERED"] },
        },
      },
      _sum: {
        price: true,
      },
      _count: true,
    });

    // Get unique orders count
    const currentYearOrders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            productId: { in: productIds },
          },
        },
        createdAt: {
          gte: startOfYear,
          lte: endOfYear,
        },
        status: { in: ["PROCESSING", "SHIPPED", "DELIVERED"] },
      },
      select: { id: true },
    });

    const lastYearOrders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            productId: { in: productIds },
          },
        },
        createdAt: {
          gte: lastYearStart,
          lte: lastYearEnd,
        },
        status: { in: ["PROCESSING", "SHIPPED", "DELIVERED"] },
      },
      select: { id: true },
    });

    const lastMonthOrders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            productId: { in: productIds },
          },
        },
        createdAt: {
          gte: lastMonth,
          lte: lastMonthEnd,
        },
        status: { in: ["PROCESSING", "SHIPPED", "DELIVERED"] },
      },
      select: { id: true },
    });

    const currentMonthOrders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            productId: { in: productIds },
          },
        },
        createdAt: {
          gte: currentMonthStart,
        },
        status: { in: ["PROCESSING", "SHIPPED", "DELIVERED"] },
      },
      select: { id: true },
    });

    // Calculate metrics
    const totalRevenue = Number(currentYearRevenue._sum.price || 0);
    const lastYearTotalRevenue = Number(lastYearRevenue._sum.price || 0);
    const revenueChange =
      lastYearTotalRevenue > 0
        ? ((totalRevenue - lastYearTotalRevenue) / lastYearTotalRevenue) * 100
        : 0;

    const totalOrders = currentYearOrders.length;
    const lastYearTotalOrders = lastYearOrders.length;
    const ordersChange =
      lastYearTotalOrders > 0
        ? ((totalOrders - lastYearTotalOrders) / lastYearTotalOrders) * 100
        : 0;

    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const lastYearAvgOrderValue =
      lastYearTotalOrders > 0 ? lastYearTotalRevenue / lastYearTotalOrders : 0;
    const avgOrderChange =
      lastYearAvgOrderValue > 0
        ? ((avgOrderValue - lastYearAvgOrderValue) / lastYearAvgOrderValue) *
          100
        : 0;

    const lastMonthRevenue = Number(lastMonthStats._sum.price || 0);
    const currentMonthRevenue = Number(currentMonthStats._sum.price || 0);
    const growthRate =
      lastMonthRevenue > 0
        ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : 0;

    // Get monthly data
    const monthlyData = [];
    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(currentYear, month, 1);
      const monthEnd = new Date(currentYear, month + 1, 0, 23, 59, 59);

      const monthRevenue = await prisma.orderItem.aggregate({
        where: {
          productId: { in: productIds },
          order: {
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
            status: { in: ["PROCESSING", "SHIPPED", "DELIVERED"] },
          },
        },
        _sum: {
          price: true,
        },
      });

      monthlyData.push({
        month: new Date(currentYear, month).toLocaleDateString("en-US", {
          month: "short",
        }),
        value: Number(monthRevenue._sum.price || 0),
      });
    }

    // Get top 5 products
    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        productId: { in: productIds },
        order: {
          createdAt: {
            gte: startOfYear,
            lte: endOfYear,
          },
          status: { in: ["PROCESSING", "SHIPPED", "DELIVERED"] },
        },
      },
      _sum: {
        price: true,
        quantity: true,
      },
      orderBy: {
        _sum: {
          price: "desc",
        },
      },
      take: 5,
    });

    const topProductsDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: {
            category: true,
            images: {
              take: 1,
              orderBy: { position: "asc" },
            },
          },
        });

        return {
          id: product?.id.toString() || "",
          name: product?.name || "",
          category: product?.category.name || "",
          revenue: Number(item._sum.price || 0),
          unitsSold: Number(item._sum.quantity || 0),
          image: product?.images[0]?.url || "",
        };
      })
    );

    // Get recent orders
    const recentOrdersData = await prisma.order.findMany({
      where: {
        items: {
          some: {
            productId: { in: productIds },
          },
        },
      },
      include: {
        user: true,
        items: {
          where: {
            productId: { in: productIds },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    const recentOrders = recentOrdersData.map((order) => {
      const vendorItemsTotal = order.items.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0
      );

      return {
        orderId: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.user.email,
        date: order.createdAt.toISOString(),
        status: order.status.toLowerCase(),
        amount: vendorItemsTotal,
      };
    });

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      revenueChange: Math.round(revenueChange * 10) / 10,
      totalOrders,
      ordersChange: Math.round(ordersChange * 10) / 10,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      avgOrderChange: Math.round(avgOrderChange * 10) / 10,
      growthRate: Math.round(growthRate * 10) / 10,
      growthChange: Math.round(growthRate * 10) / 10,
      monthlyData,
      topProducts: topProductsDetails,
      recentOrders,
    };
  },

  // Get vendor orders with filtering
  async getVendorOrders(
    vendorId: number,
    page: number = 1,
    limit: number = 10,
    status?: string
  ) {
    const skip = (page - 1) * limit;

    // Get vendor's products
    const products = await prisma.product.findMany({
      where: { vendorId },
      select: { id: true },
    });

    const productIds = products.map((p) => p.id);

    if (productIds.length === 0) {
      return {
        orders: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    const whereClause: any = {
      items: {
        some: {
          productId: { in: productIds },
        },
      },
    };

    if (status && status !== "all") {
      whereClause.status = status.toUpperCase();
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        include: {
          user: true,
          items: {
            where: {
              productId: { in: productIds },
            },
            include: {
              product: {
                include: {
                  images: {
                    take: 1,
                    orderBy: { position: "asc" },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.order.count({
        where: whereClause,
      }),
    ]);

    const ordersFormatted = orders.map((order) => {
      const vendorItemsTotal = order.items.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0
      );

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.user.email,
        shippingAddress: order.shippingAddress,
        trackingNumber: order.trackingNumber,
        status: order.status,
        totalAmount: vendorItemsTotal,
        items: order.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: Number(item.price),
          color: item.color,
          size: item.size,
          image: item.image || item.product.images[0]?.url || null,
        })),
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      };
    });

    return {
      orders: ordersFormatted,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  // Get single order detail for vendor
  async getOrderDetail(vendorId: number, orderId: number) {
    // Get vendor's products
    const products = await prisma.product.findMany({
      where: { vendorId },
      select: { id: true },
    });

    const productIds = products.map((p) => p.id);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: {
          where: {
            productId: { in: productIds },
          },
          include: {
            product: {
              include: {
                images: {
                  take: 1,
                  orderBy: { position: "asc" },
                },
              },
            },
          },
        },
        timeline: {
          orderBy: {
            timestamp: "asc",
          },
        },
      },
    });

    if (!order || order.items.length === 0) {
      return null;
    }

    const vendorItemsTotal = order.items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.user.email,
      shippingAddress: order.shippingAddress,
      trackingNumber: order.trackingNumber,
      status: order.status,
      totalAmount: vendorItemsTotal,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: Number(item.price),
        color: item.color,
        size: item.size,
        image: item.image || item.product.images[0]?.url || null,
        status: item.status,
      })),
      timeline: order.timeline.map((event) => ({
        id: event.id,
        status: event.status,
        description: event.description,
        timestamp: event.timestamp.toISOString(),
      })),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  },

  // Update order item status
  async updateOrderItemStatus(
    vendorId: number,
    orderItemId: number,
    status: string,
    trackingNumber?: string
  ) {
    // Verify the order item belongs to vendor's product
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: {
        product: true,
        order: true,
      },
    });

    if (!orderItem || orderItem.product.vendorId !== vendorId) {
      throw new Error("Order item not found or unauthorized");
    }

    // Update order item status
    const updatedItem = await prisma.orderItem.update({
      where: { id: orderItemId },
      data: {
        status: status.toUpperCase(),
      },
    });

    // Update order tracking number if provided
    if (trackingNumber && orderItem.order) {
      await prisma.order.update({
        where: { id: orderItem.orderId },
        data: { trackingNumber },
      });
    }

    // Create order event
    let eventDescription = "";
    switch (status.toUpperCase()) {
      case "PROCESSING":
        eventDescription = `Order item "${orderItem.productName}" is being processed`;
        break;
      case "SHIPPED":
        eventDescription = `Order item "${orderItem.productName}" has been shipped${trackingNumber ? ` with tracking number ${trackingNumber}` : ""}`;
        break;
      case "DELIVERED":
        eventDescription = `Order item "${orderItem.productName}" has been delivered`;
        break;
      case "CANCELLED":
        eventDescription = `Order item "${orderItem.productName}" has been cancelled`;
        break;
      default:
        eventDescription = `Order item "${orderItem.productName}" status updated to ${status}`;
    }

    await prisma.orderEvent.create({
      data: {
        orderId: orderItem.orderId,
        status: status.toUpperCase(),
        description: eventDescription,
      },
    });

    // Check if all items in the order have the same status, update order status
    const allItems = await prisma.orderItem.findMany({
      where: { orderId: orderItem.orderId },
    });

    const allStatuses = allItems.map((item) => item.status);
    const uniqueStatuses = [...new Set(allStatuses)];

    if (uniqueStatuses.length === 1) {
      await prisma.order.update({
        where: { id: orderItem.orderId },
        data: { status: uniqueStatuses[0] },
      });
    } else if (allStatuses.every((s) => s === "SHIPPED" || s === "DELIVERED")) {
      await prisma.order.update({
        where: { id: orderItem.orderId },
        data: { status: "SHIPPED" },
      });
    }

    return updatedItem;
  },

  // Get order statistics for vendor
  async getOrderStats(vendorId: number) {
    const products = await prisma.product.findMany({
      where: { vendorId },
      select: { id: true },
    });

    const productIds = products.map((p) => p.id);

    if (productIds.length === 0) {
      return {
        totalOrders: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
      };
    }

    // Get orders with vendor's products
    const orders = await prisma.orderItem.findMany({
      where: {
        productId: { in: productIds },
      },
      include: {
        order: true,
      },
    });

    const stats = {
      totalOrders: orders.length,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    orders.forEach((item) => {
      const status = item.status.toLowerCase();
      if (status === "processing") stats.processing++;
      else if (status === "shipped") stats.shipped++;
      else if (status === "delivered") stats.delivered++;
      else if (status === "cancelled") stats.cancelled++;
    });

    return stats;
  },
};

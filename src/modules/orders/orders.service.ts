import { prisma } from '../../../prisma/prisma';

/**
 * Get all orders for a specific user
 * @param userId - The ID of the user
 * @returns Array of orders with items and timeline
 */
export const getOrdersByUserId = async (userId: number) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: userId,
      },
      include: {
        items: true,
        timeline: {
          orderBy: {
            timestamp: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform data to match Frontend UI requirements
    return orders.map((order) => {
      // Format date like "August 24, 2024"
      const formattedDate = new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(order.date));

      return {
        id: order.id,
        date: formattedDate,
        status: order.status,
        total: `$${order.total.toFixed(2)}`,
        items: order.items.map((item) => ({
          id: item.id,
          name: item.product.name,
          quantity: item.quantity,
          price: `$${item.price.toFixed(2)}`,
          image: item.product.images[0]?.url || '',
          productId: item.productId,
        })),
      };
    });
    // Transform data to match frontend API expectations
    return orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      customerName: order.customerName,
      shippingAddress: order.shippingAddress,
      trackingNumber: order.trackingNumber,
      totalAmount: order.totalAmount.toString(),
      status: order.status,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price.toString(),
        color: item.color,
        size: item.size,
        image: item.image,
      })),
      timeline: order.timeline.map((event) => ({
        id: event.id,
        status: event.status,
        description: event.description,
        createdAt: event.timestamp.toISOString(),
      })),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error('Error in getOrdersByUserId:', error);
    throw new Error('Could not fetch orders');
  }
};

/**
 * Get order detail by order ID and user ID
 * @param orderId - The ID of the order
 * @param userId - The ID of the user (for security check)
 * @returns Order detail or null if not found
 */
export const getOrderById = async (orderId: number, userId: number) => {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: userId, // Ensure user can only access their own orders
      },
      include: {
        items: true,
        timeline: {
          orderBy: {
            timestamp: 'asc',
          },
        },
      },
    });

    if (!order) {
      return null;
    }

    // Transform to match frontend API expectations
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      customerName: order.customerName,
      shippingAddress: order.shippingAddress,
      trackingNumber: order.trackingNumber,
      totalAmount: order.totalAmount.toString(),
      status: order.status,
      items: order.items.map((item) => ({
        id: item.id,
        name: item.product.name,
        quantity: item.quantity,
        price: `$${item.price.toFixed(2)}`,
        image: item.product.images[0]?.url || '',
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price.toString(),
        color: item.color,
        size: item.size,
        image: item.image,
      })),
      timeline: order.timeline.map((event) => ({
        id: event.id,
        status: event.status,
        description: event.description,
        createdAt: event.timestamp.toISOString(),
      })),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error('Error in getOrderById:', error);
    throw new Error('Could not fetch order details');
  }
};

/**
 * Get order by order number
 * @param orderNumber - The order number
 * @returns Order with items and timeline
 */
export const createOrder = async (data: any) => {
  // Logic to create order would go here
  return { message: "Order creation not implemented yet" };
};

/**
 * Get order by order number
 * @param orderNumber - The order number (e.g., TXNID983274)
 * @returns Order with items and timeline
 */
export const getOrderByNumber = async (orderNumber: string) => {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true, // Include products bought
      timeline: {
        // Include tracking history
        orderBy: { timestamp: "asc" },
      },
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  return order;
};

/**
 * Create a test order for testing purposes
 * @returns Created test order
 */
export const createTestOrder = async () => {
  return await prisma.order.create({
    data: {
      orderNumber: `TXN-${Date.now()}`,
      userId: 1, // Default test user
      customerName: "Rusan Royal",
      shippingAddress: "4567 Elm Street, Apt 3B, Philadelphia, PA",
      totalAmount: 888000,
      status: "SHIPPED",
      trackingNumber: "34u/239y/239y",
      items: {
        create: [
          {
            productName: "SNEAKERS INVERN BW",
            price: 449000,
            quantity: 1,
            productId: 1,
            color: "Black",
            size: "44",
            image: "https://via.placeholder.com/200",
          },
          {
            productName: "JACKET DISSED",
            price: 439000,
            quantity: 1,
            productId: 2,
            color: "Black",
            size: "XL",
            image: "https://via.placeholder.com/200",
          },
        ],
      },
      timeline: {
        create: [
          {
            status: "Order Placed",
            description: "Order created successfully",
          },
          { status: "Paid", description: "Payment confirmed" },
          { status: "Shipped", description: "Handed over to courier" },
        ],
      },
    },
  });
};

// Export OrderService object for backward compatibility
export const OrderService = {
  getOrderByNumber,
  createTestOrder,
};

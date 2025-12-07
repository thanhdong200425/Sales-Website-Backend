import { prisma } from '../../../prisma/prisma';

// Interface for the frontend-friendly response structure
export interface OrderHistoryItem {
  id: number;
  date: string;
  status: string;
  total: string;
  items: {
    id: number;
    name: string;
    quantity: number;
    price: string;
    image: string;
    productId: number;
  }[];
}

export interface OrderDetailResponse extends OrderHistoryItem {
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get all orders for a specific user
 * @param userId - The ID of the user
 * @returns Array of order history items
 */
export const getOrdersByUserId = async (userId: number): Promise<OrderHistoryItem[]> => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: userId,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: {
                    position: 'asc',
                  },
                  take: 1,
                },
              },
            },
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
          image: item.product.images[0]?.url || 'https://placehold.co/120x120/F0EEED/1A1A1A?text=No+Image',
          productId: item.productId,
        })),
      };
    });
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
export const getOrderById = async (orderId: number, userId: number): Promise<OrderDetailResponse | null> => {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: userId, // Ensure user can only access their own orders
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: {
                    position: 'asc',
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return null;
    }

    // Format dates
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(order.date));

    const formattedCreatedAt = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(order.createdAt));

    const formattedUpdatedAt = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(order.updatedAt));

    return {
      id: order.id,
      orderNumber: `ORD-${order.id.toString().padStart(6, '0')}`,
      date: formattedDate,
      status: order.status,
      total: `$${order.total.toFixed(2)}`,
      createdAt: formattedCreatedAt,
      updatedAt: formattedUpdatedAt,
      items: order.items.map((item) => ({
        id: item.id,
        name: item.product.name,
        quantity: item.quantity,
        price: `$${item.price.toFixed(2)}`,
        image: item.product.images[0]?.url || 'https://placehold.co/120x120/F0EEED/1A1A1A?text=No+Image',
        productId: item.productId,
      })),
    };
  } catch (error) {
    console.error('Error in getOrderById:', error);
    throw new Error('Could not fetch order details');
  }
};

/**
 * Create a new order
 * @param data - Order data
 */
export const createOrder = async (data: any) => {
  // Logic to create order would go here
  return { message: "Order creation not implemented yet" };
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const OrderService = {
  async getOrderByNumber(orderNumber: string) {
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
  },

  // (Optional) Function to create a dummy order for testing
  async createTestOrder() {
    return await prisma.order.create({
      data: {
        orderNumber: `TXN-${Date.now()}`,
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
  },
};

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Interface for the frontend-friendly response structure
export interface OrderHistoryResponse {
  id: number;
  date: string;
  status: string;
  total: string;
  items: {
    name: string;
    quantity: number;
    price: string;
    image: string;
  }[];
}

export const getOrdersByUserId = async (userId: number): Promise<OrderHistoryResponse[]> => {
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
      }).format(order.date);

      return {
        id: order.id,
        date: formattedDate,
        status: order.status,
        total: `$${order.total.toFixed(2)}`,
        items: order.items.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: `$${item.price.toFixed(2)}`,
          image: item.product.images[0]?.url || 'https://placehold.co/120x120/F0EEED/1A1A1A?text=No+Image',
        })),
      };
    });
  } catch (error) {
    console.error('Error in getOrdersByUserId:', error);
    throw new Error('Could not fetch orders');
  }
};

export const createOrder = async (data: any) => {
  // Logic to create order would go here
  return { message: "Order creation not implemented yet" };
};
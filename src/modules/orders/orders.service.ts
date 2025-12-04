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

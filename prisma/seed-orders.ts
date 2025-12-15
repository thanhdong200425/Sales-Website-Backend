import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting order seed...");

  // Check if vendor with id 1 exists
  const vendor = await prisma.vendor.findUnique({
    where: { id: 1 },
  });

  if (!vendor) {
    console.error("Vendor with id 1 not found. Please seed vendors first.");
    process.exit(1);
  }

  console.log(`Found vendor: ${vendor.businessName}`);

  // Get products for vendor with id 1
  const products = await prisma.product.findMany({
    where: { vendorId: 1 },
    include: { images: true },
  });

  if (products.length === 0) {
    console.error(
      "No products found for vendor id 1. Please ensure products are assigned to this vendor."
    );
    process.exit(1);
  }

  console.log(`Found ${products.length} products for vendor id 1`);

  // Get or create a test user
  let user = await prisma.user.findFirst({
    where: { email: "testuser@example.com" },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "testuser@example.com",
        password: await bcrypt.hash("password123", 10),
        name: "Test User",
      },
    });
    console.log("Created test user");
  }

  // Create sample orders
  const orderStatuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];
  const orderCount = 5;

  for (let i = 0; i < orderCount; i++) {
    const orderNumber = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const status = orderStatuses[i % orderStatuses.length];

    // Select random products for this order (2-4 items)
    const itemCount = Math.floor(Math.random() * 3) + 2; // 2-4 items
    const orderProducts = [];
    const usedProductIds = new Set();

    // Select random unique products
    while (
      orderProducts.length < itemCount &&
      orderProducts.length < products.length
    ) {
      const randomProduct =
        products[Math.floor(Math.random() * products.length)];
      if (!usedProductIds.has(randomProduct.id)) {
        orderProducts.push(randomProduct);
        usedProductIds.add(randomProduct.id);
      }
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = orderProducts.map((product) => {
      const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity
      const price = Number(product.price);
      totalAmount += price * quantity;

      return {
        productId: product.id,
        productName: product.name,
        quantity,
        price,
        color: product.color,
        size: product.size,
        image: product.images[0]?.url || null,
      };
    });

    // Create order with order items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        customerName: user.name || "Test Customer",
        shippingAddress: `${100 + i * 50} Main Street, Apt ${
          i + 1
        }, Springfield, IL ${62701 + i}`,
        trackingNumber:
          status !== "PENDING"
            ? `TRACK${Date.now()}${Math.floor(Math.random() * 1000)}`
            : null,
        totalAmount,
        status,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    });

    console.log(
      `Created order ${order.orderNumber} with ${order.items.length} items (Status: ${status})`
    );

    // Create order events based on status
    const events = [
      {
        status: "Order Placed",
        description: "Your order has been received and is being processed",
        timestamp: new Date(Date.now() - 86400000 * (orderCount - i)), // Stagger by days
      },
    ];

    if (status !== "PENDING") {
      events.push({
        status: "Processing",
        description: "Your order is being prepared for shipment",
        timestamp: new Date(Date.now() - 86400000 * (orderCount - i - 0.5)),
      });
    }

    if (status === "SHIPPED" || status === "DELIVERED") {
      events.push({
        status: "Shipped",
        description: "Your package has been shipped and is on its way",
        timestamp: new Date(Date.now() - 86400000 * (orderCount - i - 1)),
      });
    }

    if (status === "DELIVERED") {
      events.push({
        status: "Delivered",
        description: "Your package has been delivered successfully",
        timestamp: new Date(Date.now() - 86400000 * (orderCount - i - 2)),
      });
    }

    // Create order events
    for (const event of events) {
      await prisma.orderEvent.create({
        data: {
          orderId: order.id,
          status: event.status,
          description: event.description,
          timestamp: event.timestamp,
        },
      });
    }

    console.log(`  - Added ${events.length} order events`);
  }

  console.log(
    `\n✅ Successfully created ${orderCount} orders with items for vendor id 1`
  );
}

main()
  .catch((e) => {
    console.error("Error seeding orders:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

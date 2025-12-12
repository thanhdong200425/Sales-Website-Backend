import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting vendor seed...');

  // Create 5 sample vendors
  const vendorPasswords = [
    { email: 'vendor1@techstore.com', password: 'vendor123', businessName: 'TechStore Electronics', contactName: 'Alex Morgan' },
    { email: 'vendor2@fashionhub.com', password: 'vendor123', businessName: 'FashionHub Boutique', contactName: 'Sarah Johnson' },
    { email: 'vendor3@homegoods.com', password: 'vendor123', businessName: 'HomeGoods Plus', contactName: 'Michael Chen' },
    { email: 'vendor4@sportsworld.com', password: 'vendor123', businessName: 'SportsWorld Pro', contactName: 'Emma Davis' },
    { email: 'vendor5@beautycorner.com', password: 'vendor123', businessName: 'Beauty Corner', contactName: 'Olivia Martinez' },
  ];

  const vendors = [];
  
  for (const vendorData of vendorPasswords) {
    const hashedPassword = await bcrypt.hash(vendorData.password, 10);
    
    const vendor = await prisma.vendor.create({
      data: {
        email: vendorData.email,
        password: hashedPassword,
        businessName: vendorData.businessName,
        contactName: vendorData.contactName,
        phone: `+1-555-${Math.floor(Math.random() * 9000) + 1000}`,
        address: `${Math.floor(Math.random() * 9000) + 1000} Business Ave, City, ST ${Math.floor(Math.random() * 90000) + 10000}`,
        averageRating: (Math.random() * 1 + 4).toFixed(1), // Between 4.0 and 5.0
        totalReviews: Math.floor(Math.random() * 100) + 20,
        responseTime: Math.floor(Math.random() * 180) + 60, // 60-240 minutes
        fulfillmentRate: (Math.random() * 5 + 95).toFixed(2), // Between 95% and 100%
        status: 'ACTIVE',
      },
    });
    
    vendors.push(vendor);
    console.log(`Created vendor: ${vendor.businessName}`);
  }

  // Assign existing products to vendors
  const products = await prisma.product.findMany();
  
  if (products.length > 0) {
    for (let i = 0; i < products.length; i++) {
      const vendor = vendors[i % vendors.length]; // Distribute products among vendors
      const stockLevel = Math.floor(Math.random() * 50) + 5; // 5-55 items in stock
      
      await prisma.product.update({
        where: { id: products[i].id },
        data: {
          vendorId: vendor.id,
          stockLevel,
        },
      });
    }
    console.log(`Assigned ${products.length} products to vendors`);
  }

  // Update orders to reflect different statuses for realistic data
  const orders = await prisma.order.findMany();
  const statuses = ['COMPLETED', 'PROCESSING', 'PENDING', 'SHIPPED', 'DELIVERED'];
  
  for (const order of orders) {
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    await prisma.order.update({
      where: { id: order.id },
      data: { status: randomStatus },
    });
  }
  
  console.log(`Updated ${orders.length} orders with various statuses`);
  console.log('\nVendor seed completed successfully!');
  console.log('\nSample vendor credentials (password for all: vendor123):');
  vendorPasswords.forEach(v => {
    console.log(`  - ${v.email} (${v.businessName})`);
  });
}

main()
  .catch((e) => {
    console.error('Error seeding vendors:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


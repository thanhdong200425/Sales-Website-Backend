import { prisma } from "../../../prisma/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const VendorAuthService = {
  async register(
    email: string,
    password: string,
    businessName: string,
    contactName?: string,
    phone?: string,
    address?: string
  ) {
    // Check if vendor email already exists
    const existingVendor = await prisma.vendor.findUnique({ where: { email } });
    if (existingVendor) {
      throw new Error("Email already registered as vendor");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new vendor
    const vendor = await prisma.vendor.create({
      data: {
        email,
        password: hashedPassword,
        businessName,
        contactName,
        phone,
        address,
        status: "PENDING", // Vendors start as pending approval
      },
    });

    // Remove password before returning
    const { password: _, ...vendorWithoutPassword } = vendor;

    return {
      message: "Vendor registration successful. Awaiting approval.",
      vendor: vendorWithoutPassword,
    };
  },

  async login(email: string, password: string) {
    const vendor = await prisma.vendor.findUnique({ where: { email } });

    if (!vendor) {
      throw new Error("Invalid email or password");
    }

    // Check if vendor is active
    if (vendor.status !== "ACTIVE") {
      throw new Error("Vendor account is not active. Please contact support.");
    }

    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET not configured in .env");
    }

    const token = jwt.sign(
      { vendorId: vendor.id, email: vendor.email, role: "vendor" },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
    );

    const { password: _, ...vendorWithoutPassword } = vendor;

    return { token, vendor: vendorWithoutPassword };
  },

  async logout() {
    return { message: "Logged out successfully" };
  },

  async getVendorProfile(vendorId: number) {
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            inStock: true,
            stockLevel: true,
          },
        },
      },
    });

    if (!vendor) {
      throw new Error("Vendor not found");
    }

    const { password: _, ...vendorWithoutPassword } = vendor;
    return vendorWithoutPassword;
  },
};


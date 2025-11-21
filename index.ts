import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { Pool } from "pg";
import cors from "cors";
import { prisma } from "./prisma/prisma.js";
import { ProductStatus } from "@prisma/client";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Test database connection
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Error connecting to the database:", err);
  } else {
    console.log("Database connected successfully at:", res.rows[0].now);
  }
});

// Routes
app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Welcome to Express.js with PostgreSQL!" });
});

app.get("/health", async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      status: "healthy",
      database: "connected",
      timestamp: result.rows[0].now,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      status: "unhealthy",
      database: "disconnected",
      error: errorMessage,
    });
  }
});

// DONE: Add a seed data for products
// DONE: Add a route to get all products

// Get all products
app.get("/api/products", async (_req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: "PUBLISHED",
        inStock: true,
      },
      include: {
        category: true,
        images: {
          orderBy: {
            position: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(products);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      error: "Failed to fetch products",
      message: errorMessage,
    });
  }
});

// Get featured products
app.get("/api/products/featured", async (_req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: "PUBLISHED",
        featured: true,
        inStock: true,
      },
      include: {
        category: true,
        images: {
          orderBy: {
            position: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 8,
    });

    res.json(products);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      error: "Failed to fetch featured products",
      message: errorMessage,
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  pool.end(() => {
    console.log("Database pool closed");
    process.exit(0);
  });
});

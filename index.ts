import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { Pool } from "pg";
import cors from "cors";
import { prisma } from "./prisma/prisma.js";
import authRoutes from "./src/modules/auth/auth.routes.js";
import wishlistRoutes from "./src/modules/wishlist/wishlist.routes.js";
import orderRoutes from "./src/modules/orders/orders.routes.js";
import userRoutes from "./src/modules/user/user.routes.js";
import notificationRoutes from "./src/modules/notifications/notifications.routes.js";
import paymentRoutes from './src/modules/payments/payment.routes.js';
import vendorAuthRoutes from './src/modules/vendor-auth/vendor-auth.routes.js';
import vendorDashboardRoutes from './src/modules/vendor-dashboard/vendor-dashboard.routes.js';
import productRoutes from "./src/modules/products/product.routes";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware - CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://localhost:5173', // Vite default port
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://localhost:5174', // Vite alternate port
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // In development, allow all localhost origins
    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Feature routes
app.use("/auth", authRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/notifications", notificationRoutes);

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

// Get all items
app.get('/api/items', async (req: Request, res: Response) => {
  try {
    const { style, minPrice, maxPrice, color, size, type, page, limit } = req.query;

        console.log("Incoming Filters", req.query);

    // Set Pagination
    const pageNumber = parseInt(page as string) || 1;
    const pageSize = parseInt(limit as string) || 9; 
    const skip = (pageNumber - 1) * pageSize;

        const whereClause: any = {
            status: "published",
            inStock: true,
        };

    if (type) {
      const searchKeyword = (type as string).replace(/s$/, ''); 

            whereClause.name = {
                contains: searchKeyword,
                mode: "insensitive",
            };
        }

        if (style) {
            whereClause.style = {
                equals: style as string,
                mode: "insensitive",
            };
        }

        if (minPrice || maxPrice) {
            whereClause.price = {};
            if (minPrice) {
                whereClause.price.gte = parseFloat(minPrice as string);
            }
            if (maxPrice) {
                whereClause.price.lte = parseFloat(maxPrice as string);
            }
        }
        if (color) {
            whereClause.color = {
                equals: color as string,
                mode: "insensitive",
            };
        }
        if (size) {
            whereClause.size = { equals: size as string, mode: "insensitive" };
        }
        // console.log("Prisma Where Clause:", JSON.stringify(whereClause, null, 2));

        // Query Database
        const [total, products] = await prisma.$transaction([
            prisma.product.count({ where: whereClause }),
            prisma.product.findMany({
                where: whereClause,
                include: {
                    category: true,
                    images: { orderBy: { position: "asc" } },
                },
                orderBy: { createdAt: "desc" },
                skip: skip,
                take: pageSize,
            }),
        ]);

        const totalPages = Math.ceil(total / pageSize);

    // Transform Data
    const data = products.map((p:any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      summary: p.summary || '',
      description: p.description || '',
      price: p.price ? p.price.toString() : '0',
      currency: p.currency || 'USD',
      inStock: p.inStock,
      featured: p.featured,
      status: p.status,
      color: p.color,
      size: p.size,
      style: p.style,
      category: p.category
        ? {
            id: p.category.id,
            name: p.category.name,
            slug: p.category.slug,
          }
        : null,
      images: (p.images || []).map((img: any) => ({
        id: img.id,
        url: img.url,
        altText: img.altText || '',
        position: img.position,
      })),
    }));

        res.json({
            data,
            pagination: {
                total,
                page: pageNumber,
                limit: pageSize,
                totalPages,
            },
        });
    } catch (error) {
        console.error(" API Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get all products
app.get("/api/products", async (_req: Request, res: Response) => {
    try {
        const products = await prisma.product.findMany({
            where: {
                status: "published",
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
                status: "published",
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
// Get detail product by name
app.get("/api/products/:slug", async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;

        const product = await prisma.product.findUnique({
            where: {
                slug: slug,
            },
            include: {
                category: true,
                images: {
                    orderBy: {
                        position: "asc",
                    },
                },
            },
        });

        if (!product) {
            res.status(404).json({ error: "Product not found" });
            return;
        }

        if (product.status !== "published") {
            res.status(404).json({ error: "Product is not available" });
            return;
        }

        res.json(product);
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        res.status(500).json({
            error: "Failed to fetch product detail",
            message: errorMessage,
        });
    }
});

app.use('/auth', authRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);

// Vendor Routes
app.use('/api/vendor', vendorAuthRoutes);
app.use('/api/vendor/dashboard', vendorDashboardRoutes);
app.use("/api/vendor/products", productRoutes);

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

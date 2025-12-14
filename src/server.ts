import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes";
import orderRoutes from "./modules/orders/orders.routes";
import orderHistoryRoutes from "./modules/order-history/order-history.routes";
import wishlistRoutes from "./modules/wishlist/wishlist.routes";
import vendorAuthRoutes from "./modules/vendor-auth/vendor-auth.routes";
import vendorDashboardRoutes from "./modules/vendor-dashboard/vendor-dashboard.routes";

import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Customer Routes
app.use("/api/auth", authRoutes);
app.use('/auth', authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/order-history", orderHistoryRoutes);
app.use("/wishlist", wishlistRoutes);

// Vendor Routes
app.use("/api/vendor/auth", vendorAuthRoutes);
app.use("/api/vendor/dashboard", vendorDashboardRoutes);

app.get('/', (_req, res) => {
  res.send('Sales Website Backend is running...');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

import { Router } from "express";
import { VendorDashboardController } from "./vendor-dashboard.controller";
import { vendorAuthMiddleware } from "../../middleware/vendorAuthMiddleware";

const router = Router();

// All dashboard routes require authentication
router.use(vendorAuthMiddleware);

// GET /api/vendor/dashboard/stats
router.get("/stats", VendorDashboardController.getStats);

// GET /api/vendor/dashboard/revenue-overview?period=30days
router.get("/revenue-overview", VendorDashboardController.getRevenueOverview);

// GET /api/vendor/dashboard/orders?page=1&limit=10&status=all
router.get("/orders", VendorDashboardController.getOrders);

// GET /api/vendor/dashboard/order-breakdown
router.get("/order-breakdown", VendorDashboardController.getOrderBreakdown);

// GET /api/vendor/dashboard/product-alerts
router.get("/product-alerts", VendorDashboardController.getProductAlerts);

// GET /api/vendor/dashboard/performance
router.get("/performance", VendorDashboardController.getPerformanceMetrics);

export default router;


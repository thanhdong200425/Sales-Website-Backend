import { Router } from "express";
import { VendorOrdersController } from "./vendor-orders.controller";
import { vendorAuthMiddleware } from "../../middleware/vendorAuthMiddleware";

const router = Router();

// All vendor orders routes require authentication
router.use(vendorAuthMiddleware);

// GET /api/vendor/orders/analytics?year=2023
router.get("/analytics", VendorOrdersController.getSalesAnalytics);

// GET /api/vendor/orders/stats
router.get("/stats", VendorOrdersController.getOrderStats);

// GET /api/vendor/orders/:orderId
router.get("/:orderId", VendorOrdersController.getOrderDetail);

// PUT /api/vendor/orders/items/:orderItemId/status
router.put("/items/:orderItemId/status", VendorOrdersController.updateOrderItemStatus);

// GET /api/vendor/orders?page=1&limit=10&status=all
router.get("/", VendorOrdersController.getOrders);

export default router;

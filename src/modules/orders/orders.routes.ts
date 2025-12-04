// src/modules/orders/orders.routes.ts
import { Router } from "express";
import { OrderController } from "./orders.controller";

const router = Router();

// Route to fetch order status
// Example: GET /api/orders/TXNID983274
router.get("/:orderNumber", OrderController.getOrder);

// Helper route to create data so you have something to test
router.post("/seed", OrderController.createTest);

export default router;

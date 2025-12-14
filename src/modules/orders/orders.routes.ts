import { Router } from 'express';
import * as orderController from './orders.controller';
import { authMiddleware } from '../../middleware/authMiddleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Route: GET /api/orders
// Description: Get order history for the logged-in user
router.get('/', orderController.getHistory);

// Route: GET /api/orders/:id
// Description: Get order detail by ID for the logged-in user
router.get('/:id', orderController.getOrderDetail);
// src/modules/orders/orders.routes.ts
import { Router } from "express";
import { OrderController } from "./orders.controller";

const router = Router();

// Route to fetch order status
// Example: GET /api/orders/TXNID983274
router.get("/:orderNumber", OrderController.getOrder);

export default router;

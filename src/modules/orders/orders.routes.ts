import { Router } from 'express';
import * as orderController from './orders.controller';
import { OrderController } from './orders.controller';
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

// Route: GET /api/orders/status/:orderNumber
// Description: Get order by order number (e.g., TXNID983274)
// Example: GET /api/orders/status/TXNID983274
router.get('/status/:orderNumber', OrderController.getOrder);

// Helper route to create data so you have something to test
router.post('/seed', OrderController.createTest);

export default router;

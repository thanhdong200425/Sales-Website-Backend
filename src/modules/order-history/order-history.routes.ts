import { Router } from 'express';
import * as orderHistoryController from './order-history.controller';
import { authMiddleware } from '../../middleware/authMiddleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Route: GET /api/order-history
// Description: Get order history for the logged-in user
router.get('/', orderHistoryController.getOrderHistory);

// Route: GET /api/order-history/:id
// Description: Get order detail by ID from order history for the logged-in user
router.get('/:id', orderHistoryController.getOrderHistoryDetail);

export default router;


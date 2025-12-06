import { Router } from 'express';
import * as orderController from './orders.controller';
import { authMiddleware } from '../../middleware/authMiddleware';

const router = Router();

// Route: GET /api/orders
// Description: Get order history for the logged-in user
router.get('/', authMiddleware, orderController.getHistory);

export default router;

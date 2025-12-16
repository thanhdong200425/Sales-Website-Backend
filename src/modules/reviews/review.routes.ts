import { Router } from 'express';
import { ReviewController } from './review.controller';

const router = Router();

// POST /api/reviews/:productId
router.post('/:productId', ReviewController.createReview);

// GET /api/reviews/product/:productId
router.get('/product/:productId', ReviewController.getProductReviews);

export default router;

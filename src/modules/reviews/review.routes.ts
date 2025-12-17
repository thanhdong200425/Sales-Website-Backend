import { Router } from "express";
import { ReviewController } from "./review.controller";
import { authMiddleware } from "../../middleware/authMiddleware";

const router = Router();

// POST /api/reviews/:productId (requires authentication)
router.post("/:productId", authMiddleware, ReviewController.createReview);

// GET /api/reviews/product/:productId
router.get("/product/:productId", ReviewController.getProductReviews);

export default router;

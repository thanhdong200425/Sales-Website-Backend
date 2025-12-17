import { Request, Response } from "express";
import { ReviewService } from "./review.service";

export class ReviewController {
  static async createReview(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const { rating, comment } = req.body;

      // Get userId from authenticated user
      const userId = req.user?.id || req.user?.userId;

      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const numericRating = Number(rating);
      const numericProductId = Number(productId);
      const numericUserId = Number(userId);

      if (Number.isNaN(numericProductId)) {
        return res.status(400).json({ message: "Invalid productId" });
      }
      if (Number.isNaN(numericUserId)) {
        return res.status(400).json({ message: "Invalid userId" });
      }

      const review = await ReviewService.createOrUpdateReview(
        numericUserId,
        numericProductId,
        numericRating,
        comment
      );

      return res.status(200).json({
        message: "Review saved successfully",
        data: review,
      });
    } catch (error: any) {
      console.error("Create review error:", error);

      if (error.message === "INVALID_RATING") {
        return res
          .status(400)
          .json({ message: "Rating must be between 1 and 5" });
      }

      if (error.message === "NOT_PURCHASED") {
        return res.status(400).json({
          message: "You can only review products you have purchased",
        });
      }

      return res.status(500).json({ message: "Failed to save review" });
    }
  }

  static async getProductReviews(req: Request, res: Response) {
    try {
      const { productId } = req.params;

      const numericProductId = Number(productId);

      if (Number.isNaN(numericProductId)) {
        return res.status(400).json({ message: "Invalid productId" });
      }

      const result = await ReviewService.getReviewsForProduct(numericProductId);

      return res.status(200).json(result);
    } catch (error) {
      console.error("Get product reviews error:", error);
      return res.status(500).json({ message: "Failed to fetch reviews" });
    }
  }
}

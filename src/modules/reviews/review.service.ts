import { prisma } from '../../../prisma/prisma';

const db: any = prisma;

export const ReviewService = {
  async createOrUpdateReview(
    userId: number,
    productId: number,
    rating: number,
    comment?: string
  ) {
    if (rating < 1 || rating > 5) {
      throw new Error('INVALID_RATING');
    }

    // Ensure user has purchased this product and order has been shipped
    const hasPurchased = await db.order.findFirst({
      where: {
        userId,
        items: {
          some: {
            productId,
          },
        },
        timeline: {
          some: {
            status: 'Shipped',
          },
        },
      },
      select: { id: true },
    });

    if (!hasPurchased) {
      throw new Error('NOT_PURCHASED');
    }

    const review = await db.review.create({
      data: {
        rating,
        comment,
        userId,
        productId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return review;
  },

  async getReviewsForProduct(productId: number) {
    const [reviews, aggregates] = await Promise.all([
      db.review.findMany({
        where: { productId },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      db.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { _all: true },
      }),
    ]);

    return {
      reviews,
      averageRating: aggregates._avg.rating ?? 0,
      totalReviews: aggregates._count._all,
    };
  },
};

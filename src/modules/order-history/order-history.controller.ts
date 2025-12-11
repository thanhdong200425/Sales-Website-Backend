import { Request, Response } from 'express';
import * as orderHistoryService from './order-history.service';
import { JwtPayload } from 'jsonwebtoken';

interface UserPayload extends JwtPayload {
  userId: number;
  email: string;
  role?: string;
}

/**
 * Get order history for the authenticated user
 * GET /api/order-history
 */
export const getOrderHistory = async (req: Request, res: Response) => {
  try {
    // Get userId from authenticated token
    const user = req.user as UserPayload;
    
    if (!user || typeof user.userId !== 'number') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User ID not found',
      });
    }

    const orders = await orderHistoryService.getOrderHistoryByUserId(user.userId);
    
    res.status(200).json({
      success: true,
      message: 'Order history retrieved successfully',
      data: orders,
      count: orders.length,
    });
  } catch (error) {
    console.error('Error in getOrderHistory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve order history',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get order detail by ID from order history
 * GET /api/order-history/:id
 */
export const getOrderHistoryDetail = async (req: Request, res: Response) => {
  try {
    // Get userId from authenticated token
    const user = req.user as UserPayload;
    
    if (!user || typeof user.userId !== 'number') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User ID not found',
      });
    }

    // Validate orderId parameter
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId) || orderId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID',
      });
    }

    const order = await orderHistoryService.getOrderHistoryDetail(orderId, user.userId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order detail retrieved successfully',
      data: order,
    });
  } catch (error) {
    console.error('Error in getOrderHistoryDetail:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve order detail',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};


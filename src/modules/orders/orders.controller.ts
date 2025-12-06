import { Request, Response } from 'express';
import * as orderService from './orders.service';
import { JwtPayload } from 'jsonwebtoken';

interface UserPayload extends JwtPayload {
  userId: number;
  email: string;
  role?: string;
}

export const getHistory = async (req: Request, res: Response) => {
  try {
    // Get userId from authenticated token
    const user = req.user as UserPayload;
    
    if (!user || typeof user.userId !== 'number') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User ID not found',
      });
    }

    const orders = await orderService.getOrdersByUserId(user.userId);
    
    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error in getHistory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve order history',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

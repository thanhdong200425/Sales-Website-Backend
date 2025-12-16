import { Request, Response } from "express";
import * as orderService from "./orders.service";
import { OrderService } from "./orders.service";
import { JwtPayload } from "jsonwebtoken";

interface UserPayload extends JwtPayload {
  userId: number;
  email: string;
  role?: string;
}

/**
 * Get order history for the authenticated user
 * GET /api/orders
 */
export const getHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Get userId from authenticated token
    const user = req.user as UserPayload;

    if (!user || typeof user.userId !== "number") {
      res.status(401).json({
        success: false,
        message: "Unauthorized: User ID not found",
      });
      return;
    }

    const orders = await orderService.getOrdersByUserId(user.userId);

    res.status(200).json({
      success: true,
      message: "Order history retrieved successfully",
      data: orders,
      count: orders.length,
    });
  } catch (error) {
    console.error("Error in getHistory:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve order history",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get order detail by ID
 * GET /api/orders/:id
 */
export const getOrderDetail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Get userId from authenticated token
    const user = req.user as UserPayload;

    if (!user || typeof user.userId !== "number") {
      res.status(401).json({
        success: false,
        message: "Unauthorized: User ID not found",
      });
      return;
    }

    // Validate orderId parameter
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId) || orderId <= 0) {
      res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
      return;
    }

    const order = await orderService.getOrderById(orderId, user.userId);

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Order detail retrieved successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error in getOrderDetail:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve order detail",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get order by order number
 * GET /api/orders/status/:orderNumber
 */
export class OrderController {
  static async getOrder(req: Request, res: Response) {
    try {
      const { orderNumber } = req.params;
      const order = await orderService.getOrderByNumber(orderNumber);

      // Return data in a format close to what your Frontend expects
      res.json({ success: true, data: order });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  static async createTest(_req: Request, res: Response) {
    try {
      const order = await OrderService.createTestOrder();
      res.status(201).json({ success: true, data: order });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

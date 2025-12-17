import { Request, Response } from "express";
import { VendorOrdersService } from "./vendor-orders.service";

export class VendorOrdersController {
  // Get sales analytics
  static async getSalesAnalytics(req: Request, res: Response) {
    try {
      const vendorId = (req as any).vendor?.vendorId;
      const year = req.query.year
        ? parseInt(req.query.year as string)
        : undefined;

      if (!vendorId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const analytics = await VendorOrdersService.getSalesAnalytics(
        vendorId,
        year
      );

      return res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error: any) {
      console.error("Get Sales Analytics Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get vendor orders
  static async getOrders(req: Request, res: Response) {
    try {
      const vendorId = (req as any).vendor?.vendorId;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const status = req.query.status as string | undefined;

      if (!vendorId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const result = await VendorOrdersService.getVendorOrders(
        vendorId,
        page,
        limit,
        status
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error("Get Orders Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get order detail
  static async getOrderDetail(req: Request, res: Response) {
    try {
      const vendorId = (req as any).vendor?.vendorId;
      const orderId = parseInt(req.params.orderId);

      if (!vendorId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const order = await VendorOrdersService.getOrderDetail(vendorId, orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error: any) {
      console.error("Get Order Detail Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Update order item status
  static async updateOrderItemStatus(req: Request, res: Response) {
    try {
      const vendorId = (req as any).vendor?.vendorId;
      const orderItemId = parseInt(req.params.orderItemId);
      const { status, trackingNumber } = req.body;

      if (!vendorId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Status is required",
        });
      }

      const validStatuses = ["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
      if (!validStatuses.includes(status.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
        });
      }

      const updatedItem = await VendorOrdersService.updateOrderItemStatus(
        vendorId,
        orderItemId,
        status,
        trackingNumber
      );

      return res.status(200).json({
        success: true,
        message: "Order item status updated successfully",
        data: updatedItem,
      });
    } catch (error: any) {
      console.error("Update Order Item Status Error:", error);
      const statusCode = error.message.includes("not found") || error.message.includes("unauthorized") ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  // Get order statistics
  static async getOrderStats(req: Request, res: Response) {
    try {
      const vendorId = (req as any).vendor?.vendorId;

      if (!vendorId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const stats = await VendorOrdersService.getOrderStats(vendorId);

      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error("Get Order Stats Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

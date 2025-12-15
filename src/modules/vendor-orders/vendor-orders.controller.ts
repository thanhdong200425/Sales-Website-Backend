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
}

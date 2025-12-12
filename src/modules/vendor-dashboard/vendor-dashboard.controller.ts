import { Request, Response } from "express";
import { VendorDashboardService } from "./vendor-dashboard.service";

export class VendorDashboardController {
  // Get vendor statistics
  static async getStats(req: Request, res: Response) {
    try {
      const vendorId = (req as any).vendor?.vendorId;

      if (!vendorId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const stats = await VendorDashboardService.getVendorStats(vendorId);

      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error("Get Stats Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get revenue overview
  static async getRevenueOverview(req: Request, res: Response) {
    try {
      const vendorId = (req as any).vendor?.vendorId;
      const period = (req.query.period as string) || "30days";

      if (!vendorId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const data = await VendorDashboardService.getRevenueOverview(vendorId, period);

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      console.error("Get Revenue Overview Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get recent orders
  static async getOrders(req: Request, res: Response) {
    try {
      const vendorId = (req as any).vendor?.vendorId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = (req.query.status as string) || "all";

      if (!vendorId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const data = await VendorDashboardService.getRecentOrders(
        vendorId,
        page,
        limit,
        status
      );

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      console.error("Get Orders Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get order breakdown
  static async getOrderBreakdown(req: Request, res: Response) {
    try {
      const vendorId = (req as any).vendor?.vendorId;

      if (!vendorId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const data = await VendorDashboardService.getOrderBreakdown(vendorId);

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      console.error("Get Order Breakdown Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get product alerts
  static async getProductAlerts(req: Request, res: Response) {
    try {
      const vendorId = (req as any).vendor?.vendorId;

      if (!vendorId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const data = await VendorDashboardService.getProductAlerts(vendorId);

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      console.error("Get Product Alerts Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get performance metrics
  static async getPerformanceMetrics(req: Request, res: Response) {
    try {
      const vendorId = (req as any).vendor?.vendorId;

      if (!vendorId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const data = await VendorDashboardService.getPerformanceMetrics(vendorId);

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      console.error("Get Performance Metrics Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}


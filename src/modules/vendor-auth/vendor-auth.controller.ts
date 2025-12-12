import { Request, Response } from "express";
import { VendorAuthService } from "./vendor-auth.service";

export class VendorAuthController {
  // VENDOR REGISTRATION
  static async register(req: Request, res: Response) {
    try {
      const { email, password, businessName, contactName, phone, address } = req.body;

      // Validation
      if (!email || !password || !businessName) {
        return res.status(400).json({
          success: false,
          message: "Email, password, and business name are required",
        });
      }

      const data = await VendorAuthService.register(
        email,
        password,
        businessName,
        contactName,
        phone,
        address
      );

      return res.status(201).json({
        success: true,
        message: data.message,
        vendor: data.vendor,
      });
    } catch (error: any) {
      console.error("Vendor Registration Error:", error);

      const isVendorExists = error.message === "Email already registered as vendor";
      const statusCode = isVendorExists ? 409 : 500;

      return res.status(statusCode).json({
        success: false,
        message: statusCode === 500 ? "System error" : error.message,
      });
    }
  }

  // VENDOR LOGIN
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
      }

      const data = await VendorAuthService.login(email, password);

      return res.status(200).json({
        success: true,
        message: "Login successful",
        token: data.token,
        vendor: data.vendor,
      });
    } catch (error: any) {
      console.error("Vendor Login Error:", error);

      const isAuthError =
        error.message === "Invalid email or password" ||
        error.message.includes("not active");
      const statusCode = isAuthError ? 401 : 500;

      return res.status(statusCode).json({
        success: false,
        message: statusCode === 500 ? "Internal server error" : error.message,
      });
    }
  }

  // VENDOR LOGOUT
  static async logout(req: Request, res: Response) {
    try {
      const data = await VendorAuthService.logout();
      return res.status(200).json({
        success: true,
        message: data.message,
      });
    } catch (error: any) {
      console.error("Vendor Logout Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // GET VENDOR PROFILE
  static async getProfile(req: Request, res: Response) {
    try {
      // req.vendor is set by vendorAuthMiddleware
      const vendorId = (req as any).vendor?.vendorId;

      if (!vendorId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const vendor = await VendorAuthService.getVendorProfile(vendorId);

      return res.status(200).json({
        success: true,
        vendor,
      });
    } catch (error: any) {
      console.error("Get Vendor Profile Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}


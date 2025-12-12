import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const vendorAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Get token from header: "Bearer <token>"
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ 
      success: false,
      message: "Authentication token not found" 
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Check environment variable
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("Server has not configured JWT_SECRET");
    }

    // Verify Token
    const decoded = jwt.verify(token, secret) as any;

    // Check if token is for vendor (not customer)
    if (decoded.role !== "vendor") {
      return res.status(403).json({ 
        success: false,
        message: "Access denied. Vendor authentication required." 
      });
    }

    // Assign to req.vendor
    (req as any).vendor = decoded;

    // Allow to proceed
    next();
  } catch (err) {
    console.error("Vendor Auth Error:", err);
    return res.status(403).json({ 
      success: false,
      message: "Invalid or expired token" 
    });
  }
};


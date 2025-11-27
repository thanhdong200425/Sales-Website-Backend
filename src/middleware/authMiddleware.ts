import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1. Lấy token từ header: "Bearer <token>"
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Không tìm thấy Token xác thực" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // 2. Kiểm tra biến môi trường
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("Server chưa cấu hình JWT_SECRET");
    }

    // 3. Verify Token
    const decoded = jwt.verify(token, secret);

    // 4. Gán vào req.user (Lúc này TypeScript đã hiểu req.user là hợp lệ)
    req.user = decoded;

    // 5. Cho phép đi tiếp
    next();
    
  } catch (err) {
    // Phân loại lỗi để debug dễ hơn (tùy chọn)
    console.error("Auth Error:", err);
    return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};
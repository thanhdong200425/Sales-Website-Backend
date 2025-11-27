// src/types/express.d.ts

import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      // Định nghĩa kiểu dữ liệu cho req.user
      // Nó có thể là JwtPayload (chứa userId, email...) hoặc undefined
      user?: string | JwtPayload; 
    }
  }
}
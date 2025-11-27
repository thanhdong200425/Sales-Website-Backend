import { Request, Response } from "express";
import { AuthService } from "./auth.service";

export class AuthController {
  
  // ---ĐĂNG KÝ ---
  static async register(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;

      // Validation đầu vào
      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: "Vui lòng nhập email và mật khẩu" 
        });
      }

      // Gọi Service
      const result = await AuthService.register(email, password, name);

      // Trả về 201 (Created)
      return res.status(201).json({
        success: true,
        message: result.message,
        user: result.user
      });

    } catch (error: any) {
      console.error("Register Error:", error);

      // Nếu lỗi từ Service là "Email đã được sử dụng" -> Trả về 409 (Conflict)
      const statusCode = error.message === "Email đã được sử dụng" ? 409 : 500;
      
      return res.status(statusCode).json({ 
        success: false, 
        message: statusCode === 500 ? "Lỗi hệ thống" : error.message 
      });
    }
  }

  // ---  ĐĂNG NHẬP ---
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: "Vui lòng nhập email và mật khẩu" 
        });
      }

      const data = await AuthService.login(email, password);

      // Trả về kết quả thành công
      return res.status(200).json({
        success: true,
        message: "Đăng nhập thành công",
        token: data.token,
        user: data.user
      });

    } catch (error: any) {
      console.error("Login Error:", error);

      // Phân loại lỗi: Khớp chuỗi string với bên AuthService ném ra
      // Ở bước AuthService ném ra: "Email hoặc mật khẩu không chính xác"
      const isAuthError = error.message === "Email hoặc mật khẩu không chính xác";
      const statusCode = isAuthError ? 401 : 500;

      return res.status(statusCode).json({ 
        success: false, 
        message: statusCode === 500 ? "Lỗi máy chủ nội bộ" : error.message 
      });
    }
  }

  // --- ĐĂNG XUẤT ---
  static async logout(req: Request, res: Response) {
    return res.status(200).json({ success: true, message: "Đăng xuất thành công" });
  }
}
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

  // --- QUÊN MẬT KHẨU ---
  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      // Validation
      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập email",
        });
      }

      const result = await AuthService.forgotPassword(email);

      return res.status(200).json({
        success: true,
        message: result.message,
        ...(result.token && { token: result.token }), // Chỉ trả về token trong development
      });
    } catch (error: any) {
      console.error("Forgot Password Error:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống",
      });
    }
  }

  // --- ĐẶT LẠI MẬT KHẨU ---
  static async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;

      // Validation
      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập token và mật khẩu mới",
        });
      }

      // Kiểm tra độ dài mật khẩu
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Mật khẩu phải có ít nhất 6 ký tự",
        });
      }

      const result = await AuthService.resetPassword(token, newPassword);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      console.error("Reset Password Error:", error);

      // Phân loại lỗi
      const isTokenError =
        error.message === "Token không hợp lệ hoặc đã hết hạn" ||
        error.message === "Token đã được sử dụng" ||
        error.message === "Token đã hết hạn";

      const statusCode = isTokenError ? 400 : 500;

      return res.status(statusCode).json({
        success: false,
        message: statusCode === 500 ? "Lỗi hệ thống" : error.message,
      });
    }
  }
}
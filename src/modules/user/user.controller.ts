// src/modules/user/user.controller.ts
import { Request, Response } from 'express';
import { UserService } from './user.service';

export class UserController {
  static async getUser(req: Request, res: Response) {
    try {
      const userData = req.user as { userId: number; email: string };
      const user = await UserService.getProfile(userData.userId);

      return res.status(200).json({
        success: true,
        user,
      });
    } catch (error: any) {
      console.error('GetMe Error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Lỗi hệ thống',
      });
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const userData = req.user as { userId: number; email: string };
      const { name, email } = req.body;

      const user = await UserService.updateProfile(userData.userId, {
        name,
        email,
      });

      return res.status(200).json({
        success: true,
        message: 'Cập nhật thông tin thành công',
        user,
      });
    } catch (error: any) {
      console.error('UpdateMe Error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Lỗi hệ thống',
      });
    }
  }

  static async changePassword(req: Request, res: Response) {
    try {
      const userData = req.user as { userId: number; email: string };
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập mật khẩu cũ và mật khẩu mới',
        });
      }

      const result = await UserService.changePassword(
        userData.userId,
        oldPassword,
        newPassword
      );

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      console.error('ChangePassword Error:', error);
      const statusCode = error.message === 'Mật khẩu cũ không chính xác' ? 400 : 500;

      return res.status(statusCode).json({
        success: false,
        message: error.message || 'Lỗi hệ thống',
      });
    }
  }
}

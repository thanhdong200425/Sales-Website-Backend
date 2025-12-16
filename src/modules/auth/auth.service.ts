import { prisma } from "../../../prisma/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export const AuthService = {
  async register(email: string, pass: string, name?: string) {
    // Kiểm tra email đã tồn tại chưa
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error("Email đã được sử dụng");
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(pass, 10);

    // Tạo user mới
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    // Loại bỏ mật khẩu trước khi trả về
    const { password, ...userWithoutPassword } = user;

    return {
      message: "Đăng ký tài khoản thành công",
      user: userWithoutPassword,
    };
  },

  async login(email: string, pass: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error("Email hoặc mật khẩu không chính xác");
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new Error("Email hoặc mật khẩu không chính xác");
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("Chưa cấu hình JWT_SECRET trong .env");
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: "user" },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    const { password, ...userWithoutPassword } = user;

    return { token, user: userWithoutPassword };
  },

  async logout() {
    return { message: "Logged out successfully" };
  },

  // --- QUÊN MẬT KHẨU ---
  async forgotPassword(email: string) {
    // Kiểm tra email có tồn tại không
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Không tiết lộ email có tồn tại hay không (bảo mật)
      return { 
        message: "Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu" 
      };
    }

    // Xóa các token cũ chưa sử dụng của user này
    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        used: false,
      },
    });

    // Tạo token mới
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token hết hạn sau 1 giờ

    // Lưu token vào database
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt,
      },
    });

    // TODO: Gửi email với reset token
    // Trong môi trường production, bạn nên gửi email với link reset
    // Ví dụ: https://yourdomain.com/reset-password?token=${resetToken}
    
    return {
      message: "Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu",
      // Chỉ trả về token trong development để test
      ...(process.env.NODE_ENV !== "production" && { token: resetToken }),
    };
  },

  // --- ĐẶT LẠI MẬT KHẨU ---
  async resetPassword(token: string, newPassword: string) {
    // Tìm token trong database
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      throw new Error("Token không hợp lệ hoặc đã hết hạn");
    }

    // Kiểm tra token đã được sử dụng chưa
    if (resetToken.used) {
      throw new Error("Token đã được sử dụng");
    }

    // Kiểm tra token đã hết hạn chưa
    if (new Date() > resetToken.expiresAt) {
      throw new Error("Token đã hết hạn");
    }

    // Mã hóa mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu và đánh dấu token đã sử dụng
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
    ]);

    return {
      message: "Đặt lại mật khẩu thành công",
    };
  },
};

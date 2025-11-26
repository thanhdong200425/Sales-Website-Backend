import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient(); 

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
      user: userWithoutPassword 
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
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    const { password, ...userWithoutPassword } = user;

    return { token, user: userWithoutPassword };
  },

  async logout() {
    return { message: "Logged out successfully" };
  }
};
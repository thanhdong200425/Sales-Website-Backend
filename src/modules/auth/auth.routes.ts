// src/modules/auth/auth.routes.ts
import { Router } from "express";
import { AuthController } from "./auth.controller";
// Import middleware: Lùi 2 cấp ra khỏi 'modules/auth' để về 'src', sau đó vào 'middleware'
import { authMiddleware } from "../../middleware/authMiddleware";

const router = Router();

// --- PUBLIC ROUTES (Không cần Token) ---
router.post("/register", AuthController.register); 
router.post("/login", AuthController.login);

// --- PROTECTED ROUTES (Cần Token xác thực) ---

// 1. Đăng xuất
router.post("/logout", authMiddleware, AuthController.logout);

// 2. Lấy thông tin người dùng hiện tại (Profile)
// Frontend sẽ gọi API này khi F5 trang web để kiểm tra user còn đăng nhập không
router.get("/me", authMiddleware, (req, res) => {
  // req.user có được nhờ authMiddleware gán vào
  res.status(200).json({ 
    success: true, 
    user: req.user 
  });
});

export default router;
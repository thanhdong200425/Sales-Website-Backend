import { Router } from "express";
import { VendorAuthController } from "./vendor-auth.controller";
import { vendorAuthMiddleware } from "../../middleware/vendorAuthMiddleware";

const router = Router();

// --- PUBLIC ROUTES ---
// Register
router.post("/register", VendorAuthController.register);

// Login
router.post("/login", VendorAuthController.login);

// Forgot Password
router.post("/forgot-password", VendorAuthController.forgotPassword);

// Reset Password
router.post("/reset-password", VendorAuthController.resetPassword);

// --- PROTECTED ROUTES (Require Token) ---
// Logout
router.post("/logout", vendorAuthMiddleware, VendorAuthController.logout);

// Get vendor profile
router.get("/me", vendorAuthMiddleware, VendorAuthController.getProfile);

export default router;


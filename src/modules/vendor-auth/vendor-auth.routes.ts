import { Router } from "express";
import { VendorAuthController } from "./vendor-auth.controller";
import { vendorAuthMiddleware } from "../../middleware/vendorAuthMiddleware";

const router = Router();

// --- PUBLIC ROUTES ---
// Register
router.post("/register", VendorAuthController.register);

// Login
router.post("/login", VendorAuthController.login);

// --- PROTECTED ROUTES (Require Token) ---
// Logout
router.post("/logout", vendorAuthMiddleware, VendorAuthController.logout);

// Get vendor profile
router.get("/me", vendorAuthMiddleware, VendorAuthController.getProfile);

export default router;


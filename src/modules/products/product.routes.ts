import { Router } from "express";
import { ProductController } from "./product.controller";
import vendorAuthMiddleware from "../../middleware/vendorAuthMiddleware"; 

const router = Router();

router.get("/me", vendorAuthMiddleware, ProductController.getMyProducts);
router.post("/", vendorAuthMiddleware, ProductController.createProduct);
router.delete("/:id", vendorAuthMiddleware, ProductController.deleteProduct);
router.get("/:id", vendorAuthMiddleware, ProductController.getProductDetail); 
router.put("/:id", vendorAuthMiddleware, ProductController.updateProduct);    

export default router;
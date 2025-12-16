import { Request, Response } from "express";
import * as productService from "./product.service";

export class ProductController {

  static async getMyProducts(req: Request, res: Response) {
    try {
      const vendor = (req as any).vendor;
      const ownerId = vendor?.vendorId || vendor?.id;

      if (!ownerId) {
        return res.status(401).json({ message: "Unauthorized: Vendor ID not found" });
      }

      console.log("Fetching products for Vendor ID:", ownerId);

      const products = await productService.getMyProducts(ownerId);
      
      return res.json(products);
    } catch (error) {
      console.error("Get products error:", error);
      return res.status(500).json({ error: "Server error" });
    }
  }

  static async createProduct(req: Request, res: Response) {
    try {
      const vendor = (req as any).vendor;
      
      console.log("Decoded Token Data:", vendor);

      const ownerId = vendor?.id || vendor?.vendorId; 
      const vendorProfileId = vendor?.vendorId; 

      if (!ownerId) {
          console.error("Error: User ID not found in Token");
          return res.status(401).json({ message: "Unauthorized: Missing ID in token" });
      }

      const product = await productService.createProduct(req.body, ownerId, vendorProfileId);
      
      return res.status(201).json(product);
    } catch (error: any) {
      console.error("Create product error:", error);
      
      if (error.message === "EMPTY_CATEGORY_ERROR") {
          return res.status(400).json({ 
              message: "System has no product categories.",
              details: "EMPTY_CATEGORY_ERROR" 
          });
      }

      return res.status(500).json({ 
          message: "Product creation failed", 
          error: error.message 
      });
    }
  }

  static async deleteProduct(req: Request, res: Response) {
    try {
      const vendor = (req as any).vendor;
      const ownerId = vendor?.vendorId || vendor?.id;
      const { id } = req.params;

      await productService.deleteProduct(Number(id), ownerId);
      
      return res.json({ message: "Deleted successfully" });
    } catch (error) {
      console.error("Delete error:", error);
      return res.status(500).json({ error: "Deletion failed" });
    }
  }
  
  static async getProductDetail(req: Request, res: Response) {
    try {
        const vendor = (req as any).vendor;
        const { id } = req.params;
        const product = await productService.getProductById(Number(id), vendor.id || vendor.vendorId);
        
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        return res.json(product);
    } catch (error) {
        console.error("Get detail error:", error);
        return res.status(500).json({ message: "Error fetching product" });
    }
  }

  static async updateProduct(req: Request, res: Response) {
    try {
        const vendor = (req as any).vendor;
        const { id } = req.params;
        
        const updatedProduct = await productService.updateProduct(
            Number(id), 
            req.body, 
            vendor.id || vendor.vendorId
        );
        
        return res.json({ message: "Update successful", product: updatedProduct });
    } catch (error) {
        console.error("Update error:", error);
        return res.status(500).json({ message: "Failed to update product" });
    }
  }
}
import { Request, Response } from "express";
import { prisma } from "../../../prisma/prisma";

// 1. Hàm Toggle: Thêm hoặc Xóa sản phẩm khỏi danh sách
export const toggleWishlist = async (req: Request, res: Response) => {
  try {
    const { userId, productId } = req.body;
    
    // Kiểm tra dữ liệu
    if (!userId || !productId) {
      return res.status(400).json({ error: "Thiếu userId hoặc productId" });
    }

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_productId: { userId: Number(userId), productId: Number(productId) },
      },
    });

    if (existing) {
      // Nếu đã có -> Xóa
      await prisma.favorite.delete({
        where: { userId_productId: { userId: Number(userId), productId: Number(productId) } },
      });
      return res.json({ message: "Removed", isLiked: false });
    } else {
      // Nếu chưa có -> Thêm
      await prisma.favorite.create({
        data: { userId: Number(userId), productId: Number(productId) },
      });
      return res.json({ message: "Added", isLiked: true });
    }
  } catch (error) {
    console.error("Lỗi Toggle:", error);
    return res.status(500).json({ error: "Lỗi Server" });
  }
};

// 2. Hàm Get: Lấy danh sách sản phẩm đã thích
export const getWishlist = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const favorites = await prisma.favorite.findMany({
      where: { userId: Number(userId) },
      include: {
        product: {
            include: { images: true } // Lấy kèm ảnh sản phẩm
        }
      },
      orderBy: { assignedAt: 'desc' } // Sắp xếp mới nhất lên đầu
    });

    // Chỉ trả về mảng thông tin sản phẩm
    const products = favorites.map(item => item.product);
    
    return res.json(products);
  } catch (error) {
    console.error("Lỗi Get Wishlist:", error);
    return res.status(500).json({ error: "Lỗi Server" });
  }
};
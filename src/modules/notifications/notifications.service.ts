import { prisma } from "../../../prisma/prisma";

/**
 * Tạo thông báo mới
 * @param userId - ID người dùng
 * @param type - Loại thông báo (order, message, alert)
 * @param action - Hành động (ví dụ: "Place an order", "Order status changed to SHIPPED")
 * @param orderId - ID đơn hàng (optional)
 * @param orderNumber - Số đơn hàng (optional)
 * @returns Thông báo đã tạo
 */
export const createNotification = async (
  userId: number,
  type: string,
  action: string,
  orderId?: number,
  orderNumber?: string
) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        action,
        orderId,
        orderNumber,
        read: false,
      },
    });

    return notification;
  } catch (error) {
    console.error("Error in createNotification:", error);
    throw new Error("Could not create notification");
  }
};

/**
 * Lấy tất cả thông báo của user
 * @param userId - ID người dùng
 * @param filters - Bộ lọc (type, read status)
 * @returns Danh sách thông báo
 */
export const getNotificationsByUserId = async (
  userId: number,
  filters?: {
    type?: string;
    read?: boolean;
  }
) => {
  try {
    const where: any = { userId };

    if (filters?.type && filters.type !== "all") {
      where.type = filters.type;
    }

    if (filters?.read !== undefined) {
      where.read = filters.read;
    }

    const notifications = await prisma.notification.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return notifications;
  } catch (error) {
    console.error("Error in getNotificationsByUserId:", error);
    throw new Error("Could not fetch notifications");
  }
};

/**
 * Đánh dấu thông báo là đã đọc
 * @param notificationId - ID thông báo
 * @param userId - ID người dùng (để xác thực)
 * @returns Thông báo đã cập nhật
 */
export const markAsRead = async (notificationId: number, userId: number) => {
  try {
    // Kiểm tra xem thông báo có thuộc về user không
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      throw new Error("Notification not found or unauthorized");
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    return updated;
  } catch (error) {
    console.error("Error in markAsRead:", error);
    throw error;
  }
};

/**
 * Đánh dấu tất cả thông báo là đã đọc
 * @param userId - ID người dùng
 * @returns Số lượng thông báo đã cập nhật
 */
export const markAllAsRead = async (userId: number) => {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return result.count;
  } catch (error) {
    console.error("Error in markAllAsRead:", error);
    throw new Error("Could not mark all notifications as read");
  }
};

/**
 * Xóa thông báo
 * @param notificationId - ID thông báo
 * @param userId - ID người dùng (để xác thực)
 */
export const deleteNotification = async (
  notificationId: number,
  userId: number
) => {
  try {
    // Kiểm tra xem thông báo có thuộc về user không
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      throw new Error("Notification not found or unauthorized");
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error in deleteNotification:", error);
    throw error;
  }
};

/**
 * Lấy số lượng thông báo chưa đọc
 * @param userId - ID người dùng
 * @returns Số lượng thông báo chưa đọc
 */
export const getUnreadCount = async (userId: number) => {
  try {
    const count = await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });

    return count;
  } catch (error) {
    console.error("Error in getUnreadCount:", error);
    throw new Error("Could not get unread count");
  }
};

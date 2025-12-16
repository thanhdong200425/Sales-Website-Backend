import { Request, Response } from "express";
import * as notificationService from "./notifications.service";
import { JwtPayload } from "jsonwebtoken";

interface UserPayload extends JwtPayload {
  userId: number;
  email: string;
  role?: string;
}

/**
 * Lấy danh sách thông báo
 * GET /api/notifications
 */
export const getNotifications = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user as UserPayload;

    if (!user || typeof user.userId !== "number") {
      res.status(401).json({
        success: false,
        message: "Unauthorized: User ID not found",
      });
      return;
    }

    // Lấy filters từ query params
    const { type, read } = req.query;
    const filters: any = {};

    if (type) {
      filters.type = type as string;
    }

    if (read !== undefined) {
      filters.read = read === "true";
    }

    const notifications = await notificationService.getNotificationsByUserId(
      user.userId,
      filters
    );

    res.status(200).json({
      success: true,
      message: "Notifications retrieved successfully",
      data: notifications,
      count: notifications.length,
    });
  } catch (error) {
    console.error("Error in getNotifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve notifications",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Đánh dấu thông báo là đã đọc
 * PUT /api/notifications/:id/read
 */
export const markNotificationAsRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user as UserPayload;

    if (!user || typeof user.userId !== "number") {
      res.status(401).json({
        success: false,
        message: "Unauthorized: User ID not found",
      });
      return;
    }

    const notificationId = parseInt(req.params.id);
    if (isNaN(notificationId) || notificationId <= 0) {
      res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
      return;
    }

    const notification = await notificationService.markAsRead(
      notificationId,
      user.userId
    );

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    console.error("Error in markNotificationAsRead:", error);
    if (error instanceof Error && error.message.includes("not found")) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to mark notification as read",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
};

/**
 * Đánh dấu tất cả thông báo là đã đọc
 * PUT /api/notifications/read-all
 */
export const markAllNotificationsAsRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user as UserPayload;

    if (!user || typeof user.userId !== "number") {
      res.status(401).json({
        success: false,
        message: "Unauthorized: User ID not found",
      });
      return;
    }

    const count = await notificationService.markAllAsRead(user.userId);

    res.status(200).json({
      success: true,
      message: `${count} notifications marked as read`,
      count,
    });
  } catch (error) {
    console.error("Error in markAllNotificationsAsRead:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Xóa thông báo
 * DELETE /api/notifications/:id
 */
export const deleteNotification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user as UserPayload;

    if (!user || typeof user.userId !== "number") {
      res.status(401).json({
        success: false,
        message: "Unauthorized: User ID not found",
      });
      return;
    }

    const notificationId = parseInt(req.params.id);
    if (isNaN(notificationId) || notificationId <= 0) {
      res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
      return;
    }

    await notificationService.deleteNotification(notificationId, user.userId);

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteNotification:", error);
    if (error instanceof Error && error.message.includes("not found")) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to delete notification",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
};

/**
 * Lấy số lượng thông báo chưa đọc
 * GET /api/notifications/unread-count
 */
export const getUnreadCount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user as UserPayload;

    if (!user || typeof user.userId !== "number") {
      res.status(401).json({
        success: false,
        message: "Unauthorized: User ID not found",
      });
      return;
    }

    const count = await notificationService.getUnreadCount(user.userId);

    res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("Error in getUnreadCount:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get unread count",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

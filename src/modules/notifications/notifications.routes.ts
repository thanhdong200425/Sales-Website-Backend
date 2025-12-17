import { Router } from "express";
import * as notificationController from "./notifications.controller";
import { authMiddleware } from "../../middleware/authMiddleware";

const router = Router();

// Tất cả routes yêu cầu authentication
router.use(authMiddleware);

// Route: GET /api/notifications
// Description: Lấy danh sách thông báo của user (có thể filter theo type và read status)
// Query params: ?type=order&read=false
router.get("/", notificationController.getNotifications);

// Route: GET /api/notifications/unread-count
// Description: Lấy số lượng thông báo chưa đọc
router.get("/unread-count", notificationController.getUnreadCount);

// Route: PUT /api/notifications/read-all
// Description: Đánh dấu tất cả thông báo là đã đọc
router.put("/read-all", notificationController.markAllNotificationsAsRead);

// Route: PUT /api/notifications/:id/read
// Description: Đánh dấu một thông báo là đã đọc
router.put("/:id/read", notificationController.markNotificationAsRead);

// Route: DELETE /api/notifications/:id
// Description: Xóa một thông báo
router.delete("/:id", notificationController.deleteNotification);

export default router;

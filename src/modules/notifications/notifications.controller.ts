import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import {
  listNotifications,
  markAllAsRead,
  markAsRead,
  markAsUnread,
  getNotification,
} from "./notifications.service";

interface UserPayload extends JwtPayload {
  userId: number;
  email: string;
}

export const getList = async (req: Request, res: Response) => {
  try {
    const user = req.user as UserPayload;
    if (!user?.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const statusParam = (req.query.status as string)?.toUpperCase();
    const status =
      statusParam === "READ" || statusParam === "UNREAD" ? statusParam : "ALL";

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const data = await listNotifications(user.userId, { status, page, limit });

    res.json({ success: true, data });
  } catch (error) {
    console.error("getList error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch notifications" });
  }
};

export const setRead = async (req: Request, res: Response) => {
  try {
    const user = req.user as UserPayload;
    if (!user?.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const id = Number(req.params.id);
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Notification id is required" });
    }

    const result = await markAsRead(id, user.userId);
    if (result.count === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }
    res.json({ success: true, message: "Marked as read" });
  } catch (error) {
    console.error("setRead error", error);
    res.status(500).json({ success: false, message: "Failed to update" });
  }
};

export const setUnread = async (req: Request, res: Response) => {
  try {
    const user = req.user as UserPayload;
    if (!user?.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const id = Number(req.params.id);
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Notification id is required" });
    }

    const result = await markAsUnread(id, user.userId);
    if (result.count === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }
    res.json({ success: true, message: "Marked as unread" });
  } catch (error) {
    console.error("setUnread error", error);
    res.status(500).json({ success: false, message: "Failed to update" });
  }
};

export const setAllRead = async (req: Request, res: Response) => {
  try {
    const user = req.user as UserPayload;
    if (!user?.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    await markAllAsRead(user.userId);
    res.json({ success: true, message: "Marked all as read" });
  } catch (error) {
    console.error("setAllRead error", error);
    res.status(500).json({ success: false, message: "Failed to update" });
  }
};

export const getDetail = async (req: Request, res: Response) => {
  try {
    const user = req.user as UserPayload;
    if (!user?.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const id = Number(req.params.id);
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Notification id is required" });
    }

    const notification = await getNotification(id, user.userId);
    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    res.json({ success: true, data: notification });
  } catch (error) {
    console.error("getDetail error", error);
    res.status(500).json({ success: false, message: "Failed to fetch" });
  }
};


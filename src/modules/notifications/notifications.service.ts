import { prisma } from "../../../prisma/prisma";

export type NotificationStatus = "UNREAD" | "READ";

export interface NotificationListItem {
  id: number;
  title: string;
  message: string;
  imageUrl?: string | null;
  actionUrl?: string | null;
  status: NotificationStatus;
  createdAt: string;
  relativeTime: string;
  orderId?: number | null;
  orderNumber?: string | null;
}

export interface NotificationListResponse {
  items: NotificationListItem[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
}

type ListFilter = {
  status?: NotificationStatus | "ALL";
  page?: number;
  limit?: number;
};

const formatRelativeTime = (date: Date) => {
  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) {
    const diffMinutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    return `${diffMinutes} minutes ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} hours ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} days ago`;
};

export const listNotifications = async (
  userId: number,
  { status = "ALL", page = 1, limit = 20 }: ListFilter = {}
): Promise<NotificationListResponse> => {
  const where =
    status === "ALL"
      ? { userId }
      : {
          userId,
          status,
        };

  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await prisma.$transaction([
    prisma.notification.findMany({
      where,
      include: {
        order: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({
      where: { userId, status: "UNREAD" },
    }),
  ]);

  const items: NotificationListItem[] = notifications.map((n) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    imageUrl: n.imageUrl,
    actionUrl: n.actionUrl,
    status: n.status as NotificationStatus,
    createdAt: n.createdAt.toISOString(),
    relativeTime: formatRelativeTime(n.createdAt),
    orderId: n.orderId,
    orderNumber: n.order?.orderNumber ?? null,
  }));

  return {
    items,
    total,
    unreadCount,
    page,
    limit,
  };
};

export const markAsRead = async (id: number, userId: number) => {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: {
      status: "READ",
      readAt: new Date(),
    },
  });
};

export const markAsUnread = async (id: number, userId: number) => {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: {
      status: "UNREAD",
      readAt: null,
    },
  });
};

export const markAllAsRead = async (userId: number) => {
  return prisma.notification.updateMany({
    where: { userId, status: "UNREAD" },
    data: {
      status: "READ",
      readAt: new Date(),
    },
  });
};

export const getNotification = async (id: number, userId: number) => {
  return prisma.notification.findFirst({
    where: { id, userId },
    include: {
      order: true,
    },
  });
};

export const createNotification = async (params: {
  userId: number;
  title: string;
  message: string;
  imageUrl?: string | null;
  actionUrl?: string | null;
  orderId?: number | null;
}) => {
  return prisma.notification.create({
    data: {
      ...params,
      status: "UNREAD",
    },
  });
};


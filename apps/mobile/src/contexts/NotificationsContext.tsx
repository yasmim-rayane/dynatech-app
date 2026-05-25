import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type NotificationTone = "emerald" | "cyan" | "navy";
export type NotificationIcon = "award" | "clock" | "trending-up" | "bluetooth" | "bell";

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  timestamp: number;
  unread: boolean;
  tone: NotificationTone;
  icon: NotificationIcon;
}

interface NotificationsContextData {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (notif: Omit<AppNotification, "id" | "timestamp" | "unread">) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  deleteAllNotifications: () => void;
}

const NotificationsContext = createContext<NotificationsContextData>({} as NotificationsContextData);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("dynatech_notifications");
      if (stored) {
        setNotifications(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Erro ao carregar notificações", e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("dynatech_notifications", JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = useCallback((notif: Omit<AppNotification, "id" | "timestamp" | "unread">) => {
    const newNotif: AppNotification = {
      ...notif,
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      timestamp: Date.now(),
      unread: true,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const deleteAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useAppNotifications() {
  return useContext(NotificationsContext);
}

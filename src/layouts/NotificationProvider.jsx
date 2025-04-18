/* eslint-disable react/prop-types */
import { createContext, useState, useContext, useEffect } from "react";
import { fetchUserNotifications } from "@/services/notificationServices";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const loadNotificationsCount = async () => {
      try {
        const data = await fetchUserNotifications();
        const unreadNotifications = data.filter(
          (notification) => !notification.isRead
        );
        setUnreadCount(unreadNotifications.length);
      } catch (error) {
        console.error("Failed to load notifications count:", error);
      }
    };

    loadNotificationsCount();
  }, [version]);

  const refreshNotifications = () => {
    setVersion((prev) => prev + 1);
  };

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);

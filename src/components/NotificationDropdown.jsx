/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import * as signalR from "@microsoft/signalr";
import "../assets/styles/notification.css";
// Import notification sound
import notificationSound from "../assets/sounds/notificationSound.mp3";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_API_URL;

const NotificationDropdown = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isTabActive, setIsTabActive] = useState(true);
  // const [newNotificationCount, setNewNotificationCount] = useState(0);

  const dropdownRef = useRef(null);
  const hubConnectionRef = useRef(null);
  const audioRef = useRef(new Audio(notificationSound));
  const originalTitle = useRef(document.title);

  // Track tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsTabActive(false);
      } else {
        setIsTabActive(true);
        // Reset title and notification count when tab becomes active
        document.title = originalTitle.current;
        // setNewNotificationCount(0);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Reset title when notifications are viewed
  useEffect(() => {
    if (isOpen) {
      document.title = originalTitle.current;
      // setNewNotificationCount(0);
    }
  }, [isOpen]);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/api/Notification/user/${userId}`
      );
      setNotifications(response.data);

      const unreadResponse = await axios.get(
        `${BACKEND_API_URL}/api/Notification/unread/${userId}`
      );
      setUnreadCount(unreadResponse.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Initialize audio (call this on first user interaction)
  const initializeAudio = () => {
    audioRef.current
      .play()
      .then(() => {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      })
      .catch((err) => console.log("Audio initialization failed:", err));
  };

  // Start SignalR connection
  const startConnection = async () => {
    if (
      hubConnectionRef.current &&
      hubConnectionRef.current.state !== signalR.HubConnectionState.Disconnected
    ) {
      console.log("✅ SignalR connection is already started.");
      return;
    }

    try {
      const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${BACKEND_API_URL}/notificationHub`, {
          withCredentials: true,
        })
        .configureLogging(signalR.LogLevel.Information)
        .withAutomaticReconnect()
        .build();

      hubConnectionRef.current = connection;

      // Handle receiving new notifications
      connection.on("ReceiveNotification", (title, message, link) => {
        const newNotification = {
          notificationID: Date.now(), // Temporary ID until refresh
          title,
          message,
          link,
          isRead: false,
          createdAt: new Date().toISOString(),
        };

        // Add the new notification to the list
        setNotifications((prev) => [newNotification, ...prev]);
        setUnreadCount((prev) => prev + 1);

        // Play notification sound
        audioRef.current
          .play()
          .catch((err) => console.log("Audio play error:", err));

        // Update tab title if tab is not active
        if (!isTabActive) {
          // setNewNotificationCount((prevCount) => {
          //   const newCount = prevCount + 1;
          //   document.title = `(${newCount}) New Notification - ${originalTitle.current}`;
          //   return newCount;
          // });
        }
      });

      connection.on("NotificationRead", (notificationId) => {
        // Update the notification as read in our local state
        setNotifications((prev) =>
          prev.map((item) =>
            item.notificationID === notificationId
              ? { ...item, isRead: true }
              : item
          )
        );
      });

      // Thêm xử lý khi nhận tín hiệu xóa thông báo
      connection.on("NotificationDeleted", (notificationId) => {
        console.log("Notification deleted:", notificationId);
        // Xóa thông báo khỏi danh sách local
        setNotifications((prev) =>
          prev.filter((item) => item.notificationID !== notificationId)
        );
      });

      connection.on("UnreadCountUpdated", (count) => {
        // Update the unread count directly from the server
        setUnreadCount(count);
      });

      // Start connection
      await connection.start();
      console.log("✅ SignalR Connected!");

      // Join user's group
      await connection.invoke("JoinUserGroup", userId.toString());
    } catch (err) {
      console.error("🚨 Error establishing SignalR connection:", err);
      setTimeout(startConnection, 5000);
    }
  };

  useEffect(() => {
    if (!userId) return;

    fetchNotifications();
    startConnection();

    return () => {
      if (hubConnectionRef.current) {
        hubConnectionRef.current.stop();
        console.log("🔌 SignalR Disconnected!");
      }
    };
  }, [userId]);

  // Handle clicking outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    // Initialize audio on user interaction
    initializeAudio();

    setIsOpen(!isOpen);

    // Reset notification count and title when opening dropdown
    if (!isOpen) {
      document.title = originalTitle.current;
      // setNewNotificationCount(0);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await axios.put(
          `${BACKEND_API_URL}/api/Notification/markAsRead/${notification.notificationID}`
        );

        // setNotifications((prev) =>
        //   prev.map((item) =>
        //     item.notificationID === notification.notificationID
        //       ? { ...item, isRead: true }
        //       : item
        //   )
        // );

        // setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }

    if (notification.link) {
      window.location.href = `${FRONTEND_URL}${notification.link}`;
      setIsOpen(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return (
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
      " " +
      date.toLocaleDateString()
    );
  };

  return (
    <div className="notification-wrapper" ref={dropdownRef}>
      <a
        className="menu-btn"
        style={{ marginRight: "30px", marginLeft: "15px" }}
        onClick={toggleDropdown}
      >
        {unreadCount > 0 && (
          <span className="count" style={{ textAlign: "center" }}>
            {unreadCount}
          </span>
        )}
        <span className="icon la la-bell"></span>
      </a>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && <span>{unreadCount} unread</span>}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">No notifications</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.notificationID}
                  className={`notification-item ${
                    !notification.isRead ? "unread" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-title">{notification.title}</div>
                  <div className="notification-message">
                    {notification.message}
                  </div>
                  <div className="notification-time">
                    {formatTime(notification.createdAt)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;

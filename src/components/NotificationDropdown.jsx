import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import * as signalR from "@microsoft/signalr";
import "../assets/styles/notification.css";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_API_URL;

const NotificationDropdown = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const hubConnectionRef = useRef(null);
  const navigate = useNavigate();

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

        setNotifications((prev) => [newNotification, ...prev]);
        setUnreadCount((prev) => prev + 1);
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
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await axios.put(
          `${BACKEND_API_URL}/api/Notification/markAsRead/${notification.notificationID}`
        );

        setNotifications((prev) =>
          prev.map((item) =>
            item.notificationID === notification.notificationID
              ? { ...item, isRead: true }
              : item
          )
        );

        setUnreadCount((prev) => Math.max(0, prev - 1));
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
        style={{ marginRight: "30px" }}
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
            <h3>Thông báo</h3>
            {unreadCount > 0 && <span>{unreadCount} chưa đọc</span>}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">Không có thông báo nào</div>
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

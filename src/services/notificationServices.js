import axios from "axios";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL; // Thay thế bằng URL backend thật

export const fetchUserNotifications = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("userLoginData"));
    const userID = user?.userID || null;
    const response = await axios.get(
      `${BACKEND_API_URL}/api/Notification/user/${userID}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await axios.put(
      `${BACKEND_API_URL}/api/Notification/markAsRead/${notificationId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    const response = await axios.delete(
      `${BACKEND_API_URL}/api/Notification/${notificationId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

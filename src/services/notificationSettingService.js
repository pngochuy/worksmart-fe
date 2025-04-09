import axios from "axios";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

// Helper function to get the token
const getAccessToken = () => {
  const token = localStorage.getItem("accessToken");
  return token ? token.replace(/^"(.*)"$/, "$1") : null;
};

export const getNotificationSettingById = async (id) => {
  try {
    const token = getAccessToken();
    if (!token) {
      console.warn("No access token found for authorization");
    }

    const response = await axios.get(
      `${BACKEND_API_URL}/NotificationSetting/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching notification setting:", error);
    throw error;
  }
};

export const updateNotificationSetting = async (id, data) => {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error("No access token found for authorization");
    }

    const response = await axios.put(
      `${BACKEND_API_URL}/NotificationSetting/${id}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating notification setting:", error);
    throw error;
  }
};

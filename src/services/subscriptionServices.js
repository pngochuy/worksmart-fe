import axios from "axios";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

// Function to check avtive subscription
export const hasActiveSubscription = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("userLoginData"));
    const userID = user?.userID || null;
    const response = await axios.get(
      `${BACKEND_API_URL}/subscriptions/has-active-subscription/${userID}`
    );
    return response.data;
  } catch (error) {
    console.error("Error checking active subscription:", error);
    throw error;
  }
};

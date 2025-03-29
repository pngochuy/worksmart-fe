import axios from "axios";
import qs from "qs";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

//call api api/Application/ApplicationCountDashboard
export const getApplicationCountDashboard = async () => {
  try {
    const response = await axios.get(
      `${BACKEND_API_URL}/api/Application/ApplicationCountDashboard`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching application count:", error);
    throw error;
  }
};
//api/Job/job-category-dashboard
export const getJobCategoryDashboard = async () => {
  try {
    const response = await axios.get(
      `${BACKEND_API_URL}/api/Job/job-category-dashboard`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching job category:", error);
    throw error;
  }
};
//api/Job/job-status-dashboard
export const getJobStatusDashboard = async () => {
  try {
    const response = await axios.get(
      `${BACKEND_API_URL}/api/Job/job-status-dashboard`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching job status:", error);
    throw error;
  }
};
//api/Job/job-location-dashboard
export const getJobLocationDashboard = async () => {
  try {
    const response = await axios.get(
      `${BACKEND_API_URL}/api/Job/job-location-dashboard`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching job location:", error);
    throw error;
  }
};
//subscriptions/SubscriptionRevenueDashboard
export const getSubscriptionRevenueDashboard = async () => {
  try {
    const response = await axios.get(
      `${BACKEND_API_URL}/subscriptions/SubscriptionRevenueDashboard`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching subscription revenue:", error);
    throw error;
  }
};
//admins/user-dashboard
export const getUserDashboard = async () => {
  try {
    const response = await axios.get(
      `${BACKEND_API_URL}/admins/user-dashboard`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user dashboard:", error);
    throw error;
  }
};
//admins/count-dashboard
export const getCountDashboard = async () => {
  try {
    const response = await axios.get(
      `${BACKEND_API_URL}/admins/count-dashboard`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching count dashboard:", error);
    throw error;
  }
};

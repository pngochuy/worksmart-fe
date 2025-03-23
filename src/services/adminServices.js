import axios from "axios";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL; // Thay thế bằng URL backend thật

// Hàm gọi API để lấy danh sách người dùng
export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${BACKEND_API_URL}/admins/list-user`);
    return response.data; // Trả về dữ liệu từ API
  } catch (error) {
    console.error("Error fetching users list:", error);
    throw error; // Ném lỗi để xử lý ở nơi gọi
  }
};

// Function to get user profile details
export const getUserProfile = async (userId) => {
  try {
    const response = await axios.get(`${BACKEND_API_URL}/admins/user-profile/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

// Function to get job details
export const getJobDetails = async (jobId) => {
  try {
    const response = await axios.get(`${BACKEND_API_URL}/api/Job/${jobId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching job details:", error);
    throw error;
  }
};

// Hàm lấy tất cả công việc
export const getAllJobs = async () => {
  try {
    const response = await axios.get(`${BACKEND_API_URL}/api/Job/getAllJob`);
    return response.data; // Trả về dữ liệu tất cả công việc
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw error;
  }
};
// In adminServices.js
export const approveJob = async (jobId) => {
  try {
    const token = localStorage.getItem('accessToken');
    
    const response = await axios.put(
      `${BACKEND_API_URL}/admins/jobs/${jobId}/approve`,
      {}, 
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error approving job ${jobId}:`, error);
    throw error;
  }
};

export const rejectJob = async (jobId, reason) => {
  try {
    const token = localStorage.getItem('accessToken');
    
    const response = await axios.put(
      `${BACKEND_API_URL}/admins/jobs/${jobId}/reject`,
      { reason }, 
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    console.log("tets", response.data)
    return response.data;
  } catch (error) {
    console.error(`Error rejecting job ${jobId}:`, error);
    throw error;
  }
};

export const banUser = async (userId) => {
  try {
    console.log("User data", userId);

    const response = await axios.post(
      `${BACKEND_API_URL}/admins/ban/${userId}`,
      {},
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error) {
    console.error('Error banning user:', error);
    throw error.response?.data || { Message: 'Failed to ban user' };
  }
};

export const unbanUser = async (userId) => {
  try {
    const response = await axios.post(
      `${BACKEND_API_URL}/admins/unban/${userId}`,
      {},
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error) {
    console.error('Error banning user:', error);
    throw error.response?.data || { Message: 'Failed to ban user' };
  }
};

export const approveTaxVerification = async (userId) => {
  try {
    const response = await axios.post(
      `${BACKEND_API_URL}/admins/approve-tax/${userId}`,
      { isApproved: true },
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error) {
    console.error('Error approving tax verification:', error);
    throw error.response?.data || { message: 'Failed to approve tax verification' };
  }
};

export const rejectTaxVerification = async (userId, reason) => {
  try {
    const response = await axios.post(
      `${BACKEND_API_URL}/admins/approve-tax/${userId}`,
      { 
        isApproved: false,
        reason: reason 
      },
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error) {
    console.error('Error rejecting tax verification:', error);
    throw error.response?.data || { message: 'Failed to reject tax verification' };
  }
};

export const approveLicenseVerification = async (userId) => {
  try {
    const response = await axios.post(
      `${BACKEND_API_URL}/admins/approve-license/${userId}`,
      { isApproved: true },
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error) {
    console.error('Error approving license verification:', error);
    throw error.response?.data || { message: 'Failed to approve license verification' };
  }
};

export const rejectLicenseVerification = async (userId, reason) => {
  try {
    const response = await axios.post(
      `${BACKEND_API_URL}/admins/approve-license/${userId}`,
      { 
        isApproved: false,
        reason: reason 
      },
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error) {
    console.error('Error rejecting license verification:', error);
    throw error.response?.data || { message: 'Failed to reject license verification' };
  }
};
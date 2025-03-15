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
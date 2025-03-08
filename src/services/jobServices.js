import axios from "axios";
import qs from "qs";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

// Hàm lấy danh sách công việc theo các tham số tìm kiếm
export const fetchJobs = async (searchParams) => {
  try {
    const response = await axios.get(
      `${BACKEND_API_URL}/api/Job/GetListSearch`,
      {
        params: searchParams,  // Truyền tham số tìm kiếm vào API
        paramsSerializer: (params) =>
          qs.stringify(params, {
            skipNulls: true,
            skipEmptyStrings: true,
            arrayFormat: "repeat",  // Dùng arrayFormat để gửi danh sách nếu có
          }),
      }
    );
    return response.data;  // Trả về dữ liệu từ API
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return { jobs: [], totalPage: 0 };  // Trả về mảng rỗng và tổng số trang là 0 nếu có lỗi
  }
};

// Hàm lấy tất cả công việc
export const getAllJobs = async () => {
  try {
    const response = await axios.get(`${BACKEND_API_URL}/api/Job/getAllJob`);
    return response.data;  // Trả về dữ liệu tất cả công việc
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw error;
  }
};

// Hàm lấy chi tiết công việc theo ID (sửa dùng axios thay fetch)
export const fetchJobDetails = async (jobId) => {
  try {
    const response = await axios.get(`${BACKEND_API_URL}/api/Job/${jobId}`);
    console.log(response.data)
    return response.data;  // Trả về dữ liệu chi tiết công việc
  } catch (error) {
    console.error("Error fetching job details:", error);
    throw error;  // Ném lỗi để xử lý ở nơi gọi hàm
  }
};

// Hàm tạo công việc mới
export const createJob = async (jobData) => {
  try {
    const response = await axios.post(
      `${BACKEND_API_URL}/api/Job/create`,
      jobData
    );
    console.log(jobData);
    return response.data;  // Trả về dữ liệu công việc đã tạo
  } catch (error) {
    console.error("Error creating job:", error);
    throw error;
  }
};

// Hàm lấy danh sách ứng viên cho công việc theo ID
export const fetchCandidatesForJob = async (jobId) => {
  try {
    const response = await axios.get(`${BACKEND_API_URL}/api/Application/Job/${jobId}/applications`);
    return response.data; // Giả sử API trả về danh sách các ứng viên
  } catch (error) {
    console.error("Error fetching candidates:", error);
    throw error;
  }
};

// Hàm chấp nhận ứng viên
export const acceptCandidate = async (applicationId, jobId) => {
  try {
    const response = await axios.put(`${BACKEND_API_URL}/api/Application/${applicationId}/accept`, { jobId });
    return response.data; // Trả về dữ liệu chấp nhận ứng viên
  } catch (error) {
    console.error("Error approving candidate:", error);
    throw error;
  }
};

// Hàm từ chối ứng viên
export const rejectCandidate = async (applicationId, jobId) => {
  try {
    const response = await axios.put(`${BACKEND_API_URL}/api/Application/${applicationId}/reject`, { jobId });
    return response.data; // Trả về dữ liệu từ chối ứng viên
  } catch (error) {
    console.error("Error rejecting candidate:", error);
    throw error;
  }
};

// Hàm lấy công việc theo ID
export const getJobById = async (id) => {
  try {
    const response = await axios.get(`${BACKEND_API_URL}/api/Job/${id}`);
    return response.data; 
  } catch (error) {
    console.error("Error fetching job:", error);
    throw error;
  }
};

// Hàm xóa công việc theo ID
export const deleteJob = async (id) => {
  try {
    const response = await axios.delete(`${BACKEND_API_URL}/api/Job/delete/${id}`);
    return response.data;  // Trả về dữ liệu kết quả xóa
  } catch (error) {
    console.error("Error deleting job:", error);
    throw error;
  }
};

// Hàm cập nhật công việc theo ID
export const updateJob = async (id, jobData) => {
  try {
    const response = await axios.put(`${BACKEND_API_URL}/api/Job/update/${id}`, jobData);
    return response.data;  // Trả về dữ liệu công việc đã cập nhật
  } catch (error) {
    console.error("Error updating job:", error);
    throw error;
  }
};

// Hàm ẩn công việc theo ID
export const hideJob = async (id) => {
  try {
    const response = await axios.put(`${BACKEND_API_URL}/api/Job/hide/${id}`);
    return response.data;  // Trả về dữ liệu kết quả ẩn công việc
  } catch (error) {
    console.error("Error hiding job:", error);
    throw error;
  }
};

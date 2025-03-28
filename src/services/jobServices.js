import axios from "axios";
import qs from "qs";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

// Hàm lấy danh sách công việc theo các tham số tìm kiếm
export const fetchJobs = async (searchParams) => {
  try {
    const response = await axios.get(
      `${BACKEND_API_URL}/api/Job/GetListSearch`,
      {
        params: searchParams,
        paramsSerializer: (params) =>
          qs.stringify(params, {
            skipNulls: true,
            skipEmptyStrings: true,
            arrayFormat: "repeat",
          }),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return { jobs: [], totalPage: 0 };
  }
};
export const fetchJobsForManagement = async (searchParams) => {
  try {
    const response = await axios.get(
        `${BACKEND_API_URL}/api/Job/getAllJobManage`,
      //  `${BACKEND_API_URL}/api/Job/ByEmployer`,
      {
        params: searchParams,
        paramsSerializer: (params) =>
          qs.stringify(params, {
            skipNulls: true,
            skipEmptyStrings: true,
            arrayFormat: "repeat",
          }),
      }
    );
    console.log("dataaaaaaaaaaaaaaaaaaaaaaaaaa", response.data)
    return response.data;
  } catch (error) {
    console.error("Error fetching jobs for management:", error);
    return { jobs: [], totalPage: 0 };
  }
};
// Hàm lấy tất cả công việc
export const getAllJobs = async () => {
  try {
    const response = await axios.get(`${BACKEND_API_URL}/api/Job/getAllJob`);
    return response.data;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw error;
  }
};

export const fetchCandidateDetail = async (candidateId, jobId) => {
  try {
    const response = await axios.get(
      `${BACKEND_API_URL}/api/Application/Job/${jobId}/application/${candidateId}`
    );
    console.log("test", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching candidate detail:", error);
    throw error;
  }
};
export const fetchJobsByUserId = async (userId) => {
  try {
    const response = await axios.get(
      `${BACKEND_API_URL}/api/Job/user/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching jobs by user ID:", error);
    throw error;
  }
};
// Fetch chi tiết của công việc
export const fetchJobDetails = async (jobId) => {
  try {
    const response = await axios.get(`${BACKEND_API_URL}/api/Job/${jobId}`);
    console.log("detail job", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching job details:", error);
    throw error;
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
    return response.data;
  } catch (error) {
    console.error("Error creating job:", error);
    throw error;
  }
};

// Hàm lấy danh sách ứng viên cho công việc theo ID
export const fetchCandidatesForJob = async (jobId) => {
  try {
    const response = await axios.get(
      `${BACKEND_API_URL}/api/Application/Job/${jobId}/applications`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching candidates:", error);
    throw error;
  }
};

// Hàm chấp nhận ứng viên
export const acceptCandidate = async (applicationId, jobId) => {
  try {
    const response = await axios.put(
      `${BACKEND_API_URL}/api/Application/${applicationId}/accept`,
      { jobId }
    );
    console.log("data", response.data);
    return response.data;
  } catch (error) {
    console.error("Error accepting candidate:", error);
    throw error;
  }
};

// Hàm từ chối ứng viên - Updated to include rejection reason
export const rejectCandidate = async (
  applicationId,
  jobId,
  rejectionReason
) => {
  try {
    const response = await axios.put(
      `${BACKEND_API_URL}/api/Application/${applicationId}/reject`,
      {
        jobId,
        rejectionReason,
      }
    );
    console.log("data rej", response.data);
    return response.data;
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
    const response = await axios.delete(
      `${BACKEND_API_URL}/api/Job/delete/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting job:", error);
    throw error;
  }
};

// Hàm cập nhật công việc theo ID
export const updateJob = async (id, jobData) => {
  try {
    const response = await axios.put(
      `${BACKEND_API_URL}/api/Job/update/${id}`,
      jobData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating job:", error);
    throw error;
  }
};

// Hàm ẩn công việc theo ID (cập nhật Status thành JobStatus.Hidden)
export const hideJob = async (id) => {
  try {
    console.log(`Calling hideJob API for job ID: ${id}`);
    const response = await axios.put(`${BACKEND_API_URL}/api/Job/hide/${id}`);
    console.log("Hide job response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error hiding job:", error);
    throw error;
  }
};

// Hàm hiện công việc theo ID (cập nhật Status thành JobStatus.Active)
export const unhideJob = async (id) => {
  try {
    console.log(`Calling unhideJob API for job ID: ${id}`);
    const response = await axios.put(`${BACKEND_API_URL}/api/Job/unhide/${id}`);
    console.log("Unhide job response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error unhiding job:", error);
    throw error;
  }
};

// Hàm gọi API checkApplyStatus
export const checkApplyStatus = async (userId, jobId) => {
  try {
    const response = await axios.get(
      `${BACKEND_API_URL}/api/Application/CheckApplyStatus/${userId}/${jobId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error checking apply to job:", error);
    throw error;
  }
};

// Hàm gọi API ApplyToJob
export const applyToJob = async (userId, jobId) => {
  try {
    const response = await axios.post(
      `${BACKEND_API_URL}/api/Application/ApplyToJob?userId=${userId}&jobId=${jobId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error applying to job:", error);
    throw error;
  }
};
export const fetchJobTags = async () => {
  try {
    const response = await axios.get(`${BACKEND_API_URL}/api/JobTag/getAll`);
    return response.data;
  } catch (error) {
    console.error("Error fetching job tags:", error);
    throw error;
  }
};


export const checkLimitCreateJob = async (userId) => {
  try {
    const response = await axios.get(
      `${BACKEND_API_URL}/api/Job/checkLimitCreateJobPerDay/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error create to job limit:", error);
    throw error;
  }
};
export const toggleJobPriority = async (id) => {
  try {
    console.log(`Toggling priority for job ID: ${id}`);
    const response = await axios.put(`${BACKEND_API_URL}/api/Job/toggle-priority/${id}`);
    console.log("Toggle job priority response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error toggling job priority:", error);
    throw error;
  }
};
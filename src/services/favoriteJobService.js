import axios from "axios";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

// Lấy tất cả công việc đã lưu của người dùng
export const getUserFavoriteJobs = async (userId) => {
  try {
    const response = await axios.get(
      `${BACKEND_API_URL}/api/FavoriteJob/user/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching favorite jobs:", error);
    throw error;
  }
};

// Thêm công việc vào danh sách yêu thích
export const addJobToFavorites = async (userId, jobId) => {
  try {
    const payload = {
      userID: userId,
      jobID: jobId
    };
    const response = await axios.post(
      `${BACKEND_API_URL}/api/FavoriteJob`, 
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error adding job to favorites:", error);
    throw error;
  }
};

// Xóa công việc khỏi danh sách yêu thích
export const removeJobFromFavorites = async (favoriteJobId) => {
  try {
    const response = await axios.delete(
      `${BACKEND_API_URL}/api/FavoriteJob/${favoriteJobId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error removing job from favorites:", error);
    throw error;
  }
};

// Kiểm tra một công việc có nằm trong danh sách yêu thích của người dùng không
export const checkJobIsFavorite = async (userId, jobId) => {
  try {
    const favorites = await getUserFavoriteJobs(userId);
    const isJobFavorite = favorites.some(favorite => favorite.jobID === parseInt(jobId));
    
    // Nếu công việc đã được yêu thích, trả về favoriteJobID để có thể xóa
    if (isJobFavorite) {
      const favoriteJob = favorites.find(favorite => favorite.jobID === parseInt(jobId));
      return {
        isFavorite: true,
        favoriteJobId: favoriteJob.favoriteJobID
      };
    }
    
    return {
      isFavorite: false,
      favoriteJobId: null
    };
  } catch (error) {
    console.error("Error checking if job is favorite:", error);
    return {
      isFavorite: false,
      favoriteJobId: null,
      error: error.message
    };
  }
};
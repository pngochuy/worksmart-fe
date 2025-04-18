import axios from "axios";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || "/api";

/**
 * Ghi nhận một lượt xem mới cho profile công ty
 * @param {string} companyId - ID của công ty
 * @param {string|null} viewerId - ID của người xem (null nếu không đăng nhập)
 * @returns {Promise<Object>} - Kết quả từ API
 */
export const recordProfileView = async (companyId, viewerId = null) => {
  try {
    const response = await axios.post(`${BACKEND_API_URL}/api/profile-views`, {
      companyId,
      viewerId,
      timestamp: new Date()
    });
    return response.data;
  } catch (error) {
    console.error("Error recording profile view:", error);
    throw error;
  }
};

/**
 * Lấy thống kê lượt xem theo khung thời gian
 * @param {string} companyId - ID của công ty
 * @param {number} timeFrame - Khung thời gian (tháng)
 * @returns {Promise<Object>} - Dữ liệu thống kê lượt xem
 */
export const fetchProfileViewStats = async (companyId, timeFrame = 6) => {
  try {
    const response = await axios.get(
      `${BACKEND_API_URL}/api/profile-views/${companyId}?timeFrame=${timeFrame}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching profile views:", error);
    
    // Trả về dữ liệu mẫu nếu API chưa sẵn sàng
    const mockMonthlyData = [];
    const currentDate = new Date();
    let totalViews = 0;
    
    for (let i = timeFrame - 1; i >= 0; i--) {
      const month = new Date(currentDate);
      month.setMonth(currentDate.getMonth() - i);
      
      const monthName = month.toLocaleString('default', { month: 'short' });
      const viewCount = Math.floor(Math.random() * 70) + 30; // Random giữa 30-100
      totalViews += viewCount;
      
      mockMonthlyData.push({
        month: monthName,
        views: viewCount
      });
    }
    
    return {
      monthlyData: mockMonthlyData,
      totalViews: totalViews
    };
  }
};

/**
 * Tạo webhooks cho profile view tracking
 * @param {string} companyId - ID của công ty
 * @param {string} callbackUrl - URL callback khi có lượt xem mới
 * @returns {Promise<Object>} - Kết quả từ API
 */
export const createProfileViewWebhook = async (companyId, callbackUrl) => {
  try {
    const response = await axios.post(`${BACKEND_API_URL}/api/profile-views/webhooks`, {
      companyId,
      callbackUrl
    });
    return response.data;
  } catch (error) {
    console.error("Error creating profile view webhook:", error);
    throw error;
  }
};
import axios from "axios";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL; // Thay thế bằng URL backend thật


const getAccessToken = () => { // Lấy token để Authorization
    const token = localStorage.getItem("accessToken");
    return token ? token.replace(/^"(.*)"$/, "$1") : null;
  };

  export const fetchCompanyProfile = async() =>{
    try {
      const token = getAccessToken();
      if (!token) throw new Error("No Access Token Found!");
  
      const response = await axios.get(`${BACKEND_API_URL}/employers/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data;
      console.log("Data lấy được:", data);
      return {
        ...data,
        isPrivated: data.isPrivated ? "Yes" : "No", // Đổi qua kiểu boolean ở API
      };
    } catch (error) {
      console.error("Error fetching candidate profile:", error);
      // Xử lý lỗi
      if (error.response && error.response.status === 401) {
        alert("⚠ Your session has expired. Please log in again.");
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
      }
      if (error.message.includes("ERR_CONNECTION_REFUSED") || error.code === "ERR_NETWORK") {
        alert("🚫 Unable to connect to server. Please try again later.");
        throw new Error("Cann't connect to server.");
      }
  
      throw error;
    }
  };
  
  //Form Information
  export const updateCompanyProfile = async (profileData) => {
    try {
      const token = getAccessToken();
      if (!token) throw new Error("No access token found");
  
      const updatedData = {
        ...profileData,
        isPrivated: profileData.isPrivated === "Yes" ? true : false, // Đổi qua kiểu boolean ở API
      };
      console.log("Profile data gửi đi:", updatedData);
  
      await axios.put(`${BACKEND_API_URL}/employers/edit-profile`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return "Profile updated successfully!";
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };
  
  //Form Address
  export const updateCompanyAddress = async (addressData) => {
    try {
      const token = getAccessToken();
      if (!token) throw new Error("No access token found");
      console.log("Candidate data gửi đi:", addressData);
  
      await axios.put(`${BACKEND_API_URL}/employers/edit-profile`, addressData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      return "Address updated successfully!";
    } catch (error) {
      console.error("Error updating address:", error);
      throw error;
    }
  };
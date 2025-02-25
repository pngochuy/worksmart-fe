import axios from "axios";

const BACKEND_API_URL = "https://localhost:7141"; // Thay thế bằng URL backend thật

export const registerUser = async (userRegisterData) => {
  try {
    const response = await axios.post(
      `${BACKEND_API_URL}/accounts/register`,
      userRegisterData
    );
    return response.data; // Trả về dữ liệu từ API
  } catch (error) {
    throw error.response?.data || error.message; // Xử lý lỗi
  }
};
export const confirmEmailWithCode = async (confirmEmaildata) => {
  console.log(confirmEmaildata);
  try {
    const response = await axios.post(
      `${BACKEND_API_URL}/accounts/confirmEmail`,
      confirmEmaildata
    );
    return response.data; // Trả về dữ liệu từ API
  } catch (error) {
    throw error.response?.data || error.message; // Xử lý lỗi
  }
};

export const loginUser = async (userLoginData) => {
  try {
    const response = await axios.post(
      `${BACKEND_API_URL}/accounts/login`,
      userLoginData
    );
    if (response.data.token) {
      localStorage.setItem("accessToken", JSON.stringify(response.data.token));
    }
    return response.data;
  } catch (error) {
    throw error.response.data || error.message; // Xử lý lỗi
  }
};

import axios from "axios";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL; // Thay thế bằng URL backend thật

const getAccessToken = () => {
  // Lấy token để Authorization
  const token = localStorage.getItem("accessToken");
  return token ? token.replace(/^"(.*)"$/, "$1") : null;
};

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
    console.log(response.data);
    if (response.data.token) {
      localStorage.setItem("accessToken", JSON.stringify(response.data.token));
    }
    if (response.data.user) {
      localStorage.setItem("userLoginData", JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw error.response.data || error.message; // Xử lý lỗi
  }
};

export const loginUserByGoogle = async (userLoginData) => {
  try {
    const response = await axios.post(
      `${BACKEND_API_URL}/accounts/google-login`,
      userLoginData
    );
    console.log(response.data);
    if (response.data.token) {
      localStorage.setItem("accessToken", JSON.stringify(response.data.token));
    }
    if (response.data.user) {
      localStorage.setItem("userLoginData", JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw error.response.data || error.message; // Xử lý lỗi
  }
};

export const changePassword = async (data) => {
  try {
    const token = getAccessToken();
    if (!token) throw new Error("No access token found");

    const response = await axios.patch(
      `${BACKEND_API_URL}/accounts/changePassword`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Submitting data:", data);
    return response.data;
  } catch (error) {
    console.error(
      "Change Password Error:",
      error.response?.data || error.message
    );
    throw error.response?.data?.message || "Failed to change password!";
  }
};

export const requestChangePasswordOTP = async (email) => {
  try {
    const token = getAccessToken();
    const response = await axios.post(
      `${BACKEND_API_URL}/accounts/changePassword/requestOTP`,
      { email },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Request OTP Error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Failed to send OTP!" };
  }
};

export const verifyChangePasswordOTP = async (email, otp) => {
  try {
    const token = getAccessToken();
    const response = await axios.post(
      `${BACKEND_API_URL}/accounts/changePassword/verifyOTP`,
      { email, otp },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Verify OTP Error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Failed to verify OTP!" };
  }
};

export const confirmChangePassword = async (data) => {
  try {
    const token = getAccessToken();
    console.log("Data sending:", data);
    const response = await axios.post(
      `${BACKEND_API_URL}/accounts/changePassword/confirm`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Change Password Error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Failed to change password!" };
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await axios.post(
      `${BACKEND_API_URL}/accounts/forgotPassword`,
      { email }
    );
    console.log("Submitting email:", email);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Something went wrong!";
  }
};

export const verifyOTP  = async (data) => {
  try {
    const response = await axios.post(
      `${BACKEND_API_URL}/accounts/verifyOTP`, {
        email: data.email,
        otp: data.otp
      }    
    );
    console.log("Submitting data:", data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Something went wrong!";
  }
};

export const resetPassword = async (data) => {
  try {
    const response = await axios.post(
      `${BACKEND_API_URL}/accounts/resetPassword`,{
        email: data.email,
        resetToken: data.resetToken,
        newPassword: data.newPassword
      }
    );
    console.log("Submitting reset data:", { data });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Something went wrong!";
  }
};

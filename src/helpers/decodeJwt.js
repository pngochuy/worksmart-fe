import { jwtDecode } from "jwt-decode";

export const getUserRoleFromToken = () => {
  try {
    const token = localStorage.getItem("accessToken");
    const decoded = jwtDecode(token);
    return decoded.Role; // Lấy giá trị Role từ token
  } catch (error) {
    console.error("Lỗi giải mã token:", error);
    return null;
  }
};

export const getUserRoleName = (roleId) => {
  const roles = {
    1: "Candidate",
    2: "Employer",
    3: "Admin",
  };
  return roles[roleId] || "Unknown";
};

export const getUserLoginData = () => {
  const userLoginData = localStorage.getItem("userLoginData");
  if (userLoginData) {
    try {
      return JSON.parse(userLoginData); // parse string as JSON
    } catch (error) {
      console.error("userLoginData error:", error);
      return null;
    }
  }
  return null;
};

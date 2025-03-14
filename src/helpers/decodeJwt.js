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

export const getUserIdFromToken = () => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;
    const decoded = jwtDecode(token);
    return decoded.UserId || decoded.userId || decoded.id;
  } catch (error) {
    console.error("Lỗi khi giải mã token để lấy userId:", error);
    return null;
  }
};

export const getVerificationLevel = () => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      console.log("Decoded JWT:", decodedToken);
      return Number(decodedToken.VerificationLevel);
    } catch (error) {
      console.error("Error decoding JWT:", error);
      return null;
    }
  }
  return null;
};
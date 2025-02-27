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

export const getUserDetails = () => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    try {
      const decoded = jwtDecode(token);
      return decoded; // Trả về toàn bộ payload có chứa role và các thông tin khác
    } catch (error) {
      console.error("Token decode error:", error);
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

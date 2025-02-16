import { jwtDecode } from "jwt-decode";

export const getUserRoleFromToken = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.Role; // Lấy giá trị Role từ token
  } catch (error) {
    console.error("Lỗi giải mã token:", error);
    return null;
  }
};

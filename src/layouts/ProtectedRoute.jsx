import { Navigate } from "react-router-dom";
import { getUserRoleFromToken } from "../helpers/decodeJwt";
import PropTypes from "prop-types";

export const ProtectedRoute = ({ children, requiredRoleId }) => {
  try {
    const userRoleId = getUserRoleFromToken();

    if (userRoleId !== requiredRoleId) {
      // Nếu không có token hoặc role không đúng, chuyển hướng người dùng
      return <Navigate to="/login" />;
    }
    return children;
  } catch (error) {
    console.error("Lỗi token:", error);
    return null;
  }
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRoleId: PropTypes.string.isRequired,
};

import { Navigate } from "react-router-dom";
import { getUserRoleFromToken } from "../helpers/decodeJwt";
import PropTypes from "prop-types";

export const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem("accessToken");
  const userRole = getUserRoleFromToken(token);

  if (!token || userRole !== requiredRole) {
    // Nếu không có token hoặc role không đúng, chuyển hướng người dùng
    return <Navigate to="/login" />;
  }
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRole: PropTypes.string.isRequired,
};

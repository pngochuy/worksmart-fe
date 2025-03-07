import { NavLink, useLocation } from "react-router-dom";

export const AdminSidebar = () => {
  const location = useLocation();

  const checkActive = (path) => {
    // Kiểm tra nếu path truyền vào trùng với pathname hiện tại
    return location.pathname === path;
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userLoginData");
    window.location.href = "/login";
  };
  return (
    <>
      <ul className="navigation">
        <li className={checkActive("/admin/dashboard") ? "active" : ""}>
          <NavLink to="/admin/dashboard">
            <i className="fa fa-tachometer-alt"></i> Dashboard
          </NavLink>
        </li>
        <li className={checkActive("/admin/users-management") ? "active" : ""}>
          <NavLink to="/admin/users-management">
            <i className="fa-solid fa-users-gear"></i> Users Management
          </NavLink>
        </li>
        <li
          className={
            checkActive("/admin/job-postings-management") ? "active" : ""
          }
        >
          <NavLink to="/admin/job-postings-management">
            <i className="fa-solid fa-briefcase"></i> Job Postings Management
          </NavLink>
        </li>
        <li
          className={
            checkActive("/admin/notifications-management") ? "active" : ""
          }
        >
          <NavLink to="/admin/notifications-management">
            <i className="fa fa-bell"></i> Notifications Management
          </NavLink>
        </li>
        <li className={checkActive("/admin/reports") ? "active" : ""}>
          <NavLink to="/admin/reports">
            <i className="fa fa-chart-line"></i> Reports
          </NavLink>
        </li>
        <li
          className={checkActive("/admin/payments-management") ? "active" : ""}
        >
          <NavLink to="/admin/payments-management">
            <i className="fa fa-credit-card"></i> Payments Management
          </NavLink>
        </li>
        <li
          className={checkActive("/admin/feedbackmanagement") ? "active" : ""}
        >
          <NavLink to="/admin/feedback-management">
            <i className="fa fa-comment-dots"></i> Feedback Management
          </NavLink>
        </li>
        <li
          className={
            checkActive("/admin/subscription-plans-management") ? "active" : ""
          }
        >
          <NavLink to="/admin/subscription-plans-management">
            <i className="fa fa-gift"></i> Subscription Plans Management
          </NavLink>
        </li>
        <li
          className={checkActive("/admin/content-management") ? "active" : ""}
        >
          <NavLink to="/admin/content-management">
            <i className="fa fa-file-alt"></i> Content Management
          </NavLink>
        </li>
        <li onClick={logout}>
          <NavLink>
            <i className="la la-sign-out"></i> Logout
          </NavLink>
        </li>
      </ul>
    </>
  );
};

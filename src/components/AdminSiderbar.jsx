import { NavLink, useLocation } from "react-router-dom";

export const AdminSidebar = () => {
  const location = useLocation();
  const checkActive = (path) => {
    return location.pathname === path;
  };

  const logout = () => {
    localStorage.clear();
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
            <i className="fa-solid fa-briefcase"></i> Jobs Management
          </NavLink>
        </li>
        {/* <li
          className={
            checkActive("/admin/notifications-management") ? "active" : ""
          }
        >
          <NavLink to="/admin/notifications-management">
            <i className="fa fa-bell"></i> Notifications
            {notificationCount > 0 && (
              <span className="notification-badge">{notificationCount}</span>
            )}
          </NavLink>
        </li> */}
        <li className={checkActive("/admin/reports") ? "active" : ""}>
          <NavLink to="/admin/reports">
            <i className="fa fa-chart-line"></i> Reports
          </NavLink>
        </li>
        <li className={checkActive("/admin/transactions") ? "active" : ""}>
          <NavLink to="/admin/transactions">
            <i className="fa fa-money-check"></i> Transactions
          </NavLink>
        </li>
        {/* <li
          className={checkActive("/admin/feedbackmanagement") ? "active" : ""}
        >
          <NavLink to="/admin/feedback-management">
            <i className="fa fa-comment-dots"></i> Feedback Management
          </NavLink>
        </li> */}
        <li
          className={
            checkActive("/admin/subscription-plans-management") ? "active" : ""
          }
        >
          <NavLink to="/admin/subscription-plans-management">
            <i className="fa fa-gift"></i> Plans Management
          </NavLink>
        </li>
        <li className={checkActive("/admin/settings") ? "active" : ""}>
          <NavLink to="/admin/settings">
            <i className="fa fa-cog"></i> Settings
          </NavLink>
        </li>
        <li onClick={logout}>
          <NavLink>
            <i className="la la-sign-out"></i> Logout
          </NavLink>
        </li>
      </ul>

      <style>
        {`
        .notification-badge {
  display: inline-block;
  background-color: #ff4757;
  color: white;
  border-radius: 50%;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  font-size: 12px;
  text-align: center;
  line-height: 18px;
  margin-left: 5px;
  font-weight: bold;
}

        `}
      </style>
    </>
  );
};

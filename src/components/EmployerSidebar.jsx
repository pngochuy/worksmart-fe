import { NavLink, useLocation } from "react-router-dom";
import { useNotifications } from "@/layouts/NotificationProvider";
import { useRef } from "react";

export const EmployerSidebar = () => {
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const signalRConnection = useRef(null);

  const checkActive = (path) => {
    // Kiểm tra nếu path truyền vào trùng với pathname hiện tại
    return location.pathname === path;
  };

  // Logout function
  const logout = () => {
    // Stop SignalR connection before logout
    if (signalRConnection.current) {
      signalRConnection.current
        .stop()
        .then(() => console.log("SignalR connection stopped on logout"))
        .catch((err) =>
          console.error("Error stopping SignalR connection on logout:", err)
        );
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("userLoginData");
    window.location.href = "/login";
  };

  return (
    <>
      <ul className="navigation">
        <li className={checkActive("/employer/dashboard") ? "active" : ""}>
          <NavLink to="/employer/dashboard">
            <i className="la la-home"></i> Dashboard
          </NavLink>
        </li>
        <li
          className={checkActive("/employer/company-profile") ? "active" : ""}
        >
          <NavLink to="/employer/company-profile">
            <i className="la la-user-tie"></i>Company Profile
          </NavLink>
        </li>
        <li className={checkActive("/employer/post-job") ? "active" : ""}>
          <NavLink to="/employer/post-job">
            <i className="la la-paper-plane"></i>Post Job
          </NavLink>
        </li>
        <li className={checkActive("/employer/manage-jobs") ? "active" : ""}>
          <NavLink to="/employer/manage-jobs">
            <i className="la la-briefcase"></i> Manage Jobs
          </NavLink>
        </li>
        <li className={checkActive("/employer/proposed-cvs") ? "active" : ""}>
          <NavLink to="/employer/proposed-cvs">
            <i className="la la-thumbs-up"></i> Proposed CVs
          </NavLink>
        </li>
        <li className={checkActive("/employer/all-candidates") ? "active" : ""}>
          <NavLink to="/employer/all-candidates">
            <i className="la la-file-invoice"></i> All Candidates
          </NavLink>
        </li>
        <li
          className={checkActive("/employer/shortlisted-cvs") ? "active" : ""}
        >
          <NavLink to="/employer/shortlisted-cvs">
            <i className="la la-bookmark-o"></i>Shortlisted CVs
          </NavLink>
        </li>
        <li
          className={
            checkActive("/employer/subscription-plans") ? "active" : ""
          }
        >
          <NavLink to="/employer/subscription-plans">
            <i className="la la-box"></i>Subscription Plans
          </NavLink>
        </li>
        <li
          className={
            checkActive("/employer/transaction-history") ? "active" : ""
          }
        >
          <NavLink to="/employer/transaction-history">
            <i className="la la-credit-card"></i>Transaction History
          </NavLink>
        </li>
        <li className={checkActive("/employer/messages") ? "active" : ""}>
          <NavLink to="/employer/messages">
            <i className="la la-comment-o"></i>Messages
          </NavLink>
        </li>
        <li className={checkActive("/employer/notifications") ? "active" : ""}>
          <NavLink to="/employer/notifications">
            <i className="la la-bell"></i>Notifications
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </NavLink>
        </li>
        <li
          className={checkActive("/employer/change-password") ? "active" : ""}
        >
          <NavLink to="/employer/change-password">
            <i className="la la-lock"></i>Change Password
          </NavLink>
        </li>
        <li className={checkActive("/employer/settings") ? "active" : ""}>
          <NavLink to="/employer/settings">
            <i className="la la-cog"></i>Settings
          </NavLink>
        </li>
        <li>
          <NavLink to="#" onClick={(e) => {
            e.preventDefault();
            logout();
          }}>
            <i className="la la-sign-out"></i>Logout
          </NavLink>
        </li>
        {/* <li>
          <NavLink to="index.html">
            <i className="la la-trash"></i>Delete Profile
          </NavLink>
        </li> */}
      </ul>

      <style>
        {`
        .navigation li {
          position: relative;
        }
        
        .notification-badge {
          position: absolute;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background-color: #FF3366;
          color: white;
          border-radius: 50%;
          height: 20px;
          min-width: 20px;
          font-size: 11px;
          font-weight: bold;
          padding: 0 4px;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        
        /* Nếu số lượng thông báo lớn (2 chữ số trở lên) */
        .notification-badge:not([data-count="1"]) {
          border-radius: 10px;
        }
        `}
      </style>
    </>
  );
};

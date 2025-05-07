import { NavLink, useLocation } from "react-router-dom";
import { useNotifications } from "@/layouts/NotificationProvider";
import { useRef } from "react";

export const CandidateSidebar = ({ onLinkClick }) => {
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const signalRConnection = useRef(null);

  const checkActive = (path) => {
    return location.pathname === path;
  };

  const handleLinkClick = () => {
    // Close sidebar on mobile when clicking a link
    if (window.innerWidth < 769 && onLinkClick) {
      onLinkClick();
    }
  };

  // Logout function
  const logout = () => {
    // First close the sidebar on mobile
    handleLinkClick();

    // Then handle logout
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
        <li className={checkActive("/candidate/dashboard") ? "active" : ""}>
          <NavLink to="/candidate/dashboard" onClick={handleLinkClick}>
            <i className="la la-home"></i> Dashboard
          </NavLink>
        </li>
        <li className={checkActive("/candidate/my-profile") ? "active" : ""}>
          <NavLink to="/candidate/my-profile" onClick={handleLinkClick}>
            <i className="la la-user-tie"></i>My Profile
          </NavLink>
        </li>
        <li className={checkActive("/candidate/my-cv") ? "active" : ""}>
          <NavLink to="/candidate/my-cv" onClick={handleLinkClick}>
            <i className="la la-file-invoice"></i>My CV
          </NavLink>
        </li>
        <li className={checkActive("/candidate/applied-jobs") ? "active" : ""}>
          <NavLink to="/candidate/applied-jobs" onClick={handleLinkClick}>
            <i className="la la-briefcase"></i> Applied Jobs{" "}
          </NavLink>
        </li>
        <li
          className={
            checkActive("/candidate/category-tag-management") ? "active" : ""
          }
        >
          <NavLink to="/candidate/category-tag-management" onClick={handleLinkClick}>
            <i className="la la-briefcase"></i> Category Tags{" "}
          </NavLink>
        </li>
        <li className={checkActive("/candidate/saved-jobs") ? "active" : ""}>
          <NavLink to="/candidate/saved-jobs" onClick={handleLinkClick}>
            <i className="la la-bookmark-o"></i>Saved Jobs
          </NavLink>
        </li>
        <li
          className={
            checkActive("/candidate/subscription-plans") ? "active" : ""
          }
        >
          <NavLink to="/candidate/subscription-plans" onClick={handleLinkClick}>
            <i className="la la-box"></i>Subscription Plans
          </NavLink>
        </li>
        <li
          className={
            checkActive("/candidate/transaction-history") ? "active" : ""
          }
        >
          <NavLink to="/candidate/transaction-history" onClick={handleLinkClick}>
            <i className="la la-credit-card"></i>Transaction History
          </NavLink>
        </li>
        <li className={checkActive("/candidate/messages") ? "active" : ""}>
          <NavLink to="/candidate/messages" onClick={handleLinkClick}>
            <i className="la la-comment-o"></i>Messages
          </NavLink>
        </li>
        <li className={checkActive("/candidate/notifications") ? "active" : ""}>
          <NavLink to="/candidate/notifications" onClick={handleLinkClick}>
            <i className="la la-bell"></i>Notifications
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </NavLink>
        </li>
        <li
          className={checkActive("/candidate/change-password") ? "active" : ""}
        >
          <NavLink to="/candidate/change-password" onClick={handleLinkClick}>
            <i className="la la-lock"></i>Change Password
          </NavLink>
        </li>
        <li className={checkActive("/candidate/settings") ? "active" : ""}>
          <NavLink to="/candidate/settings" onClick={handleLinkClick}>
            <i className="la la-cog"></i>Settings
          </NavLink>
        </li>
        <li>
          <NavLink
            to="#"
            onClick={(e) => {
              e.preventDefault();
              logout();
            }}
          >
            <i className="la la-sign-out"></i>Logout
          </NavLink>
        </li>
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
        
        .notification-badge:not([data-count="1"]) {
          border-radius: 10px;
        }
        `}
      </style>
    </>
  );
};

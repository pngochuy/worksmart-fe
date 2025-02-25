import { NavLink, useLocation } from "react-router-dom";

export const EmployerSidebar = () => {
  const location = useLocation();

  const checkActive = (path) => {
    // Kiểm tra nếu path truyền vào trùng với pathname hiện tại
    return location.pathname === path;
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
        <li className={checkActive("/employer/all-candidates") ? "active" : ""}>
          <NavLink to="/employer/all-candidates">
            <i className="la la-file-invoice"></i> All Candidates
          </NavLink>
        </li>
        <li className={checkActive("/employer/saved-cvs") ? "active" : ""}>
          <NavLink to="/employer/saved-cvs">
            <i className="la la-bookmark-o"></i>Saved CVs
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
        <li className={checkActive("/employer/messages") ? "active" : ""}>
          <NavLink to="/employer/messages">
            <i className="la la-comment-o"></i>Messages
          </NavLink>
        </li>
        <li className={checkActive("/employer/notifications") ? "active" : ""}>
          <NavLink to="/employer/notifications">
            <i className="la la-bell"></i>Notifications
          </NavLink>
        </li>
        <li
          className={checkActive("/employer/change-password") ? "active" : ""}
        >
          <NavLink to="/employer/change-password">
            <i className="la la-lock"></i>Change Password
          </NavLink>
        </li>
        <li>
          <NavLink to="index.html">
            <i className="la la-sign-out"></i>Logout
          </NavLink>
        </li>
        <li>
          <NavLink to="index.html">
            <i className="la la-trash"></i>Delete Profile
          </NavLink>
        </li>
      </ul>
    </>
  );
};

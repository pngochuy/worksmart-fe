import { NavLink, useLocation } from "react-router-dom";

export const CandidateSidebar = () => {
  const location = useLocation();

  const checkActive = (path) => {
    // Kiểm tra nếu path truyền vào trùng với pathname hiện tại
    return location.pathname === path;
  };
  return (
    <>
      <ul className="navigation">
        <li className={checkActive("/candidate/dashboard") ? "active" : ""}>
          <NavLink to="/candidate/dashboard">
            <i className="la la-home"></i> Dashboard
          </NavLink>
        </li>
        <li className={checkActive("/candidate/my-profile") ? "active" : ""}>
          <NavLink to="/candidate/my-profile">
            <i className="la la-user-tie"></i>My Profile
          </NavLink>
        </li>
        <li className={checkActive("/candidate/my-cv") ? "active" : ""}>
          <NavLink to="/candidate/my-cv">
            <i className="la la-file-invoice"></i>My CV
          </NavLink>
        </li>
        <li className={checkActive("/candidate/applied-jobs") ? "active" : ""}>
          <NavLink to="/candidate/applied-jobs">
            <i className="la la-briefcase"></i> Applied Jobs{" "}
          </NavLink>
        </li>
        <li
          className={
            checkActive("/candidate/category-tag-management") ? "active" : ""
          }
        >
          <NavLink to="/candidate/category-tag-management">
            <i className="la la-briefcase"></i> Category Tags{" "}
          </NavLink>
        </li>
        <li className={checkActive("/candidate/job-alerts") ? "active" : ""}>
          <NavLink to="/candidate/job-alerts">
            <i className="la la-bell"></i>Job Alerts
          </NavLink>
        </li>
        <li className={checkActive("/candidate/saved-jobs") ? "active" : ""}>
          <NavLink to="/candidate/saved-jobs">
            <i className="la la-bookmark-o"></i>Saved Jobs
          </NavLink>
        </li>
        <li
          className={
            checkActive("/candidate/subscription-plans") ? "active" : ""
          }
        >
          <NavLink to="/candidate/subscription-plans">
            <i className="la la-box"></i>Subscription Plans
          </NavLink>
        </li>
        <li className={checkActive("/candidate/messages") ? "active" : ""}>
          <NavLink to="/candidate/messages">
            <i className="la la-comment-o"></i>Messages
          </NavLink>
        </li>
        <li className={checkActive("/candidate/notifications") ? "active" : ""}>
          <NavLink to="/candidate/notifications">
            <i className="la la-bell"></i>Notifications
          </NavLink>
        </li>
        <li
          className={checkActive("/candidate/change-password") ? "active" : ""}
        >
          <NavLink to="/candidate/change-password">
            <i className="la la-lock"></i>Change Password
          </NavLink>
        </li>
        <li>
          <NavLink to="index.html">
            <i className="la la-sign-out"></i>Logout
          </NavLink>
        </li>
        <li
          className={checkActive("/candidate/delete-profile") ? "active" : ""}
        >
          <NavLink to="dashboard-delete.html">
            <i className="la la-trash"></i>Delete Profile
          </NavLink>
        </li>
      </ul>

      {/* <div className="skills-percentage">
        <h4>Skills Percentage</h4>
        <p>
          Put value for &qout;Cover Image&qout; field to increase your skill up
          to &qout;85%&qout;
        </p>
      </div> */}
    </>
  );
};

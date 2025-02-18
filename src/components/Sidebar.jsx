import { NavLink, useLocation } from "react-router-dom";

export const Sidebar = () => {
  const location = useLocation();

  const checkActive = (path) => {
    // Kiểm tra nếu path truyền vào trùng với pathname hiện tại
    return location.pathname === path;
  };
  return (
    <>
      {/* User Sidebar */}
      <div className="user-sidebar">
        <div className="sidebar-inner" style={{ paddingTop: "70px" }}>
          <ul className="navigation">
            <li className={checkActive("/candidate/dashboard") ? "active" : ""}>
              <NavLink to="/candidate/dashboard">
                <i className="la la-home"></i> Dashboard
              </NavLink>
            </li>
            <li
              className={checkActive("/candidate/my-profile") ? "active" : ""}
            >
              <NavLink to="/candidate/my-profile">
                <i className="la la-user-tie"></i>My Profile
              </NavLink>
            </li>
            <li className={checkActive("/candidate/my-cv") ? "active" : ""}>
              <a href="/candidate/my-cv">
                <i className="la la-file-invoice"></i>My CV
              </a>
            </li>
            <li
              className={checkActive("/candidate/applied-jobs") ? "active" : ""}
            >
              <a href="/candidate/applied-jobs">
                <i className="la la-briefcase"></i> Applied Jobs{" "}
              </a>
            </li>
            <li
              className={checkActive("/candidate/job-alerts") ? "active" : ""}
            >
              <a href="/candidate/job-alerts">
                <i className="la la-bell"></i>Job Alerts
              </a>
            </li>
            <li
              className={checkActive("/candidate/saved-jobs") ? "active" : ""}
            >
              <a href="/candidate/saved-jobs">
                <i className="la la-bookmark-o"></i>Saved Jobs
              </a>
            </li>
            <li className={checkActive("/candidate/packages") ? "active" : ""}>
              <a href="/candidate/packages">
                <i className="la la-box"></i>Packages
              </a>
            </li>
            <li className={checkActive("/candidate/messages") ? "active" : ""}>
              <a href="/candidate/messages">
                <i className="la la-comment-o"></i>Messages
              </a>
            </li>
            <li
              className={
                checkActive("/candidate/change-password") ? "active" : ""
              }
            >
              <a href="/candidate/change-password">
                <i className="la la-lock"></i>Change Password
              </a>
            </li>
            <li>
              <a href="index.html">
                <i className="la la-sign-out"></i>Logout
              </a>
            </li>
            <li
              className={
                checkActive("/candidate/delete-profile") ? "active" : ""
              }
            >
              <a href="dashboard-delete.html">
                <i className="la la-trash"></i>Delete Profile
              </a>
            </li>
          </ul>

          <div className="skills-percentage">
            <h4>Skills Percentage</h4>
            <p>
              Put value for &qout;Cover Image&qout; field to increase your skill
              up to &qout;85%&qout;
            </p>

            {/* Pie Graph */}
          </div>
        </div>
      </div>
      {/* End User Sidebar */}
    </>
  );
};

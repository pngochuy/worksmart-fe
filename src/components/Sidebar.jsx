import { NavLink, useLocation } from "react-router-dom";

export const Sidebar = () => {
  const location = useLocation();

  // Kiểm tra pathname để xác định sidebar nào sẽ được hiển thị
  const isCandidate = location.pathname.startsWith("/candidate");
  const isEmployer = location.pathname.startsWith("/employer");

  const checkActive = (path) => {
    // Kiểm tra nếu path truyền vào trùng với pathname hiện tại
    return location.pathname === path;
  };
  return (
    <>
      <div className="user-sidebar">
        <div className="sidebar-inner" style={{ paddingTop: "70px" }}>
          {/* Candidate Sidebar */}
          {isCandidate && (
            <>
              <ul className="navigation">
                <li
                  className={
                    checkActive("/candidate/dashboard") ? "active" : ""
                  }
                >
                  <NavLink to="/candidate/dashboard">
                    <i className="la la-home"></i> Dashboard
                  </NavLink>
                </li>
                <li
                  className={
                    checkActive("/candidate/my-profile") ? "active" : ""
                  }
                >
                  <NavLink to="/candidate/my-profile">
                    <i className="la la-user-tie"></i>My Profile
                  </NavLink>
                </li>
                <li className={checkActive("/candidate/my-cv") ? "active" : ""}>
                  <NavLink to="/candidate/my-cv">
                    <i className="la la-file-invoice"></i>My CV
                  </NavLink>
                </li>
                <li
                  className={
                    checkActive("/candidate/applied-jobs") ? "active" : ""
                  }
                >
                  <NavLink to="/candidate/applied-jobs">
                    <i className="la la-briefcase"></i> Applied Jobs{" "}
                  </NavLink>
                </li>
                <li
                  className={
                    checkActive("/candidate/job-alerts") ? "active" : ""
                  }
                >
                  <NavLink to="/candidate/job-alerts">
                    <i className="la la-bell"></i>Job Alerts
                  </NavLink>
                </li>
                <li
                  className={
                    checkActive("/candidate/saved-jobs") ? "active" : ""
                  }
                >
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
                <li
                  className={checkActive("/candidate/messages") ? "active" : ""}
                >
                  <NavLink to="/candidate/messages">
                    <i className="la la-comment-o"></i>Messages
                  </NavLink>
                </li>
                <li
                  className={
                    checkActive("/candidate/notifications") ? "active" : ""
                  }
                >
                  <NavLink to="/candidate/notifications">
                    <i className="la la-bell"></i>Notifications
                  </NavLink>
                </li>
                <li
                  className={
                    checkActive("/candidate/change-password") ? "active" : ""
                  }
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
                  className={
                    checkActive("/candidate/delete-profile") ? "active" : ""
                  }
                >
                  <NavLink to="dashboard-delete.html">
                    <i className="la la-trash"></i>Delete Profile
                  </NavLink>
                </li>
              </ul>

              <div className="skills-percentage">
                <h4>Skills Percentage</h4>
                <p>
                  Put value for &qout;Cover Image&qout; field to increase your
                  skill up to &qout;85%&qout;
                </p>

                {/* Pie Graph */}
              </div>
            </>
          )}
          {/* End Candidate Sidebar */}

          {/* Employer Sidebar */}
          {isEmployer && (
            <>
              <ul className="navigation">
                <li className="active">
                  <NavLink to="dashboard.html">
                    <i className="la la-home"></i> Dashboard
                  </NavLink>
                </li>
                <li>
                  <NavLink to="dashboard-company-profile.html">
                    <i className="la la-user-tie"></i>Company Profile
                  </NavLink>
                </li>
                <li>
                  <NavLink to="dashboard-post-job.html">
                    <i className="la la-paper-plane"></i>Post a New Job
                  </NavLink>
                </li>
                <li>
                  <NavLink to="dashboard-manage-job.html">
                    <i className="la la-briefcase"></i> Manage Jobs{" "}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="dashboard-applicants.html">
                    <i className="la la-file-invoice"></i> All Applicants
                  </NavLink>
                </li>
                <li>
                  <NavLink to="dashboard-resumes.html">
                    <i className="la la-bookmark-o"></i>Shortlisted Resumes
                  </NavLink>
                </li>
                <li>
                  <NavLink to="dashboard-packages.html">
                    <i className="la la-box"></i>Packages
                  </NavLink>
                </li>
                <li>
                  <NavLink to="dashboard-messages.html">
                    <i className="la la-comment-o"></i>Messages
                  </NavLink>
                </li>
                <li>
                  <NavLink to="dashboard-resume-alerts.html">
                    <i className="la la-bell"></i>Resume Alerts
                  </NavLink>
                </li>
                <li>
                  <NavLink to="dashboard-change-password.html">
                    <i className="la la-lock"></i>Change Password
                  </NavLink>
                </li>
                <li>
                  <NavLink to="dashboard-company-profile.html">
                    <i className="la la-user-alt"></i>View Profile
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
          )}
          {/* End Employer Sidebar */}
        </div>
      </div>
    </>
  );
};

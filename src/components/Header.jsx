import { useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import { useEffect, useState } from "react";
import { getUserLoginData, getUserRoleFromToken } from "../helpers/decodeJwt";

export const Header = () => {
  const location = useLocation();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [userRole, setUserRole] = useState(null); // State lưu role người dùng
  const [userDataLogin, setUserDataLogin] = useState(null); // State lưu người dùng đăng nhập

  useEffect(() => {
    const role = getUserRoleFromToken(); // Lấy role từ token
    setUserRole(role); // Cập nhật state với role người dùng
    const user = getUserLoginData();
    setUserDataLogin(user);
  }, []);

  useEffect(() => {
    // Lấy danh sách tất cả các dropdown
    const dropdowns = document.querySelectorAll(".nav .dropdown");

    dropdowns.forEach((dropdown) => {
      const links = dropdown.querySelectorAll("a");
      const isActive = Array.from(links).some(
        (link) => link.getAttribute("href") === location.pathname
      );

      if (isActive) {
        setActiveDropdown(dropdown);
      }
    });
  }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem("accessToken");
    window.location.href = "/login";
  };

  return (
    <>
      {/* Main Header*/}
      <header className="main-header border-bottom-1">
        {/* Main box */}
        <div className="main-box">
          {/*Nav Outer */}
          <div className="nav-outer">
            <div className="logo-box">
              <div className="logo">
                <a href="/">
                  <img
                    src={logo}
                    alt=""
                    style={{ width: "154px", height: "90px" }}
                    title=""
                  />
                </a>
              </div>
            </div>

            <nav className="nav main-menu">
              <ul className="navigation" id="navbar">
                <li
                  className={`dropdown ${
                    activeDropdown?.innerText.includes("Jobs") ? "current" : ""
                  }`}
                >
                  <span>Jobs</span>
                  <ul>
                    <li>
                      <a href="/job-list">Job List</a>
                    </li>
                    <li>
                      <a href="/suitable-jobs">Suitable Jobs</a>
                    </li>
                    <li>
                      <a href="/it-jobs">IT Jobs</a>
                    </li>
                  </ul>
                </li>
                <li
                  className={`dropdown ${
                    activeDropdown?.innerText.includes("Company")
                      ? "current"
                      : ""
                  }`}
                >
                  <span>Company</span>
                  <ul>
                    <li>
                      <a href="/company-list">Company List</a>
                    </li>
                    <li>
                      <a href="blog-list-v1.html">Top Company</a>
                    </li>
                  </ul>
                </li>
                <li
                  className={`dropdown ${
                    activeDropdown?.innerText.includes("Profile & CV")
                      ? "current"
                      : ""
                  }`}
                >
                  <span>Profile & CV</span>
                  <ul>
                    <li>
                      <a href="candidate/create-cv">Create CV</a>
                    </li>
                    <li>
                      <a href="candidate/manage-cv">Manage CV</a>
                    </li>
                  </ul>
                </li>
                {userRole === "Employer" && (
                  <li
                    className={`dropdown ${
                      activeDropdown?.innerText.includes("Candidates")
                        ? "current"
                        : ""
                    }`}
                  >
                    <span>Candidates</span>
                    <ul>
                      <li>
                        <a href="/candidate-list">Candidate List</a>
                      </li>
                    </ul>
                  </li>
                )}
              </ul>
            </nav>
            {/* Main Menu End*/}
          </div>

          <div className="outer-box">
            {userRole != null ? (
              <>
                {userRole === "Employer" && (
                  <a
                    href="/employer/create-job"
                    className="theme-btn btn-style-one"
                  >
                    Post a Job
                  </a>
                )}
                {userRole === "Candidate" && (
                  <a href="/candidate/job-alerts" className="menu-btn">
                    <span className="count" style={{ textAlign: "center" }}>
                      1
                    </span>
                    <span className="icon la la-heart-o"></span>
                  </a>
                )}

                <a
                  href={`/${userRole.toLowerCase()}/notifications`}
                  className="menu-btn"
                >
                  <span className="count" style={{ textAlign: "center" }}>
                    1
                  </span>

                  <span className="icon la la-bell"></span>
                </a>

                {/* Dashboard Option */}
                <div className="dashboard-option">
                  <a className="dropdown-toggle" role="button">
                    <img
                      src={
                        userDataLogin?.avatar
                          ? userDataLogin.avatar
                          : "https://ui-avatars.com/api/?name=John+Doe"
                      }
                      alt="avatar"
                      className="thumb"
                    />
                    <span className="name">{userDataLogin?.fullName}</span>
                  </a>
                  <ul className="dropdown-menu">
                    <li>
                      <a
                        href={
                          userRole
                            ? `/${userRole.toLowerCase()}/dashboard`
                            : "test"
                        }
                      >
                        Dashboard
                      </a>
                    </li>
                    <li>
                      <a onClick={logout}>Logout</a>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <a href="candidate/create-cv" className="upload-cv">
                  Upload your CV
                </a>
                <div className="btn-box">
                  <a
                    href="/login"
                    className="theme-btn btn-style-three call-modal"
                  >
                    Login / Register
                  </a>
                  <a
                    href="employer/create-job"
                    className="theme-btn btn-style-one"
                  >
                    Job Post
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
      {/* End Main Header */}
    </>
  );
};

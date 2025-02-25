import { useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import { useEffect, useState } from "react";
import { getUserRoleFromToken } from "../helpers/decodeJwt";
import userAvatar from "../assets/images/resource/company-6.png";

export const Header = () => {
  const location = useLocation();
  const [activeDropdown, setActiveDropdown] = useState(null);

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
                      <a href="/create-cv">Create CV</a>
                    </li>
                    <li>
                      <a href="/upload-cv">Upload CV</a>
                    </li>
                    <li>
                      <a href="/manage-cv">Manage CV</a>
                    </li>
                  </ul>
                </li>
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

                {/* Only for Mobile View */}
                <li className="mm-add-listing">
                  <a
                    href="add-listing.html"
                    className="theme-btn btn-style-one"
                  >
                    Job Post
                  </a>
                  <span>
                    <span className="contact-info">
                      <span className="phone-num">
                        <span>Call us</span>
                        <a href="tel:1234567890">123 456 7890</a>
                      </span>
                      <span className="address">
                        329 Queensberry Street, North Melbourne VIC <br />
                        3051, Australia.
                      </span>
                      <a href="mailto:support@superio.com" className="email">
                        support@superio.com
                      </a>
                    </span>
                    <span className="social-links">
                      <a href="#">
                        <span className="fab fa-facebook-f"></span>
                      </a>
                      <a href="#">
                        <span className="fab fa-twitter"></span>
                      </a>
                      <a href="#">
                        <span className="fab fa-instagram"></span>
                      </a>
                      <a href="#">
                        <span className="fab fa-linkedin-in"></span>
                      </a>
                    </span>
                  </span>
                </li>
              </ul>
            </nav>
            {/* Main Menu End*/}
          </div>

          <div className="outer-box">
            <button className="menu-btn">
              <span className="count">1</span>
              <span className="icon la la-heart-o"></span>
            </button>

            <button className="menu-btn">
              <span className="icon la la-bell"></span>
            </button>

            {/* Dashboard Option */}
            <div className="dashboard-option">
              <a className="dropdown-toggle" role="button">
                <img src={userAvatar} alt="avatar" className="thumb" />
                <span className="name">My Account</span>
              </a>
              <ul className="dropdown-menu">
                <li>
                  <a href="/dashboard">Dashboard</a>
                </li>
                <li>
                  <a onClick={logout}>Logout</a>
                </li>
              </ul>

              {/* <a href="/create-cv" className="upload-cv">
                Upload your CV
              </a>
              <div className="btn-box">
                <a
                  href="/login"
                  className="theme-btn btn-style-three call-modal"
                >
                  Login / Register
                </a>
                <a href="/create-job" className="theme-btn btn-style-one">
                  Job Post
                </a>
              </div> */}
            </div>
          </div>
        </div>
      </header>
      {/* End Main Header */}
    </>
  );
};

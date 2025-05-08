/* eslint-disable react/prop-types */
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { useEffect, useState } from "react";
import { getUserRoleFromToken } from "../helpers/decodeJwt";

export const MainLayout = ({ children }) => {
  const [isMobileMenuVisible, setIsMobileMenuVisible] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const role = getUserRoleFromToken();
    setUserRole(role);

    // Cleanup mobile menu when component unmounts
    return () => {
      document.body.classList.remove("mobile-menu-visible");
    };
  }, []);

  // Thêm useEffect mới vào đây để xử lý click vào dropdown trong mobile menu
  useEffect(() => {
    // Xử lý click vào dropdown trong mobile menu
    const handleMobileDropdownClick = () => {
      const dropdowns = document.querySelectorAll(
        ".navigation-mobile .dropdown > span"
      );

      dropdowns.forEach((dropdown) => {
        dropdown.addEventListener("click", function () {
          this.parentElement.classList.toggle("active");
        });
      });
    };

    handleMobileDropdownClick();

    return () => {
      // Cleanup event listeners
      const dropdowns = document.querySelectorAll(
        ".navigation-mobile .dropdown > span"
      );
      dropdowns.forEach((dropdown) => {
        dropdown.removeEventListener("click", function () {
          this.parentElement.classList.toggle("active");
        });
      });
    };
  }, []);

  const closeMobileMenu = () => {
    document.body.classList.remove("mobile-menu-visible");
    setIsMobileMenuVisible(false);
  };

  return (
    <>
      <div className="page-wrapper">
        {/* Mobile Menu Backdrop */}
        <div className="sidebar-backdrop" onClick={closeMobileMenu}></div>

        {/* Mobile Menu Drawer */}
        <div className="mobile-menu">
          <div className="close-btn" onClick={closeMobileMenu}>
            <i className="fa-solid fa-times-circle"></i>
          </div>

          <nav className="mobile-nav">
            <ul className="navigation-mobile">
              <li className="dropdown">
                <span>Jobs</span>
                <ul>
                  <li>
                    <a href="/job-list" onClick={closeMobileMenu}>
                      Job List
                    </a>
                  </li>
                  {userRole !== "Employer" && (
                    <li>
                      <a href="/suitable-jobs" onClick={closeMobileMenu}>
                        Suitable Jobs
                      </a>
                    </li>
                  )}
                </ul>
              </li>
              <li className="dropdown">
                <span>Company</span>
                <ul>
                  <li>
                    <a href="/company-list" onClick={closeMobileMenu}>
                      Company List
                    </a>
                  </li>
                </ul>
              </li>
              {userRole === "Candidate" && (
                <li className="dropdown">
                  <span>Profile & CV</span>
                  <ul>
                    <li>
                      <a href="/candidate/my-cv" onClick={closeMobileMenu}>
                        Create CV
                      </a>
                    </li>
                    <li>
                      <a href="/candidate/my-cv" onClick={closeMobileMenu}>
                        Manage CV
                      </a>
                    </li>
                  </ul>
                </li>
              )}
              {userRole === "Employer" && (
                <li className="dropdown">
                  <span>Candidates</span>
                  <ul>
                    <li>
                      <a href="/candidate-list" onClick={closeMobileMenu}>
                        Candidate List
                      </a>
                    </li>
                  </ul>
                </li>
              )}
              {!userRole ? (
                <li className="auth-buttons">
                  <a
                    href="/login"
                    className="menu-btn"
                    onClick={closeMobileMenu}
                  >
                    Login / Register
                  </a>
                  <a
                    href="/employer/post-job"
                    className="menu-btn"
                    onClick={closeMobileMenu}
                  >
                    Post a Job
                  </a>
                </li>
              ) : (
                <li className="dashboard-link">
                  <a
                    href={`/${userRole.toLowerCase()}/dashboard`}
                    onClick={closeMobileMenu}
                  >
                    <i className="fa-solid fa-tachometer-alt mr-2"></i>
                    Dashboard
                  </a>
                </li>
              )}
            </ul>
          </nav>
        </div>

        {/* Main Header */}
        <Header />

        {children}

        {/* Main Footer */}
        <Footer />
      </div>
    </>
  );
};

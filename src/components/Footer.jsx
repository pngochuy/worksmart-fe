import { useEffect } from "react";
import logo from "../assets/logo.png";

export const Footer = () => {
  useEffect(() => {
    const scrollButton = document.querySelector(".scroll-to-top");
    const handleScroll = () => {
      if (window.scrollY > 200) {
        scrollButton.classList.add("show");
      } else {
        scrollButton.classList.remove("show");
      }
    };

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

    scrollButton.addEventListener("click", scrollToTop);
    window.addEventListener("scroll", handleScroll);

    return () => {
      scrollButton.removeEventListener("click", scrollToTop);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <footer className="main-footer alternate">
      <div className="auto-container">
        {/*Widgets Section*/}
        <div className="widgets-section">
          <div className="row">
            <div className="big-column col-xl-4 col-lg-3 col-md-12">
              <div className="footer-column about-widget">
                <div className="logo">
                  <a href="#">
                    <img
                      src={logo}
                      style={{ width: "154px", height: "90px" }}
                      alt=""
                    />
                  </a>
                </div>
                <p className="phone-num">
                  <span>Call us </span>
                  <a href="tel:+84901234567">+84 944395357</a>
                </p>
                <p className="address">
                  FPT Technology Park, Hoa Hai Ward, Ngu Hanh Son District,
                  <br /> Da Nang City, Viet Nam. <br />
                  <a href="mailto:admin@worksmart.com" className="email">
                    admin@worksmart.com
                  </a>
                </p>
              </div>
            </div>

            <div className="big-column col-xl-8 col-lg-9 col-md-12">
              <div className="row">
                <div className="footer-column col-lg-3 col-md-6 col-sm-12">
                  <div className="footer-widget links-widget">
                    <h4 className="widget-title">For Candidates</h4>
                    <div className="widget-content">
                      <ul className="list">
                        <li>
                          <a href="/job-list">Browse Jobs</a>
                        </li>
                        <li>
                          <a href="/company-list">Browse Companies</a>
                        </li>
                        <li>
                          <a href="/candidate/dashboard">Candidate Dashboard</a>
                        </li>
                        <li>
                          <a href="/candidate/job-alerts">Job Alerts</a>
                        </li>
                        <li>
                          <a href="/candidate/saved-jobs">My Favourites</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="footer-column col-lg-3 col-md-6 col-sm-12">
                  <div className="footer-widget links-widget">
                    <h4 className="widget-title">For Employers</h4>
                    <div className="widget-content">
                      <ul className="list">
                        <li>
                          <a href="/candidate-list">Browse Candidates</a>
                        </li>
                        <li>
                          <a href="/employer/dashboard">Employer Dashboard</a>
                        </li>
                        <li>
                          <a href="/employer/post-job">Add Job</a>
                        </li>
                        <li>
                          <a href="/employer/package-list">Job Packages</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="footer-column col-lg-3 col-md-6 col-sm-12">
                  <div className="footer-widget links-widget">
                    <h4 className="widget-title">About Us</h4>
                    <div className="widget-content">
                      <ul className="list">
                        <li>
                          <a href="#">Job Page</a>
                        </li>
                        <li>
                          <a href="#">Resume Page</a>
                        </li>
                        <li>
                          <a href="#">Blog</a>
                        </li>
                        <li>
                          <a href="/contact">Contact</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="footer-column col-lg-3 col-md-6 col-sm-12">
                  <div className="footer-widget links-widget">
                    <h4 className="widget-title">Helpful Resources</h4>
                    <div className="widget-content">
                      <ul className="list">
                        <li>
                          <a href="#">Site Map</a>
                        </li>
                        <li>
                          <a href="#">Terms of Use</a>
                        </li>
                        <li>
                          <a href="#">Privacy Center</a>
                        </li>
                        <li>
                          <a href="#">Security Center</a>
                        </li>
                        <li>
                          <a href="#">Accessibility Center</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/*Bottom*/}
      <div className="footer-bottom">
        <div className="auto-container">
          <div className="outer-box">
            <div className="copyright-text">
              © 2025 <a href="#">WorkSmart</a>. All Right Reserved.
            </div>
            <div className="social-links">
              <a href="#">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll To Top */}
      <div
        className="scroll-to-top scroll-to-target scroll-to-top"
        data-target="html"
      >
        <span className="fa fa-angle-up"></span>
      </div>
    </footer>
  );
};

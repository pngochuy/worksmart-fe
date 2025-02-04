import logo from "../assets/logo.png";

export const Header = () => {
  return (
    <>
      {/* Main Header*/}
      <header className="main-header">
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
                <li className="current dropdown">
                  <span>Jobs</span>
                  <ul>
                    <li>
                      <a href="/job-list">Finding Jobs</a>
                    </li>
                    <li>
                      <a href="blog-list-v1.html">Suitable Jobs</a>
                    </li>
                    <li>
                      <a href="blog-list-v1.html">IT Jobs</a>
                    </li>
                  </ul>
                </li>
                <li className="">
                  <span>
                    <a href="blog-list-v1.html" style={{ color: "#363636" }}>
                      Company List
                    </a>
                  </span>
                </li>
                <li className="dropdown">
                  <span>Profile & CV</span>
                  <ul>
                    <li>
                      <a href="blog-list-v1.html">Create CV</a>
                    </li>
                  </ul>
                </li>
                <li className="dropdown">
                  <span>Profile & CV</span>
                  <ul>
                    <li>
                      <a href="blog-list-v1.html">Create CV</a>
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
            {/* Add Listing */}
            <a href="candidate-dashboard-cv-manager.html" className="upload-cv">
              {" "}
              Upload your CV
            </a>
            {/* Login/Register */}
            <div className="btn-box">
              <a href="/login" className="theme-btn btn-style-three call-modal">
                Login / Register
              </a>
              <a
                href="dashboard-post-job.html"
                className="theme-btn btn-style-one"
              >
                Job Post
              </a>
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="mobile-header">
          <div className="logo">
            <a href="index.html">
              <img src={logo} alt="" title="" />
            </a>
          </div>

          {/*Nav Box*/}
          <div className="nav-outer clearfix">
            <div className="outer-box">
              {/* Login/Register */}
              <div className="login-box">
                <a href="/login" className="call-modal">
                  <span className="icon-user"></span>
                </a>
              </div>

              <a
                href="#nav-mobile"
                className="mobile-nav-toggler navbar-trigger"
              >
                <span className="flaticon-menu-1"></span>
              </a>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <div id="nav-mobile"></div>
      </header>
      {/* End Main Header */}
    </>
  );
};

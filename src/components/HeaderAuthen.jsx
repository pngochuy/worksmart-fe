import logo from "../assets/logo.png";

export const HeaderAuthen = () => {
  return (
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

          {/* Main Menu End*/}
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

            <a href="#nav-mobile" className="mobile-nav-toggler navbar-trigger">
              <span className="flaticon-menu-1"></span>
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div id="nav-mobile"></div>
    </header>
  );
};

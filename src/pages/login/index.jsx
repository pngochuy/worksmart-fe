import leftBannerImg from "../../assets/images/background/12.jpg";
import { LoginForm } from "./LoginForm";

export const Index = () => {
  return (
    <>
      <div className="login-section">
        <a href="/">
          <div
            className="image-layer"
            style={{
              backgroundImage: `url(${leftBannerImg})`,
            }}
          ></div>
        </a>
        <div className="outer-box">
          {/* Login Form */}
          <div className="login-form default-form">
            <div className="form-inner">
              <h3 style={{ marginBottom: "0px" }}>
                Welcome back to <a href="/">WorkSmart</a>
              </h3>
              <p style={{ marginBottom: "32px" }}>
                Build a standout profile and get ideal career opportunities
              </p>

              {/*Login Form*/}
              <LoginForm />

              <div className="bottom-box">
                <div className="text">
                  Don&apos;t have an account? <a href="/register">Register</a>
                </div>
                <div className="divider">
                  <span>or</span>
                </div>
                <div className="btn-box row">
                  <div className="col-lg-6 col-md-12">
                    <a
                      href="#"
                      className="theme-btn social-btn-two facebook-btn"
                    >
                      <i className="fab fa-facebook-f"></i> Log In via Facebook
                    </a>
                  </div>
                  <div className="col-lg-6 col-md-12">
                    <a href="#" className="theme-btn social-btn-two google-btn">
                      <i className="fab fa-google"></i> Log In via Gmail
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/*End Login Form */}
        </div>
      </div>
    </>
  );
};

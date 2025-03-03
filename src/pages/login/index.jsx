import { useEffect } from "react";
import leftBannerImg from "../../assets/images/background/12.jpg";
import { LoginForm } from "./LoginForm";
import { toast } from "react-toastify";
import { SocialRegister } from "../register/SocialRegister";
// import "react-toastify/dist/ReactToastify.css";

export const Index = () => {
  useEffect(() => {
    // Kiểm tra giá trị trong sessionStorage
    if (sessionStorage.getItem("emailConfirmed") === "true") {
      toast.success("Email is confirmed. You can log in now.", {
        position: "top-right",
      });

      // Xoá giá trị khỏi sessionStorage để không hiển thị thông báo nữa
      sessionStorage.removeItem("emailConfirmed");
    }
  }, []);

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
                Welcome back to{" "}
                <a href="/" style={{ color: "#0d6efd" }}>
                  WorkSmart
                </a>
              </h3>
              <p style={{ marginBottom: "32px" }}>
                Build a standout profile and get ideal career opportunities
              </p>

              {/*Login Form*/}
              <LoginForm />

              <div className="bottom-box">
                <div className="text">
                  Don&apos;t have an account?{" "}
                  <a href="/register?role=candidate-form">Register</a>
                </div>
                <div className="divider">
                  <span>or</span>
                </div>
                <SocialRegister
                // role={isCandidate ? "candidate-form" : "employer-form"}
                />
                {/* <div className="btn-box row">
                  <div className="col-lg-12 col-md-12">
                    <a href="#" className="theme-btn social-btn-two google-btn">
                      <i className="fab fa-google"></i> Log In via Gmail
                    </a>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
          {/*End Login Form */}
        </div>
      </div>
    </>
  );
};

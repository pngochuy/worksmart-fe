import leftbannerimg from "../../assets/images/background/12.jpg";
// import react from "../../assets/images/background/12.jpg";
import { useState } from "react";
import { SocialRegister } from "../register/SocialRegister";
import { ForgotPassword } from "./ForgotPassword";
import { VerifyOTP } from "./VerifyOTP";
import { ResetPassword } from "./ResetPassword";
// import "react-toastify/dist/ReactToastify.css";

export const Index = () => {
  const [email, setEmail] = useState(null);
  const [resetToken, setResetToken] = useState(null);

  return (
    <>
      <div className="login-section">
        <a href="/">
          <div
            className="image-layer"
            style={{
              backgroundImage: `url(${leftbannerimg})`,
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
              {!email ? (
                <>
                  <p style={{ marginBottom: "32px" }}>
                    Enter your email to receive a reset code.
                  </p>
                  <ForgotPassword onSuccess={setEmail} />
                </>
              ) : !resetToken ? (
                <>
                  <p style={{ marginBottom: "32px" }}>
                    Enter the verification code sent to your email.
                  </p>
                  <VerifyOTP email={email} onSuccess={setResetToken} />
                </>
              ) : (
                <>
                  <p style={{ marginBottom: "32px" }}>
                    Create a new password for your account.
                  </p>
                  <ResetPassword email={email} resetToken={resetToken} />
                </>
              )}
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

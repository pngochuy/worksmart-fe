import leftBannerImg from "../../assets/images/background/12.jpg";
import { ConfirmEmailForm } from "./ConfirmEmailForm";

export const index = () => {
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
              <h3 style={{ marginBottom: "0px" }}>Confirm Email</h3>
              <p style={{ marginBottom: "32px" }}>
                Please enter the code we sent to your email registered
              </p>

              {/*ConfirmEmail Form*/}
              <ConfirmEmailForm />
            </div>
          </div>
          {/*End Login Form */}
        </div>
      </div>
    </>
  );
};

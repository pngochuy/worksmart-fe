import { useEffect, useState } from "react";
import leftBannerImg from "../../assets/images/background/12.jpg";
import { CandidateResgiterForm } from "./CandidateResgiterForm";
import { EmployerRegisterForm } from "./EmployerRegisterForm";
import { SocialRegister } from "./SocialRegister";
import { useSearchParams } from "react-router-dom";

export const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCandidate, setIsCandidate] = useState(true); // true: Candidate, false: Employer

  useEffect(() => {
    // Đọc từ query parameter (role)
    const role = searchParams.get("role");
    if (role === "employer-form") {
      setIsCandidate(false);
    } else {
      setIsCandidate(true);
    }
  }, [searchParams]);

  const handleRoleChange = (role) => {
    // Cập nhật query parameter "role" trong URL
    setSearchParams({ role });
  };
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
          <div className="login-form default-form" style={{ padding: "0" }}>
            <div className="form-inner">
              <h3 style={{ marginBottom: "0px" }}>
                Welcome to <a href="/">WorkSmart</a>
              </h3>
              <p>Build a standout profile and get ideal career opportunities</p>

              <div className="form-group" style={{ marginTop: "32px" }}>
                <div className="btn-box row">
                  <div className="col-lg-6 col-md-12">
                    <button
                      onClick={() => handleRoleChange("candidate-form")}
                      className={`theme-btn btn-style-${
                        isCandidate ? "seven" : "four active"
                      }`}
                    >
                      <i className="la la-user"></i> Candidate
                    </button>
                  </div>
                  <div className="col-lg-6 col-md-12">
                    <button
                      onClick={() => handleRoleChange("employer-form")}
                      className={`theme-btn btn-style-${
                        !isCandidate ? "seven" : "four active"
                      }`}
                    >
                      <i className="la la-briefcase"></i> Employer
                    </button>
                  </div>
                </div>
              </div>

              {/* Conditional Form */}

              {isCandidate ? (
                <CandidateResgiterForm />
              ) : (
                <EmployerRegisterForm />
              )}

              <div className="bottom-box">
                <div className="text">
                  Already have an account? <a href="/login">Login in now</a>
                </div>
                <div className="divider">
                  <span>or</span>
                </div>
                <SocialRegister
                  role={isCandidate ? "candidate-form" : "employer-form"}
                />
              </div>
            </div>
          </div>
          {/*End Login Form */}
        </div>
      </div>
    </>
  );
};

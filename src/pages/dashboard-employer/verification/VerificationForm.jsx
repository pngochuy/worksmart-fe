import { useNavigate } from "react-router-dom";
import { getUserLoginData } from "@/helpers/decodeJwt";
import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { fetchCompanyProfile } from "@/services/employerServices";

export const VerificationForm = () => {
  const navigate = useNavigate();
  const [userDataLogin, setUserDataLogin] = useState(null);
  const [verificationLevel, setVerificationLevel] = useState("");

  useEffect(() => {
    const loadData = async () => {
      if (sessionStorage.getItem("taxVerified") === "true") {
        toast.success("Tax verification submitted successfully!", {
          position: "top-right",
        });

        sessionStorage.removeItem("taxVerified");
      }
      if (sessionStorage.getItem("businessLicenseVerified") === "true") {
        toast.success("Business license verification submitted successfully!", {
          position: "top-right",
        });

        sessionStorage.removeItem("businessLicenseVerified");
      }

      try {
        const user = getUserLoginData();

        if (user.role === "Employer") {
          setUserDataLogin(user);

          const companyData = await fetchCompanyProfile();

          const newVerificationLevel = companyData.verificationLevel
            ? parseInt(companyData.verificationLevel)
            : 1;
          setVerificationLevel(newVerificationLevel);

          // setVerificationStatuses({
          //   emailStatus: user.email ? "verified" : "pending",
          //   taxStatus: companyData.taxVerificationStatus,
          //   licenseStatus: companyData.licenseVerificationStatus,
          // });

          console.log("Company Data:", companyData);
          console.log("Verification Level:", newVerificationLevel);
        }
      } catch (error) {
        console.error("Error loading verification data:", error);
        toast.error("Failed to load verification information");
      } finally {
        // setLoading(false);
      }
    };

    loadData();
  }, []);

  // Xác định trạng thái hoàn thành
  // let completionStatus = "0/3 Complete";
  // if (verificationLevel === 1) {
  //   completionStatus = "1/3 Complete";
  // } else if (verificationLevel === 2) {
  //   completionStatus = "2/3 Complete";
  // } else if (verificationLevel === 3) {
  //   completionStatus = "3/3 Complete";
  // }

  // Handle email verification
  const handleVerifyEmail = () => {
    if (!userDataLogin || !userDataLogin.email) {
      // Redirect to login page if not logged in
      navigate("/login");
      return;
    }

    toast.success("Email verification complete!");
  };

  // Xử lý click nút xác thực tax
  const handleVerifyTax = () => {
    // Check if email is verified first
    if (verificationLevel < 1) {
      toast.warn("Please verify your email first");
      return;
    }

    if (verificationLevel >= 2) {
      toast.success("Tax verification complete!");
      return;
    }
    navigate("/employer/verify-tax");
  };

  // Xử lý click nút xác thực business license
  const handleUploadLicense = () => {
    if (verificationLevel < 1) {
      toast.warn("Please verify your email first");
      return;
    }

    if (verificationLevel < 2) {
      toast.warn("Please verify tax first");
      return;
    }

    if (verificationLevel >= 3) {
      toast.success("You have completed authentication.");
      return;
    }

    navigate("/employer/business-license");
  };

  return (
    <>
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="verification-container">
            <div className="upper-title-box">
              <div className="welcome-header">
                <h3>Hello, {userDataLogin?.fullName || "Guest"}</h3>
                <div className="account-status">
                  <span
                    className={`status-badge ${verificationLevel === 3 ? "verified" : "pending"
                      }`}
                  >
                    {verificationLevel === 3
                      ? "Verified Account"
                      : "Verification Required"}
                  </span>
                </div>
              </div>
              <div className="verification-intro">
                <div className="text">
                  <i className="fas fa-info-circle mr-2"></i>
                  To unlock all platform features including job posting and
                  candidate management, please complete all 3 verification steps
                  below.
                </div>
                {verificationLevel < 3 && (
                  <div className="feature-lock-notice">
                    <i className="fas fa-lock mr-2"></i>
                    Currently, some features are limited until your account is
                    fully verified.
                  </div>
                )}
              </div>
            </div>

            <div className="row">
              <div className="col-lg-6 col-md-10">
                {/* Xác thực nhà tuyển dụng */}
                <div className="employer-verify-widget">
                  <div className="employer-verify-tabs">
                    <div className="employer-verify-widget-title">
                      <div className="verification-progress">
                        <div className="progress-header">
                          <h4>Verification Progress</h4>
                          <span className="completion-status">
                            {verificationLevel} of 3 Steps Complete
                          </span>
                        </div>
                        <div className="progress-container">
                          <div className="progress-bar-container">
                            <div
                              className={`progress-bar level-${verificationLevel}`}
                            ></div>
                          </div>
                          <div className="progress-steps">
                            <div
                              className={`step-indicator ${verificationLevel >= 1 ? "completed" : ""
                                }`}
                            >
                              1
                            </div>
                            <div
                              className={`step-indicator ${verificationLevel >= 2 ? "completed" : ""
                                }`}
                            >
                              2
                            </div>
                            <div
                              className={`step-indicator ${verificationLevel >= 3 ? "completed" : ""
                                }`}
                            >
                              3
                            </div>
                          </div>
                        </div>
                      </div>
                      <ToastContainer position="top-right" autoClose={3000} />
                      <div className="verification-list">
                        {/* Step 1: Email Verification */}
                        <div
                          className={`verification-item ${verificationLevel >= 1 ? "completed" : "active"
                            }`}
                        >
                          <div className="verification-item-header">
                            <div className="verification-item-status">
                              <span
                                className={`status-icon ${verificationLevel >= 1
                                    ? "completed"
                                    : "pending"
                                  }`}
                              >
                                {verificationLevel >= 1 ? (
                                  <i className="fas fa-check-circle"></i>
                                ) : (
                                  <i className="fas fa-circle"></i>
                                )}
                              </span>
                              <span className="step-number">Step 1</span>
                            </div>
                            <h5>Verify Email Address</h5>
                          </div>
                          <div className="verification-item-content">
                            <p>
                              Verify your email address to start the
                              verification process.
                            </p>
                            <div className="estimated-time">
                              <i className="far fa-clock mr-1"></i> Est. time: 1
                              minute
                            </div>
                          </div>
                          <button
                            className={`verification-action-btn ${verificationLevel >= 1 ? "edit" : "start"
                              }`}
                            onClick={handleVerifyEmail}
                          >
                            {verificationLevel >= 1
                              ? "Email Verified"
                              : "Verify Email"}
                            <i className="fa-solid fa-arrow-right ml-2"></i>
                          </button>
                        </div>

                        {/* Step 2: Tax Verification (previously Step 1) */}
                        <div
                          className={`verification-item ${verificationLevel < 1
                              ? "disabled"
                              : verificationLevel >= 2
                                ? "completed"
                                : "active"
                            }`}
                        >
                          <div className="verification-item-header">
                            <div className="verification-item-status">
                              <span
                                className={`status-icon ${verificationLevel >= 2
                                    ? "completed"
                                    : "pending"
                                  }`}
                              >
                                {verificationLevel >= 2 ? (
                                  <i className="fas fa-check-circle"></i>
                                ) : (
                                  <i className="fas fa-circle"></i>
                                )}
                              </span>
                              <span className="step-number">Step 2</span>
                            </div>
                            <h5>Verify Tax Identification Number</h5>
                          </div>
                          <div className="verification-item-content">
                            <p>
                              Submit your company&apos;s tax identification
                              number for verification.
                            </p>
                            <div className="estimated-time">
                              <i className="far fa-clock mr-1"></i> Est. time: 5
                              minutes
                            </div>
                          </div>
                          <button
                            className={`verification-action-btn ${verificationLevel < 1
                                ? "disabled"
                                : verificationLevel >= 2
                                  ? "edit"
                                  : "start"
                              }`}
                            onClick={handleVerifyTax}
                            disabled={verificationLevel < 1}
                          >
                            {verificationLevel >= 2
                              ? "Already Verified"
                              : "Verify Tax ID"}
                            <i className="fa-solid fa-arrow-right ml-2"></i>
                          </button>
                        </div>

                        {/* Step 3: Business License (previously Step 2) */}
                        <div
                          className={`verification-item ${verificationLevel < 2
                              ? "disabled"
                              : verificationLevel >= 3
                                ? "completed"
                                : "active"
                            }`}
                        >
                          <div className="verification-item-header">
                            <div className="verification-item-status">
                              <span
                                className={`status-icon ${verificationLevel >= 3
                                    ? "completed"
                                    : "pending"
                                  }`}
                              >
                                {verificationLevel >= 3 ? (
                                  <i className="fas fa-check-circle"></i>
                                ) : (
                                  <i className="fas fa-circle"></i>
                                )}
                              </span>
                              <span className="step-number">Step 3</span>
                            </div>
                            <h5>Upload Business Registration Certificate</h5>
                          </div>
                          <div className="verification-item-content">
                            <p>
                              Upload a valid business license to verify your
                              company&apos;s legal status.
                            </p>
                            <div className="estimated-time">
                              <i className="far fa-clock mr-1"></i> Est. time: 3
                              minutes (Review: 1-2 business days)
                            </div>
                          </div>
                          <button
                            className={`verification-action-btn ${verificationLevel < 2
                                ? "disabled"
                                : verificationLevel >= 3
                                  ? "edit"
                                  : "start"
                              }`}
                            onClick={handleUploadLicense}
                            disabled={verificationLevel < 2}
                          >
                            {verificationLevel >= 3
                              ? "Verification Complete"
                              : "Upload Document"}
                            <i className="fa-solid fa-arrow-right ml-2"></i>
                          </button>
                        </div>
                        <div className="verify-actions">
                          <div className="verify-later">
                            <a href="/">I will verify later</a>
                            <span className="notice">
                              (Limited features available)
                            </span>
                          </div>
                          {verificationLevel === 3 && (
                            <div className="verification-complete-actions">
                              <a
                                href="/employer/post-job"
                                className="btn btn-success"
                              >
                                <i className="fas fa-plus-circle mr-2"></i>Post
                                a New Job
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Banner quảng cáo */}
              <div className="col-lg-5 col-md-12">
                <div className="verification-benefits-card">
                  <div className="benefits-header">
                    <h4>Benefits of Verification</h4>
                  </div>
                  <div className="benefits-content">
                    <ul className="benefits-list">
                      <li>
                        <i className="fas fa-check-circle"></i>
                        <span>Post unlimited job listings</span>
                      </li>
                      <li>
                        <i className="fas fa-check-circle"></i>
                        <span>
                          Access full candidate profiles and contact information
                        </span>
                      </li>
                      <li>
                        <i className="fas fa-check-circle"></i>
                        <span>
                          Receive &quot;Verified Employer&quot; badge to
                          increase trust
                        </span>
                      </li>
                      <li>
                        <i className="fas fa-check-circle"></i>
                        <span>Improved visibility in search results</span>
                      </li>
                      {/* <li>
                        <i className="fas fa-check-circle"></i>
                        <span>Access to premium analytics and reporting tools</span>
                      </li> */}
                    </ul>
                  </div>
                  <div className="account-status-summary">
                    <h5>Current Account Status</h5>
                    <div className="status-indicators">
                      <div className="status-item">
                        <span className="status-label">Job Posting:</span>
                        <span
                          className={`status-value ${verificationLevel === 3 ? "enabled" : "disabled"
                            }`}
                        >
                          {verificationLevel === 3 ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                      <div className="status-item">
                        <span className="status-label">Job Management:</span>
                        <span
                          className={`status-value ${verificationLevel === 3 ? "enabled" : "disabled"
                            }`}
                        >
                          {verificationLevel === 3 ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                      <div className="status-item">
                        <span className="status-label">List Candidate:</span>
                        <span
                          className={`status-value ${verificationLevel === 3 ? "enabled" : "disabled"
                            }`}
                        >
                          {verificationLevel === 3 ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                      {verificationLevel === 3 && (
                        <div className="verification-complete-actions flex justify-center align-items-center">
                          <div className="verification-complete-actions">
                              <a
                                href="/employer/post-job"
                                className="btn btn-success"
                              >
                                <i className="fas fa-plus-circle mr-2"></i>Post
                                a New Job
                              </a>
                            </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default VerificationForm;

import { useNavigate } from "react-router-dom";
import { getUserLoginData } from "@/helpers/decodeJwt";
import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { fetchCompanyProfile } from "@/services/employerServices";

export const VerificationForm = () => {
    const navigate = useNavigate();
    const [userDataLogin, setUserDataLogin] = useState(null); // State lưu người dùng đăng nhập
    const [verificationLevel, setVerificationLevel] = useState("");
    const [verificationStatuses, setVerificationStatuses] = useState({
        taxStatus: "",
        licenseStatus: ""
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const user = getUserLoginData();
                setUserDataLogin(user);
                
                const companyData = await fetchCompanyProfile();
                
                setVerificationLevel(companyData.verificationLevel);
                
                setVerificationStatuses({
                    taxStatus: companyData.taxVerificationStatus,
                    licenseStatus: companyData.licenseVerificationStatus
                });
                
                console.log("Company Data:", companyData);
                console.log("Verification Level:", companyData.verificationLevel);
            } catch (error) {
                console.error("Error loading verification data:", error);
                toast.error("Failed to load verification information");
            } finally {
                setLoading(false);
            }
        };
        
        loadData();
    }, []);

    // Xác định trạng thái hoàn thành
    let completionStatus = "1/3 Complete";
    if (verificationLevel === 2) {
        completionStatus = "2/3 Complete";
    } else if (verificationLevel === 3) {
        completionStatus = "3/3 Complete";
    }

    // Xử lý click nút xác thực
    const handleVerifyTax = () => {
        if (verificationLevel >= 2) {
            toast.success("You have successfully verified your tax.");
            return;
        }
        navigate("/employer/verify-tax");
    };

    const handleUploadLicense = () => {
        if (verificationLevel === 1) {
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
                                <h3>Hello, {userDataLogin?.fullName}</h3>
                                <div className="account-status">
                                    <span className={`status-badge ${verificationLevel === 3 ? "verified" : "pending"}`}>
                                        {verificationLevel === 3 ? "Verified Account" : "Verification Required"}
                                    </span>
                                </div>
                            </div>
                            <div className="verification-intro">
                                <div className="text">
                                    <i className="fas fa-info-circle mr-2"></i>
                                    To unlock all platform features including job posting and candidate management,
                                    please complete all 3 verification steps below.
                                </div>
                                {verificationLevel < 3 && (
                                    <div className="feature-lock-notice">
                                        <i className="fas fa-lock mr-2"></i>
                                        Currently, some features are limited until your account is fully verified.
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
                                                <div className="progress-bar-container">
                                                    <div className="progress-bar">
                                                        <div className="progress-fill" style={{ width: `${(verificationLevel / 3) * 100}%` }}></div>
                                                    </div>
                                                    <div className="progress-steps">
                                                        <div className={`step-indicator ${verificationLevel >= 1 ? "completed" : ""}`}>1</div>
                                                        <div className={`step-indicator ${verificationLevel >= 2 ? "completed" : ""}`}>2</div>
                                                        <div className={`step-indicator ${verificationLevel >= 3 ? "completed" : ""}`}>3</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <ToastContainer position="top-right" autoClose={3000} />
                                            <div className="verification-list">
                                                {/* Cập nhật thông tin công ty */}
                                                <div className={`verification-item ${verificationLevel >= 2 ? "completed" : "active"}`}>
                                                    <div className="verification-item-header">
                                                        <div className="verification-item-status">
                                                            <span className={`status-icon ${verificationLevel >= 2 ? "completed" : "pending"}`}>
                                                                {verificationLevel >= 2 ? <i className="fas fa-check-circle"></i> : <i className="fas fa-circle"></i>}
                                                            </span>
                                                            <span className="step-number">Step 1</span>
                                                        </div>
                                                        <h5>Verify Tax Identification Number</h5>
                                                    </div>
                                                    <div className="verification-item-content">
                                                        <p>Submit your company's tax identification number for verification.</p>
                                                        <div className="estimated-time">
                                                            <i className="far fa-clock mr-1"></i> Est. time: 5 minutes
                                                        </div>
                                                    </div>
                                                    <button className={`verification-action-btn ${verificationLevel >= 2 ? "edit" : "start"}`} onClick={handleVerifyTax}>
                                                        {verificationLevel >= 2 ? "Edit Tax Information" : "Verify Tax ID"}
                                                        <i className="fa-solid fa-arrow-right ml-2"></i>
                                                    </button>
                                                </div>

                                                {/* Cập nhật Giấy phép đăng ký doanh nghiệp */}
                                                <div className={`verification-item ${verificationLevel < 2 ? "disabled" : verificationLevel >= 3 ? "completed" : "active"}`}>
                                                    <div className="verification-item-header">
                                                        <div className="verification-item-status">
                                                            <span className={`status-icon ${verificationLevel >= 3 ? "completed" : "pending"}`}>
                                                                {verificationLevel >= 3 ? <i className="fas fa-check-circle"></i> : <i className="fas fa-circle"></i>}
                                                            </span>
                                                            <span className="step-number">Step 2</span>
                                                        </div>
                                                        <h5>Upload Business Registration Certificate</h5>
                                                    </div>
                                                    <div className="verification-item-content">
                                                        <p>Upload a valid business license to verify your company's legal status.</p>
                                                        <div className="estimated-time">
                                                            <i className="far fa-clock mr-1"></i> Est. time: 3 minutes (Review: 1-2 business days)
                                                        </div>
                                                    </div>
                                                    <button
                                                        className={`verification-action-btn ${verificationLevel < 2 ? "disabled" : verificationLevel >= 3 ? "edit" : "start"}`}
                                                        onClick={handleUploadLicense}
                                                        disabled={verificationLevel < 2}
                                                    >
                                                        {verificationLevel >= 3 ? "View Document" : "Upload Document"}
                                                        <i className="fa-solid fa-arrow-right ml-2"></i>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="verify-actions">
                                                <div className="verify-later">
                                                    <a href="/">I will verify later</a>
                                                    <span className="notice">(Limited features available)</span>
                                                </div>
                                                {verificationLevel === 3 && (
                                                    <div className="verification-complete-actions">
                                                        <button className="btn btn-success">
                                                            <i className="fas fa-plus-circle mr-2"></i>Post a New Job
                                                        </button>
                                                    </div>
                                                )}
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
                                                <span>Access full candidate profiles and contact information</span>
                                            </li>
                                            <li>
                                                <i className="fas fa-check-circle"></i>
                                                <span>Receive "Verified Employer" badge to increase trust</span>
                                            </li>
                                            <li>
                                                <i className="fas fa-check-circle"></i>
                                                <span>Improved visibility in search results</span>
                                            </li>
                                            <li>
                                                <i className="fas fa-check-circle"></i>
                                                <span>Access to premium analytics and reporting tools</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="account-status-summary">
                                        <h5>Current Account Status</h5>
                                        <div className="status-indicators">
                                            <div className="status-item">
                                                <span className="status-label">Job Posting:</span>
                                                <span className={`status-value ${verificationLevel === 3 ? "enabled" : "disabled"}`}>
                                                    {verificationLevel === 3 ? "Enabled" : "Disabled"}
                                                </span>
                                            </div>
                                            <div className="status-item">
                                                <span className="status-label">Job Management:</span>
                                                <span className={`status-value ${verificationLevel === 3 ? "enabled" : "disabled"}`}>
                                                    {verificationLevel === 3 ? "Enabled" : "Disabled"}
                                                </span>
                                            </div>
                                            {/* <div className="status-item">
                                                <span className="status-label">Profile Visibility:</span>
                                                <span className={`status-value ${verificationLevel >= 1 ? "enabled" : "disabled"}`}>
                                                    {verificationLevel >= 1 ? "Public" : "Limited"}
                                                </span>
                                            </div> */}
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

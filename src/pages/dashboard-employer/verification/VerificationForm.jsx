import { useNavigate } from "react-router-dom";
import { getUserLoginData, getVerificationLevel } from "@/helpers/decodeJwt";
import { useState, useEffect } from "react";

export const VerificationForm = () => {
    const navigate = useNavigate();
    const [userDataLogin, setUserDataLogin] = useState(null); // State lưu người dùng đăng nhập
    const [error, setError] = useState("");
    const [verificationLevel, setVerificationLevel] = useState("");

    useEffect(() => {
        const user = getUserLoginData();
        setUserDataLogin(user);

        const level = getVerificationLevel();
        setVerificationLevel(level);

        console.log("User Data:", user);
        console.log("Verification Level:", level);
    }, []);

    // Xác định trạng thái hoàn thành
    let completionStatus = "0% Complete";
    if (verificationLevel === 2) {
        completionStatus = "50% Complete";
    } else if (verificationLevel === 3) {
        completionStatus = "100% Complete";
    }

    // Xử lý click nút xác thực
    const handleVerifyTax = () => {
        if (verificationLevel >= 2) {
            setError("You have successfully verified your tax.");
            return;
        }
        setError("");
        navigate("/employer/verify-tax");
    };

    const handleUploadLicense = () => {
        if (verificationLevel === 1) {
            setError("Please verify tax first");
            return;
        }
        if (verificationLevel >= 3) {
            setError("You have completed authentication.");
            return;
        }
        setError("");
        navigate("/employer/business-license");
    };

    return (
        <>
            <section className="user-dashboard">
                <div className="dashboard-outer">
                    <div className="verification-container">
                        <div className="upper-title-box">
                            <h3>Hello, {userDataLogin?.fullName} </h3>
                            <div className="text">
                                Please follow the verification steps below to start posting and receiving applications for your job posting.
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-lg-6 col-md-10">
                                {/* Xác thực nhà tuyển dụng */}
                                <div className="employer-verify-widget">
                                    <div className="employer-verify-tabs">
                                        <div className="employer-verify-widget-title">
                                            <h4 style={{paddingBottom: "30px"}}>Verify Information <span className="completion-status">{completionStatus}</span></h4>
                                            {error && <div className="text-danger">{error}</div>}
                                            <div className="verification-list">
                                                {/* Cập nhật thông tin công ty */}
                                                <div className="verification-item">
                                                    <span className="radio-circle"></span>
                                                    <span>Update Company Information</span>
                                                    <button className="arrow-button" onClick={handleVerifyTax}>
                                                        <i class="fa-regular fa-circle-right" style={{fontSize: "33px"}}></i>
                                                    </button>
                                                </div>

                                                {/* Cập nhật Giấy phép đăng ký doanh nghiệp */}
                                                <div className="verification-item">
                                                    <span className="radio-circle"></span>
                                                    <span>Update Business Registration Certificate</span>
                                                    <button className="arrow-button" onClick={handleUploadLicense}>
                                                        <i class="fa-regular fa-circle-right" style={{fontSize: "33px"}}></i>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="verify-later" style={{ textDecoration: "underline" }}>
                                                <a href="/">I will verify later</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Banner quảng cáo */}
                            <div className="col-lg-6 col-md-10">
                                <img src="https://res.cloudinary.com/duizep4kz/image/upload/v1741600524/banner-verification_kupkwv.webp" alt="Verification Benefits" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default VerificationForm;

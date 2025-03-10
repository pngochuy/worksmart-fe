import { uploadBusinessLicense, uploadImagesProfile, fetchCompanyProfile } from "@/services/employerServices";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export const BusinessLicense = () => {
    const [businessLicense, setBusinessLicense] = useState("");
    const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
    const [businessLicenseError, setBusinessLicenseError] = useState("");
    const [verificationMessage, setVerificationMessage] = useState("");
    const [isVerified, setIsVerified] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [isUploaded, setIsUploaded] = useState(false);

    useEffect(() => {
        const loadBusinessLicenseInfo = async () => {
            try {
                const data = await fetchCompanyProfile();
                if (data) {
                    setBusinessLicense(data.businessLicenseImageUrl || "");

                    if (data.licenseVerificationStatus === "Approved") {
                        setIsVerified(true);
                        setVerificationMessage("✅ Your business license has been approved.");
                    }
                    if (data.licenseVerificationStatus === "Pending") {
                        setIsPending(true);
                        setVerificationMessage("⏳ Your business license verification is pending. Please wait for approval.");
                    }
                }
            } catch (error) {
                console.error("Error fetching business license info", error);
            }
        };
        loadBusinessLicenseInfo();
    }, []);

    const handleBusinessLicenseChange = async (event) => {
        const file = event.target.files[0];

        if (file) {
            try {
                const response = await uploadImagesProfile(file);
                setBusinessLicense(response.imageUrl);
                console.log("Business License Image URL:", response.imageUrl);
            } catch (error) {
                console.error("Error uploading business license image:", error);

                const errorMessage = error.response?.data?.message || "Error uploading license, please try again.";
                toast.error(errorMessage);
            }
        }
    };

    const handleRemoveBusinessLicense = () => {
        setBusinessLicense(null);
        setUploadedImageUrl(null);
    };

    const handleSubmitBusinessLicense = async () => {
        if (!businessLicense) {
            toast.warn("Please upload a business license before submitting!");
            return;
        }

        try {
            const response = await uploadBusinessLicense(businessLicense);
            console.log("Submit response:", response);
            setIsUploaded(true);
            toast.success("Business License submitted successfully!");
        } catch (error) {
            console.error("Error submitting business license:", error);
            const errorMessage = error.response?.data?.message || "Error submitting license, please try again.";
            toast.error(errorMessage);
        }
    };

    return (
        <>
            <section className="user-dashboard">
                <div className="dashboard-outer">
                    <div className="upper-title-box">
                        <h3>Business Registration Information</h3>
                        <div className="text">Ready to create first job post?</div>
                    </div>

                    <div className="row">
                        <div className="col-lg-12">
                            {/*  */}
                            {/* Ls widget */}
                            <div className="ls-widget">
                                <div className="tabs-box">
                                    <div className="widget-title">
                                        <h4>Business License</h4>
                                        <div className="form-group col-lg-12 col-md-12">
                                            <p className={`alert ${isVerified ? "alert-success" : isPending ? "alert-warning" : "alert-danger"}`}>
                                                {verificationMessage}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="business-license-container">
                                        
                                        <div className="uploading-outer">
                                            {businessLicense ? (
                                                <div className="row image-container" style={{ marginTop: "55px" }}>
                                                    <div className="form-group col-lg-8 col-md-10">
                                                        <h4>Your Business License:</h4>
                                                        <a href={businessLicense} target="_blank" rel="noopener noreferrer">
                                                            <img
                                                                src={businessLicense}
                                                                alt="Business License"
                                                                className="license-preview"
                                                                style={{
                                                                    width: "500px",
                                                                    objectFit: "cover",
                                                                    borderRadius: "10px",
                                                                    cursor: "pointer",
                                                                }}
                                                            />
                                                        </a>
                                                        <p className="example-text text-center">Check information again before submit</p>
                                                    </div>
                                                    <div className="form-group col-lg-4 col-md-8 m-auto">
                                                        <button
                                                            className="theme-btn btn-style-one"
                                                            onClick={handleSubmitBusinessLicense}
                                                            style={{
                                                                marginTop: "10px",
                                                                backgroundColor: "red",
                                                                width: "80px",
                                                                height: "40px",
                                                            }}
                                                            disabled={isUploaded || isPending || isVerified}
                                                        >
                                                            {isVerified ? "Verified" : isPending ? "Pending" : isUploaded ? "Uploading..." : "Upload"}
                                                        </button>
                                                        <br />
                                                        <button
                                                            className="theme-btn btn-style-one"
                                                            onClick={handleRemoveBusinessLicense}
                                                            style={{
                                                                marginTop: "10px",
                                                                backgroundColor: "red",
                                                                width: "80px",
                                                                height: "40px",
                                                            }}
                                                        >
                                                            Remove
                                                        </button>

                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="uploadButton">
                                                        <input
                                                            className="uploadButton-input"
                                                            type="file"
                                                            accept="image/*"
                                                            id="uploadBusinessLicense"
                                                            onChange={handleBusinessLicenseChange}
                                                            disabled={isUploaded}
                                                        />
                                                        <label
                                                            className="uploadButton-button ripple-effect"
                                                            htmlFor="uploadBusinessLicense"
                                                        >
                                                            Upload Business License
                                                        </label>
                                                    </div>
                                                    <div className="text" style={{ marginRight: "50px" }}>
                                                        Max file size is 5MB. Suitable files are .jpg & .png
                                                        <br />
                                                        {businessLicenseError && (
                                                            <div className="text-danger">{businessLicenseError}</div>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        {isUploaded && (
                                            <p className="success-text" style={{ color: "green", marginTop: "10px" }}>
                                                ✅ You have successfully uploaded the photo, please wait a few minutes for the system to approve it for you.
                                            </p>
                                        )}
                                        <div></div>
                                        <div className="illustration-section">
                                            <h4>Example:</h4>
                                            <a href="https://res.cloudinary.com/duizep4kz/image/upload/v1741535143/mau-giay-phep-dang-ky-kinh-doanh-1_argswf.jpg" target="_blank" rel="noopener noreferrer">
                                                <img
                                                    src="https://res.cloudinary.com/duizep4kz/image/upload/v1741535143/mau-giay-phep-dang-ky-kinh-doanh-1_argswf.jpg"
                                                    alt="Minh họa giấy phép"
                                                    style={{
                                                        width: "330px",
                                                        objectFit: "cover",
                                                        borderRadius: "10px",
                                                        cursor: "pointer",
                                                        marginLeft: "50px",
                                                    }}
                                                />
                                            </a>
                                            <p className="example-text text-center">Example of a valid license</p>
                                        </div>
                                    </div>
                                    <p className="warning-text" style={{ color: "orange" }}>
                                        ⚠ Published documents must be complete on all sides and have no signs of editing/covering/cutting of information.                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default BusinessLicense;

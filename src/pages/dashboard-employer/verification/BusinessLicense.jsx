import { uploadBusinessLicense, uploadImagesProfile, fetchCompanyProfile, uploadFile } from "@/services/employerServices";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export const BusinessLicense = () => {
    const [businessLicense, setBusinessLicense] = useState("");
    const [fileName, setFileName] = useState("");
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [businessLicenseError, setBusinessLicenseError] = useState("");
    const [verificationMessage, setVerificationMessage] = useState("");
    const [isVerified, setIsVerified] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [isUploaded, setIsUploaded] = useState(false);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        const loadBusinessLicenseInfo = async () => {
            try {
                const data = await fetchCompanyProfile();
                if (data) {
                    setBusinessLicense(data.businessLicenseImageUrl || "");

                    setIsActive(false);
                    setIsVerified(false);
                    setIsPending(false);
                    setVerificationMessage("");

                    if (data.licenseVerificationStatus === "Approved") {
                        setIsVerified(true);
                        setVerificationMessage("Your business license has been approved.");
                    } else if (data.licenseVerificationStatus === "Pending") {
                        setIsPending(true);
                        setVerificationMessage("Your business license verification is pending. Please wait for approval.");
                    } else if (data.licenseVerificationStatus === "Rejected") {
                        setIsActive(true);
                        setVerificationMessage("Your business license was rejected. Please submit again.");
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

        if (!file) return;

        if (file.type !== "application/pdf") {
            setBusinessLicenseError("Only PDF files are allowed!");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setBusinessLicenseError("File size must be less than 5MB!");
            return;
        }

        setBusinessLicenseError("");
        setFile(file);
        setFileName(file.name);
        setPreviewUrl(URL.createObjectURL(file)); // Tạo URL tạm để xem trước
        try {
            const response = await uploadFile(file);
            setBusinessLicense(response.fileUrl);
            toast.success("File uploaded successfully!");
            console.log("Business License Image URL:", response.fileUrl);
        } catch (error) {
            console.error("Error uploading business license image:", error);
            const errorMessage = error.response?.data?.message || "Error uploading license, please try again.";
            toast.error(errorMessage);
        }
    };

    const handleRemoveBusinessLicense = () => {
        setFile(null);
        setPreviewUrl("");
        setBusinessLicense("");
        setIsUploaded(false);
        setBusinessLicenseError("");
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
                    <div className="upper-title-box bg-light p-3 rounded mb-4">
                        <h3 className="text-primary">Business Registration Information</h3>
                        <div className="text text-secondary">Ready to create first job post?</div>
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
                                            {(isVerified || isPending || verificationMessage) && (
                                                <p className={`alert 
                                                        ${isVerified ? "alert-success"
                                                        : isPending ? "alert-warning"
                                                            : "alert-danger"}`}>
                                                    {verificationMessage}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="business-license-container">
                                        <div className="uploading-outer">
                                            {file ? (
                                                <div className="row image-container" style={{ marginTop: "55px" }}>
                                                    <div className="form-group col-lg-8 col-md-10">
                                                        <h4>Your Business License:</h4>
                                                        {previewUrl && (
                                                            <div className="p-3 bg-light rounded">
                                                                <p className="mb-0">
                                                                    <i className="fa fa-file-pdf text-danger me-2"></i>
                                                                    <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-primary">
                                                                        {fileName}
                                                                    </a>
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="col-lg-4">
                                                        <div className="d-grid gap-2">
                                                            <button
                                                                className="btn btn-primary"
                                                                onClick={() => window.open(previewUrl, "_blank")}
                                                            >
                                                                <i className="fa fa-eye me-2"></i>View PDF
                                                            </button>

                                                            <button
                                                                className={`btn ${isVerified ? "btn-success" : isPending ? "btn-warning" : isUploaded ? "btn-info" : "btn-danger"}`}
                                                                onClick={handleSubmitBusinessLicense}
                                                                disabled={isUploaded || isPending || isVerified}
                                                            >
                                                                {isVerified ? "Verified" : isPending ? "Pending" : isUploaded ? "Uploaded" : "Upload"}
                                                            </button>

                                                            <button
                                                                className="btn btn-outline-danger"
                                                                onClick={handleRemoveBusinessLicense}
                                                            >
                                                                <i className="fa fa-trash me-2"></i>Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="uploadButton">
                                                        <input
                                                            className="uploadButton-input"
                                                            type="file"
                                                            accept=".pdf"
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
                                                    <div className="text-muted">
                                                        Max file size is 5MB. Suitable files are .pdf
                                                        <br />
                                                        {businessLicenseError && (
                                                            <div className="text-danger mt-2">{businessLicenseError}</div>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
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
                                    <div className="mt-4">
                                        <div className="alert alert-warning">
                                            <i className="fa fa-exclamation-triangle me-2"></i>
                                            Published documents must be complete on all sides and have no signs of editing/covering/cutting of information.
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

export default BusinessLicense;

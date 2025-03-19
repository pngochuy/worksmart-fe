import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast, ToastContainer } from "react-toastify";
import { fetchCompanyProfile, verifyTax } from "@/services/employerServices";
import { Editor } from "@tinymce/tinymce-react";
const API_TYNI_KEY = import.meta.env.VITE_TINY_API_KEY;

const taxSchema = z.object({
    taxId: z.string().min(6, "Tax ID must be at least 6 characters."),
    industry: z.string().min(3, "Industry must be at least 3 characters."),
    companySize: z.string().nonempty("Company Size is required."),
    companyName: z.string().min(3, "Company Name must be at least 3 characters."),
    companyWebsite: z.string().nullable().optional().refine((val) => {
        if (!val) return true;
        return val.startsWith("http://") || val.startsWith("https://");
    }, {
        message: "URL must start with http:// or https://"
    }),
    companyDescription: z.string().min(10, "Company Description must be at least 10 characters."),
    phoneNumber: z
        .string()
        .min(10, "Phone number is invalid")
        .regex(/^0\d{9,}$/, "Phone number must start with 0 and contain only numbers."),
    address: z.string(),
});
const companySizeOptions = [
    "1 - 10 employees",
    "11 - 50 employees",
    "51 - 200 employees",
    "201 - 500 employees",
    "501 - 1000 employees",
    "Trên 1000 employees"
]
export const VerifyTax = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [timeout, setTimeout] = useState(false);
    const [verificationMessage, setVerificationMessage] = useState("");
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        mode: "onChange",
        resolver: zodResolver(taxSchema),
    });

    useEffect(() => {
        const loadTaxInfo = async () => {
            try {
                const data = await fetchCompanyProfile();
                if (data) {
                    setValue("taxId", data.taxId || "");
                    setValue("industry", data.industry || "");
                    setValue("companySize", data.companySize || "");
                    setValue("companyName", data.companyName || "");
                    setValue("companyWebsite", data.companyWebsite || "");
                    setValue("companyDescription", data.companyDescription || "");
                    setValue("phoneNumber", data.phoneNumber || "");
                    setValue("address", data.address || "");

                    setIsActive(false);
                    setIsVerified(false);
                    setIsPending(false);
                    setVerificationMessage("");

                    if (data.taxVerificationStatus === "Approved") {
                        setIsVerified(true);
                        setVerificationMessage("Your tax verification has been approved.");
                    } else if (data.taxVerificationStatus === "Pending") {
                        setIsPending(true);
                        setVerificationMessage("Your tax verification is pending. Please wait for approval.");
                    } else if (data.taxVerificationStatus === "Rejected") {
                        setIsActive(true);
                        setVerificationMessage("Your tax verification was rejected. Please submit again.");
                    }
                }
            } catch (error) {
                console.error("Error fetching tax verification info", error);
            }
        };
        loadTaxInfo();
    }, [setValue]);

    const handleEditorChange = (content) => {
        setValue("companyDescription", content)
    };

    const onSubmit = async (formData) => {
        setIsLoading(true);
        try {
            await verifyTax(formData);
            toast.success("Tax verification submitted successfully!");
            navigate("/employer/verification");
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Error submitting tax verification, please try again.";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <section className="user-dashboard">
                <div className="dashboard-outer">
                    <div className="upper-title-box bg-light p-3 rounded mb-4">
                        <h3 className="text-primary">Verify Tax</h3>
                        <div className="text text-secondary">Verify your company before post job!</div>
                    </div>

                    <div className="row">
                        <div className="col-lg-12">
                            {/*  */}
                            {/* Ls widget */}
                            <div className="ls-widget">
                                <div className="tabs-box">
                                    <div className="widget-title">
                                        <h4>My Profile</h4>
                                    </div>
                                    <div className="widget-content">
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
                                        <ToastContainer position="top-right" autoClose={3000} />
                                        <form className="default-form" onSubmit={handleSubmit(onSubmit)}>
                                            <div className="row">
                                                {/* Tax ID */}
                                                <div className="form-group col-lg-6 col-md-12">
                                                    <label>Tax ID <span style={{ color: "red" }}>*</span></label>
                                                    <input type="text" {...register("taxId")} />
                                                    {errors.taxId && <span className="text-danger">{errors.taxId.message}</span>}
                                                </div>

                                                {/* Industry */}
                                                <div className="form-group col-lg-6 col-md-12">
                                                    <label>Industry <span style={{ color: "red" }}>*</span></label>
                                                    <input type="text" {...register("industry")} />
                                                    {errors.industry && <span className="text-danger">{errors.industry.message}</span>}
                                                </div>

                                                {/* Company Size */}
                                                <div className="form-group col-lg-6 col-md-12">
                                                    <label>Company Size <span style={{ color: "red" }}>*</span></label>
                                                    <select {...register("companySize")} onChange={(e) => setValue("companySize", e.target.value)}>
                                                        <option value="">Chọn...</option>
                                                        {companySizeOptions.map((size, index) => (
                                                            <option key={index} value={size}>
                                                                {size}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {errors.companySize && <span className="text-danger">{errors.companySize.message}</span>}
                                                </div>

                                                {/* Company Name */}
                                                <div className="form-group col-lg-6 col-md-12">
                                                    <label>Company Name <span style={{ color: "red" }}>*</span></label>
                                                    <input type="text" {...register("companyName")} />
                                                    {errors.companyName && <span className="text-danger">{errors.companyName.message}</span>}
                                                </div>

                                                {/* Company Website */}
                                                <div className="form-group col-lg-12 col-md-12">
                                                    <label>Company Website <span className="text-muted">(optional)</span></label>
                                                    <input type="text" {...register("companyWebsite")} placeholder="https://example.com" />
                                                    {errors.companyWebsite && <span className="text-danger">{errors.companyWebsite.message}</span>}
                                                </div>

                                                {/* Company Description */}
                                                <div className="form-group col-lg-12 col-md-12">
                                                    <label>Company Description <span style={{ color: "red" }}>*</span></label>
                                                    {/* <textarea {...register("companyDescription")} /> */}
                                                    <Editor
                                                        apiKey={API_TYNI_KEY}
                                                        {...register("companyDescription")}
                                                        value={watch("companyDescription")}
                                                        init={{
                                                            height: 300,
                                                            menubar: false,
                                                            plugins: [
                                                                "advlist",
                                                                "autolink",
                                                                "lists",
                                                                "link",
                                                                "charmap",
                                                                "print",
                                                                "preview",
                                                                "anchor",
                                                                "searchreplace",
                                                                "visualblocks",
                                                                "code",
                                                                "fullscreen",
                                                                "insertdatetime",
                                                                "media",
                                                                "table",
                                                                "paste",
                                                                "help",
                                                                "wordcount",
                                                            ],
                                                            toolbar:
                                                                "undo redo | formatselect | bold italic backcolor | \
                                                                                                        alignleft aligncenter alignright alignjustify | \
                                                                                                        bullist numlist outdent indent | removeformat | help",
                                                        }}
                                                        onEditorChange={handleEditorChange}
                                                    />
                                                    {errors.companyDescription && <span className="text-danger">{errors.companyDescription.message}</span>}
                                                </div>

                                                {/* Phone Number */}
                                                <div className="form-group col-lg-6 col-md-12">
                                                    <label>Phone Number <span style={{ color: "red" }}>*</span></label>
                                                    <input type="text" {...register("phoneNumber")} />
                                                    {errors.phoneNumber && <span className="text-danger">{errors.phoneNumber.message}</span>}
                                                </div>

                                                {/* Address */}
                                                <div className="form-group col-lg-6 col-md-12">
                                                    <label>Address <span style={{ color: "red" }}>*</span></label>
                                                    <input type="text" {...register("address")} />
                                                </div>

                                                {/* Submit Button */}
                                                <div className="form-group col-lg-6 col-md-12">
                                                    <button className="theme-btn btn-style-one" type="submit" disabled={isLoading || isVerified || isPending}>
                                                        {isVerified ? "Already Verified" : isPending ? "Verification Pending" : isLoading ? "Submitting..." : "Verify Tax"}
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
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

export default VerifyTax;

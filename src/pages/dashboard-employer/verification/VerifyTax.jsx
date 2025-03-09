import { useEffect } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { fetchCompanyProfile, verifyTax } from "@/services/employerServices";

const taxSchema = z.object({
    taxId: z.string().min(6, "Tax ID must be at least 6 characters.").optional().or(z.literal("")),
    industry: z.string().min(3, "Industry must be at least 3 characters.").optional().or(z.literal("")),
    companySize: z.string().optional().or(z.literal("")),
    companyName: z.string().min(3, "Company Name must be at least 3 characters.").optional().or(z.literal("")),
    companyDescription: z.string().min(10, "Company Description must be at least 10 characters.").optional().or(z.literal("")),
    phoneNumber: z
        .string()
        .min(10, "Phone number is invalid")
        .regex(/^0\d{9,}$/, "Phone number must start with 0 and contain only numbers.")
        .optional()
        .or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
});

export const VerifyTax = () => {
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
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
                    setValue("companyDescription", data.companyDescription || "");
                    setValue("phoneNumber", data.phoneNumber || "");
                    setValue("address", data.address || "");
                }
            } catch (error) {
                console.error("Error fetching tax verification info", error);
                toast.error("Error loading tax verification data");
            }
        };
        loadTaxInfo();
    }, [setValue]);

    const onSubmit = async (formData) => {
        try {
            setIsLoading(true);
            console.log("Submitting tax verification data:", formData);
            await verifyTax(formData);
            toast.success("Tax verification submitted successfully!");
        } catch (error) {
            console.error("Error submitting tax verification", error);
            toast.error(` ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <section className="user-dashboard">
                <div className="dashboard-outer">
                    <div className="upper-title-box">
                        <h3>Verify Tax</h3>
                        <div className="text">Verify your company before post job!</div>
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
                                        <form className="default-form" onSubmit={handleSubmit(onSubmit)}>
                                            <div className="row">
                                                {/* Tax ID */}
                                                <div className="form-group col-lg-6 col-md-12">
                                                    <label>Tax ID</label>
                                                    <input type="text" {...register("taxId")} />
                                                    {errors.taxId && <span className="text-danger">{errors.taxId.message}</span>}
                                                </div>

                                                {/* Industry */}
                                                <div className="form-group col-lg-6 col-md-12">
                                                    <label>Industry</label>
                                                    <input type="text" {...register("industry")} />
                                                    {errors.industry && <span className="text-danger">{errors.industry.message}</span>}
                                                </div>

                                                {/* Company Size */}
                                                <div className="form-group col-lg-6 col-md-12">
                                                    <label>Company Size</label>
                                                    <input type="text" {...register("companySize")} />
                                                </div>

                                                {/* Company Name */}
                                                <div className="form-group col-lg-6 col-md-12">
                                                    <label>Company Name</label>
                                                    <input type="text" {...register("companyName")} />
                                                    {errors.companyName && <span className="text-danger">{errors.companyName.message}</span>}
                                                </div>

                                                {/* Company Description */}
                                                <div className="form-group col-lg-12 col-md-12">
                                                    <label>Company Description</label>
                                                    <textarea {...register("companyDescription")} />
                                                    {errors.companyDescription && <span className="text-danger">{errors.companyDescription.message}</span>}
                                                </div>

                                                {/* Phone Number */}
                                                <div className="form-group col-lg-6 col-md-12">
                                                    <label>Phone Number</label>
                                                    <input type="text" {...register("phoneNumber")} />
                                                    {errors.phoneNumber && <span className="text-danger">{errors.phoneNumber.message}</span>}
                                                </div>

                                                {/* Address */}
                                                <div className="form-group col-lg-6 col-md-12">
                                                    <label>Address</label>
                                                    <input type="text" {...register("address")} />
                                                </div>

                                                {/* Submit Button */}
                                                <div className="form-group col-lg-6 col-md-12">
                                                    <button className="theme-btn btn-style-one" type="submit" disabled={isLoading}>
                                                        {isLoading ? "Submitting..." : "Verify Tax"}
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

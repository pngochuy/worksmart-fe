import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fetchCompanyProfile, updateCompanyProfile, updateCompanyAddress } from "@/services/employerServices";
import { z } from "zod";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import { getUserIdFromToken } from "../../../helpers/decodeJwt";

const companySchema = z.object({
  phoneNumber: z.string().min(10, "Phone number is invalid").regex(/^0\d{9,}$/, "Phone number must start with 0 and contain only numbers.").optional().or(z.literal("")),
  companyName: z.string().min(3, "Company Name must be at least 3 characters.").regex(/^[A-Za-zÀ-Ỹà-ỹ\s]+$/, "Company Name must contain only letters.").optional().or(z.literal("")),
  companyDescription: z.string().min(10, "Company Description must be at least 10 characters.").optional().or(z.literal("")),
  createdAt: z.string().refine((date) => !isNaN(Date.parse(date)), {message: "Invalid establishment date."}).optional().or(z.literal("")),
  isPrivated: z.enum(["Yes", "No"], { message: "Please select Yes or No." }).optional().or(z.literal("")),
})

const addressSchema = z.object({
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(100, "Address must be less than 100 characters")
    .optional()
    .or(z.literal("")),
});

export const index = () => {
  const navigate = useNavigate();
  const [UserId, setUserId] = useState(null);
  const [isCompanyLoading, setIsCompanyLoading] = useState(false);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    companyName : "",
    companyDescription : "",
    phoneNumber : "",
    createdAt : "",
    isPrivated : "",
  });

  const { 
    register: registerCompany, 
    handleSubmit: handleSubmitCompany, 
    watch,
    setValue: setCompanyValue, 
    formState: { errors: companyErrors } 
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(companySchema),
  });

  const { 
    register: registerAddress, 
    handleSubmit: handleSubmitAddress, 
    setValue: setAddressValue, 
    formState: { errors: addressErrors } 
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(addressSchema),
  });

  useEffect(() => {
    const id = getUserIdFromToken(); 
    if (id) {
      setUserId(id);
    } else {
      console.error("Không tìm thấy userId trong token!");
      navigate("/login");
    }
  }, []);

  useEffect(() => {
    const loadCompanyProfile = async () => {
      try {
        const data = await fetchCompanyProfile();
        if (data) {
          setProfileData(data);
          setCompanyValue("email", data.email || "");
          setCompanyValue("phoneNumber", data.phoneNumber || "");
          setCompanyValue("companyName", data.companyName || "");
          setCompanyValue("companyDescription", data.companyDescription || "");
          setCompanyValue("createdAt", data.createdAt ? data.createdAt.split("T")[0] : ""); // Định dạng YYYY-MM-DD
          setCompanyValue("isPrivated", data.isPrivated); 

          setAddressValue("address", data.address || "");
        }
      } catch (error) {
        console.error("Error fetching candidate profile", error.response);
        if (error.message.includes("Unauthorized") || error.message.includes("Token expired")) {
          navigate("/login");
        }
      }
    };

    loadCompanyProfile();
  }, [setCompanyValue, setAddressValue, navigate]);

  const onSubmitCompany = async (formData) => {
    try {
      setIsCompanyLoading(true);
      const validData = {
        ...formData,
        isPrivated: formData.isPrivated ? formData.isPrivated : "No",
      };
      const message = await updateCompanyProfile(validData);
      alert(message);
    } catch (error) {
      console.error("Error updating company profile:", error);
    } finally {
      setIsCompanyLoading(false);
    }
  };

  const onSubmitAddress = async (formData) => {
    try {
      setIsAddressLoading(true);
      const message = await updateCompanyAddress(formData);
      alert(message);
    } catch (error) {
      console.error("Error updating company address:", error);
    } finally {
      setIsAddressLoading(false);
    }
  };
  
  return (
    <>
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <h3>Company Profile!</h3>
            <div className="text">Ready to jump back in?</div>
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
                    <div className="uploading-outer">
                      <div className="uploadButton">
                        <input
                          className="uploadButton-input"
                          type="file"
                          name="attachments[]"
                          accept="image/*, application/pdf"
                          id="upload"
                          multiple
                        />
                        <label
                          className="uploadButton-button ripple-effect"
                          htmlFor="upload"
                        >
                          Browse Logo
                        </label>
                        <span className="uploadButton-file-name"></span>
                      </div>
                      <div className="text">
                        Max file size is 1MB, Minimum dimension: 330x300 And
                        Suitable files are .jpg & .png
                      </div>
                    </div>

                    <div className="uploading-outer">
                      <div className="uploadButton">
                        <input
                          className="uploadButton-input"
                          type="file"
                          name="attachments[]"
                          accept="image/*, application/pdf"
                          id="upload_cover"
                          multiple
                        />
                        <label
                          className="uploadButton-button ripple-effect"
                          htmlFor="upload"
                        >
                          Browse Cover
                        </label>
                        <span className="uploadButton-file-name"></span>
                      </div>
                      <div className="text">
                        Max file size is 1MB, Minimum dimension: 330x300 And
                        Suitable files are .jpg & .png
                      </div>
                    </div>

                    <form className="default-form" onSubmit={handleSubmitCompany(onSubmitCompany)}>
                      <div className="row">
                        {/* Company Name */}
                        <div className="form-group col-lg-6 col-md-12">
                          <label>Company name </label>
                          <input type="text" placeholder="Enter full name" {...registerCompany("companyName")} />
                          {companyErrors.companyName && <span className="text-danger">{companyErrors.companyName.message}</span>}
                        </div>

                        {/* Email */}
                        <div className="form-group col-lg-6 col-md-12">
                          <label>Email address</label>
                          <input type="email" {...registerCompany("email")} readOnly />
                          {companyErrors.email && <span className="text-danger">{companyErrors.email.message}</span>}
                        </div>

                        {/* Phone Number */}
                        <div className="form-group col-lg-6 col-md-12">
                          <label>Phone</label>
                          <input type="text" {...registerCompany("phoneNumber")} />
                          {companyErrors.phoneNumber && <span className="text-danger">{companyErrors.phoneNumber.message}</span>}
                        </div>

                        {/* Since */}
                        <div className="form-group col-lg-6 col-md-12">
                          <label>Est. Since</label><br/>
                          <DatePicker
                            selected={watch("createdAt") ? new Date(watch("createdAt")) : null}
                            onChange={(date) => {
                              if (date) {
                                setCompanyValue("createdAt", date.toISOString().split("T")[0])}; // Chuyển thành YYYY-MM-DD
                              }
                            }
                            dateFormat="dd/MM/yyyy"
                            style={{ marginRight: "350px"}}
                          />
                          {companyErrors.createdAt && <span className="text-danger">{companyErrors.createdAt.message}</span>}
                        </div>

                        {/* IsPrivated */}
                        <div className="form-group col-lg-6 col-md-12">
                        <label>Allow In Search & Listing</label>
                            <select {...registerCompany("isPrivated")} className="chosen-select">
                              <option value="">Select</option>
                              <option value="No">Yes</option>
                              <option value="Yes">No</option>
                            </select>
                            {companyErrors.isPrivated && <span className="text-danger">{companyErrors.isPrivated.message}</span>}
                        </div>

                        {/* Company Description */}
                        <div className="form-group col-lg-12 col-md-12">
                          <label>About Company</label>
                          <textarea placeholder="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Corporis eius, hic architecto eos magni culpa, consequatur necessitatibus ratione tempore assumenda optio corrupti deleniti molestias ad maiores rerum aperiam dolorem! A?" 
                          {...registerCompany("companyDescription")} />
                          {companyErrors.companyDescription && <span className="text-danger">{companyErrors.companyDescription.message}</span>}                        
                        </div>

                        {/* Save */}
                        <div className="form-group col-lg-6 col-md-12">
                          <button className="theme-btn btn-style-one" type="submit" disabled={isCompanyLoading}>
                            {isCompanyLoading ? "Saving..." : "Update Profile"}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              {/* Ls widget */}
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4>Contact Information</h4>
                  </div>

                  <div className="widget-content">
                  <form className="default-form" onSubmit={handleSubmitAddress(onSubmitAddress)}>
                      <div className="row">
                        {/* Address */}
                        <div className="form-group col-lg-12 col-md-12">
                          <label>Complete Address</label>
                          <input
                            type="text"
                            name="name"
                            placeholder="Enter your address"{...registerAddress("address")}
                          />
                          {addressErrors.address && <p className="text-danger">{addressErrors.address.message}</p>}
                        </div>

                        {/* Save */}
                        <div className="form-group col-lg-12 col-md-12">
                          <button type="submit" className="theme-btn btn-style-one" disabled={isAddressLoading}>
                            {isAddressLoading ? "Saving..." : "Save"}
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

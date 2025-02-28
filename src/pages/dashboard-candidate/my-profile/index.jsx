import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { getUserIdFromToken } from "../../../helpers/decodeJwt";
import { fetchCandidatesProfile, updateCandidateAddress, updateCandidateProfile } from "../../../services/candidateServices";

// Validation schema using Zod
const profileSchema = z.object({
  fullName: z.string().min(2, "Full Name must be at least 2 characters.").optional().or(z.literal("")), // Cho phép khoảng trắng
  phoneNumber: z.string().min(10, "Phone number is invalid").optional().or(z.literal("")),
  gender: z.enum(["Male", "Female", "Other"], {
    errorMap: () => ({ message: "Invalid gender selection" }),
  }).optional().or(z.literal("")),
  identityNumber: z.string().min(9, "Identity Number must be at least 9 digits.").optional().or(z.literal("")),
  isPrivated: z.enum(["Yes", "No"], { message: "Please select Yes or No." }).optional().or(z.literal("")),
});

const addressSchema = z.object({
  address: z 
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(100, "Address must be less than 100 characters")
    .optional()
    .or(z.literal("")),
});

// React Hook Form
export const index = () => {
  const navigate = useNavigate();
  const [UserId, setUserId] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [profileData, setProfileData] = useState({
    fullName : "",
    phoneNumber : "",
    gender : "",
    dateOfBirth : "",
    identityNumber : "",
    isPrivated : "",
  });

  const { 
    register: registerProfile, 
    handleSubmit: handleSubmitProfile, 
    setValue: setProfileValue,
    formState: { errors: profileErrors } 
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(profileSchema),
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
      navigate("/login"); // Chuyển hướng nếu không có userId
    }
  }, []);
  
  //Fetch data profile
  useEffect(() => {
    const loadProfile = async() => {
      try {
        const data = await fetchCandidatesProfile();
        if (data) {
          setProfileData(data),
          setProfileValue("fullName", data.fullName || "");
          setProfileValue("phoneNumber", data.phoneNumber || "");
          setProfileValue("email", data.email || "");
          setProfileValue("gender", data.gender || "Other");
          setProfileValue("identityNumber", data.identityNumber || "");
          setProfileValue("isPrivated", data.isPrivated); 
  
          setAddressValue("address", data.address || "");
        }
      } catch (error) {
        console.error("Error fetching candidate profile", error.response);
        if (error.message.includes("Unauthorized") || error.message.includes("Token expired")) {
          navigate("/login");
        }
      }
    };
    if (UserId) {
      loadProfile();
    }
  }, [UserId, setProfileValue, setAddressValue, navigate]);
  

  const onSubmitProfile = async (formData) => {
    try {
      setIsProfileLoading(true);
      const validData = {
        ...formData,
        isPrivated: formData.isPrivated ? formData.isPrivated : "No",
      };
      const message = await updateCandidateProfile(validData);
      alert(message);
    } catch (error) {
      console.error("Error updating profile", error);
    } finally {
      setIsProfileLoading(false);
    }
  };

  const onSubmitAddress = async (formData) => {
    try {
      setIsAddressLoading(true);
      const message = await updateCandidateAddress(formData);
      alert(message);
    } catch (error) {
      console.error("Error updating address", error);
    } finally {
      setIsAddressLoading(false);
    }
  };
  
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      setFileError("Please select an image.");
      return;
    }

    //Chỉ cho phép file JPG hoặc PNG
    const allowedTypes = ["image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)){
      setFileError("Only JPG and PNG files are allowed");
      return;
    }

    //Kiểm tra dung lượng file < 1MB
    if (file.size > 1048576){
      setFileError("File size must be less than 1 MB");
      return;
    }

    // Kiểm tra kích thước ảnh (cần tạo một object URL để kiểm tra)
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      if (img.width < 330 || img.height < 300){
        setFileError("Minimum dimensions are 330x300 pixels");
        return;
      }
      setSelectedFile(file);
      setFileError("");
    };
  };

  return (
    <>
      {/* Dashboard */}
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <h3>My Profile</h3>
            <div className="text">Ready to jump back in?</div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              {/* Ls widget */}
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4>My Profile</h4>
                  </div>

                  <div className="widget-content">
                    <div className="uploading-outer">
                      <div className="uploadButton">
                        {/* Images */}
                        <input
                          className="uploadButton-input"
                          type="file"
                          accept="image/jpg, image/png"
                          id="upload"
                          onChange={handleFileChange}
                        />
                        <label
                          className="uploadButton-button ripple-effect"
                          htmlFor="upload"
                        >
                          Browse Logo
                        </label>
                        <span className="uploadButton-file-name">
                          {selectedFile ? selectedFile.name : ""}
                        </span>
                      </div>
                      <div className="text">
                        Max file size is 1MB, Minimum dimension: 330x300 And
                        Suitable files are .jpg & .png
                        <br />
                        {fileError && <div className="text-danger">{fileError}</div>}
                      </div>
                    </div>
                    <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="default-form">
                      <div className="row">
                        {/* Full Name */}
                        <div className="form-group col-lg-6 col-md-12">
                          <label>Full Name</label>
                          <input type="text" placeholder="Enter full name" {...registerProfile("fullName")} /> 
                          {profileErrors.fullName && <span className="text-danger">{profileErrors.fullName.message}</span>}
                        </div>

                        {/* Phone */}
                        <div className="form-group col-lg-6 col-md-12">
                          <label>Phone</label>
                          <input type="text" placeholder="Enter phone number" {...registerProfile("phoneNumber")} />
                          {profileErrors.phoneNumber && <span className="text-danger">{profileErrors.phoneNumber.message}</span>}
                        </div>

                        {/* Email */}
                        <div className="form-group col-lg-6 col-md-12">
                          <label>Email address</label>
                          <input type="text" placeholder="Enter email" {...registerProfile("email")} readOnly />
                          {profileErrors.email && <span className="text-danger">{profileErrors.email.message}</span>}
                        </div>

                        {/* Gender */}
                        <div className="form-group col-lg-6 col-md-12">
                          <label>Gender</label>
                          <select {...registerProfile("gender")} className="chosen-select">
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                          {profileErrors.gender && <span className="text-danger">{profileErrors.gender.message}</span>}
                        </div>

                        {/* Identity Number */}
                        <div className="form-group col-lg-6 col-md-12">
                          <label>Identity Number</label>
                          <input type="text" placeholder="Enter ID number" {...registerProfile("identityNumber")} />
                          {profileErrors.identityNumber && <span className="text-danger">{profileErrors.identityNumber.message}</span>}
                        </div>

                        {/* IsPrivated */}
                        <div className="form-group col-lg-6 col-md-12">
                        <label>Allow In Search & Listing</label>
                            <select {...registerProfile("isPrivated")} className="chosen-select">
                              <option value="">Select</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                            {profileErrors.isPrivated && <span className="text-danger">{profileErrors.isPrivated.message}</span>}
                        </div>

                        {/* Save */}
                        <div className="form-group col-lg-6 col-md-12">
                          <button type="submit" className="theme-btn btn-style-one" disabled={isProfileLoading}>
                            {isProfileLoading ? "Saving..." : "Save"}
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
      {/* End Dashboard */}
    </>
  );
};

export default index;
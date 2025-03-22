import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
// import { getUserIdFromToken } from "../../../helpers/decodeJwt";
import {
  fetchCandidatesProfile,
  updateCandidateAddress,
  updateCandidateProfile,
  updateImagesProfile,
  uploadImagesProfile,
  deleteImagesProfile,
} from "../../../services/candidateServices";
import { toast, ToastContainer } from "react-toastify";

// Validation schema using Zod
const profileSchema = z.object({
  avatar: z.string().optional().or(z.literal("")), // Cho phép khoảng trắng
  fullName: z
    .string()
    .min(2, "Full Name must be at least 2 characters."),  
  phoneNumber: z
    .string()
    .min(10, "Phone number is invalid")
    .optional()
    .or(z.literal("")),
  gender: z
    .enum(["Male", "Female", "Other"], {
      errorMap: () => ({ message: "Invalid gender selection" }),
    })
    .optional()
    .or(z.literal("")),
  // isPrivated: z
  //   .enum(["Yes", "No"], { message: "Please select Yes or No." })
  //   .optional()
  //   .or(z.literal("")),
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
export const Index = () => {
  const navigate = useNavigate();
  // const [UserId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [fileError, setFileError] = useState("");
  const [avatar, setAvatar] = useState("");
  // const [profileData, setProfileData] = useState({
  //   fullName: "",
  //   phoneNumber: "",
  //   gender: "",
  //   dateOfBirth: "",
  //   identityNumber: "",
  //   isPrivated: "",
  //   avatar: "",
  // });

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    setValue: setProfileValue,
    formState: { errors: profileErrors },
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(profileSchema),
  });

  const {
    register: registerAddress,
    handleSubmit: handleSubmitAddress,
    setValue: setAddressValue,
    formState: { errors: addressErrors },
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(addressSchema),
  });

  //Fetch data profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchCandidatesProfile();
        if (data) {
          // setProfileData(data);

          if (data.avatar) {
            setAvatar(data.avatar);
          } else {
            console.warn("⚠ Avatar không tồn tại trong dữ liệu API");
          }

          setProfileValue("fullName", data.fullName || "");
          setProfileValue("phoneNumber", data.phoneNumber || "");
          setProfileValue("email", data.email || "");
          setProfileValue("gender", data.gender || "Other");
          // setProfileValue("isPrivated", data.isPrivated);

          setAddressValue("address", data.address || "");
        }
      } catch (error) {
        console.error("Error fetching candidate profile", error.response);
        // toast.error("Error fetching candidate profile");
        // if (
        //   error.message.includes("Unauthorized") ||
        //   error.message.includes("Token expired")
        // ) {
        //   navigate("/login");
        // }
      }
    };
    loadProfile();
  }, [setProfileValue, setAddressValue, setAvatar, navigate]);

  const onSubmitProfile = async (formData) => {
    setIsProfileLoading(true);
    try {
      // const validData = {
      //   ...formData,
      //   avatar,
      //   isPrivated: formData.isPrivated ? formData.isPrivated : "No",
      // };
      const message = await updateCandidateProfile(formData);
      toast.success(message);
    } catch (error) {
      console.error("Error updating profile", error);
      toast.error("Error updating profile");
    } finally {
      setIsProfileLoading(false);
    }
  };

  const onSubmitAddress = async (formData) => {
    setIsAddressLoading(true);
    try {
      const message = await updateCandidateAddress(formData);
      toast.success(message);
    } catch (error) {
      console.error("Error updating profile", error);
      toast.error("Error updating address");
    } finally {
      setIsAddressLoading(false);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      setFileError("Please select an image.");
      return;
    }

    // Chỉ cho phép file JPG hoặc PNG
    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      setFileError("Only JPG and PNG files are allowed.");
      return;
    }

    // Kiểm tra dung lượng file < 1MB
    if (file.size > 1048576) {
      setFileError("File size must be less than 1 MB.");
      return;
    }

    // Kiểm tra kích thước ảnh (cần tạo một object URL để kiểm tra)
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = async () => {
      // if (img.width < 330 || img.height < 300) {
      //   setFileError("Minimum dimensions are 330x300 pixels.");
      //   return;
      // }

      // Nếu qua hết validate, tiếp tục upload ảnh
      try {
        const uploadResponse = await uploadImagesProfile(file);
        const imageUrl = uploadResponse.imageUrl;
        console.log("Avatar gửi đi:", imageUrl);

        await updateImagesProfile(imageUrl);

        setAvatar(imageUrl); // Cập nhật UI ngay khi ảnh mới có
        setFileError(""); // Xóa lỗi nếu có
        toast.success("Profile updated successfully!");
        window.location.reload();
      } catch (error) {
        console.error("Error while uploading photo:", error);
        // toast.error("Error while uploading photo!");
        setFileError("Upload failed. Please try again.");
      }
    };
  };

  const handleRemoveImage = async () => {
    setLoading(true);
    if (!avatar) return;
    try {
      // await deleteImagesProfile(avatar);
      await updateImagesProfile("");

      // Cập nhật state để giao diện hiển thị form upload lại
      setAvatar("");
      toast.success("Image deleted successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error while deleting photo:", error);
      // toast.error("Error while deleting photo:");
      setFileError("Delete failed. Please try again.");
    } finally {
      setLoading(false);
    }
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
                  <ToastContainer/>
                  <div className="widget-content">
                    <div className="uploading-outer">
                      {avatar ? (
                        <div className="row image-container">
                          <div className="form-group col-lg-6 col-md-8">
                            <img
                              src={avatar}
                              {...registerProfile("avatar")}
                              alt="Avatar"
                              className="avatar-preview"
                              style={{
                                width: "150px",
                                // height: "300px",
                                objectFit: "cover",
                                borderRadius: "10px",
                              }}
                            />
                          </div>
                          <div className="form-group col-lg-4 col-md-8 m-auto">
                            <button
                              className="theme-btn btn-style-one"
                              onClick={handleRemoveImage}
                              disabled={loading}
                              style={{
                                marginTop: "10px",
                                backgroundColor: "red",
                                width: "80px",
                                height: "40px",
                              }}
                            >
                              {loading ? (
                                <span className="loading-spinner"></span>
                              ) : (
                                "Remove"
                              )}
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
                              id="upload"
                              onChange={handleFileChange}
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
                            <br />
                            {fileError && (
                              <div className="text-danger">{fileError}</div>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    <form
                      onSubmit={handleSubmitProfile(onSubmitProfile)}
                      className="default-form"
                    >
                      <div className="row">
                        {/* Full Name */}
                        <div className="form-group col-lg-6 col-md-12">
                          <label>Full Name<span style={{ color: "red" }}>*</span></label>
                          <input
                            type="text"
                            placeholder="Enter full name"
                            {...registerProfile("fullName")}
                          />
                          {profileErrors.fullName && (
                            <span className="text-danger">
                              {profileErrors.fullName.message}
                            </span>
                          )}
                        </div>

                        {/* Phone */}
                        <div className="form-group col-lg-6 col-md-12">
                          <label>Phone</label>
                          <input
                            type="text"
                            placeholder="Enter phone number"
                            {...registerProfile("phoneNumber")}
                          />
                          {profileErrors.phoneNumber && (
                            <span className="text-danger">
                              {profileErrors.phoneNumber.message}
                            </span>
                          )}
                        </div>

                        {/* Email */}
                        <div className="form-group col-lg-6 col-md-12">
                          <label>Email address</label>
                          <input
                            type="text"
                            placeholder="Enter email"
                            {...registerProfile("email")}
                            readOnly
                          />
                          {profileErrors.email && (
                            <span className="text-danger">
                              {profileErrors.email.message}
                            </span>
                          )}
                        </div>

                        {/* Gender */}
                        <div className="form-group col-lg-6 col-md-12">
                          <label>Gender</label>
                          <select
                            {...registerProfile("gender")}
                            className="chosen-select"
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                          {profileErrors.gender && (
                            <span className="text-danger">
                              {profileErrors.gender.message}
                            </span>
                          )}
                        </div>

                        {/* IsPrivated */}
                        {/* <div className="form-group col-lg-12 col-md-12">
                          <label>Allow In Search & Listing</label>
                          <select
                            {...registerProfile("isPrivated")}
                            className="chosen-select"
                          >
                            <option value="">Select</option>
                            <option value="No">Yes</option>
                            <option value="Yes">No</option>
                          </select>
                          {profileErrors.isPrivated && (
                            <span className="text-danger">
                              {profileErrors.isPrivated.message}
                            </span>
                          )}
                        </div> */}

                        {/* Save */}
                        <div className="form-group col-lg-6 col-md-12">
                          <button
                            className="theme-btn btn-style-one"
                            disabled={isProfileLoading}
                          >
                            {isProfileLoading ? (
                              <span className="loading-spinner"></span>
                            ) : (
                              "Update"
                            )}
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
                    <form
                      className="default-form"
                      onSubmit={handleSubmitAddress(onSubmitAddress)}
                    >
                      <div className="row">
                        {/* Address */}
                        <div className="form-group col-lg-12 col-md-12">
                          <label>Address</label>
                          <input
                            type="text"
                            name="name"
                            placeholder="Enter your address"
                            {...registerAddress("address")}
                          />
                          {addressErrors.address && (
                            <p className="text-danger">
                              {addressErrors.address.message}
                            </p>
                          )}
                        </div>

                        {/* Save */}
                        <div className="form-group col-lg-12 col-md-12">
                          <button
                            type="submit"
                            className="theme-btn btn-style-one"
                            disabled={isAddressLoading}
                          >
                            {isAddressLoading ? (
                              <span className="loading-spinner"></span>
                            ) : (
                              "Update"
                            )}
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

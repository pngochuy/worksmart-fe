import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  fetchCompanyProfile,
  updateCompanyProfile,
  updateCompanyAddress,
  updateImagesProfile,
  uploadImagesProfile,
  deleteImagesProfile,
} from "@/services/employerServices";
import { z } from "zod";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
// import { getUserIdFromToken } from "../../../helpers/decodeJwt";
import { toast } from "react-toastify";

const companySchema = z.object({
  phoneNumber: z
    .string()
    .min(10, "Phone number is invalid")
    .regex(
      /^0\d{9,}$/,
      "Phone number must start with 0 and contain only numbers."
    )
    .optional()
    .or(z.literal("")),
  companyName: z
    .string()
    .min(3, "Company Name must be at least 3 characters.")
    .regex(/^[A-Za-zÀ-Ỹà-ỹ\s]+$/, "Company Name must contain only letters.")
    .optional()
    .or(z.literal("")),
  companyDescription: z
    .string()
    .min(10, "Company Description must be at least 10 characters.")
    .optional()
    .or(z.literal("")),
  createdAt: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid establishment date.",
    })
    .optional()
    .or(z.literal("")),
  isPrivated: z
    .enum(["Yes", "No"], { message: "Please select Yes or No." })
    .optional()
    .or(z.literal("")),
});

const addressSchema = z.object({
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(100, "Address must be less than 100 characters")
    .optional()
    .or(z.literal("")),
});

export const Index = () => {
  const navigate = useNavigate();
  // const [UserId, setUserId] = useState(null);
  const [isCompanyLoading, setIsCompanyLoading] = useState(false);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [fileError, setFileError] = useState("");
  const [avatar, setAvatar] = useState("");

  const {
    register: registerCompany,
    handleSubmit: handleSubmitCompany,
    watch,
    setValue: setCompanyValue,
    formState: { errors: companyErrors },
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(companySchema),
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

  // useEffect(() => {
  //   const id = getUserIdFromToken();
  //   if (id) {
  //     setUserId(id);
  //   } else {
  //     console.error("UserId not found in token!");
  //     toast.error("UserId not found in token!");
  //     navigate("/login");
  //   }
  // }, []);

  useEffect(() => {
    const loadCompanyProfile = async () => {
      try {
        const data = await fetchCompanyProfile();
        if (data) {
          if (data.avatar) {
            setAvatar(data.avatar);
            console.log("Avatar cập nhật:", data.avatar);
          } else {
            console.warn("⚠ Avatar không tồn tại trong dữ liệu API");
          }

          setCompanyValue("email", data.email || "");
          setCompanyValue("phoneNumber", data.phoneNumber || "");
          setCompanyValue("companyName", data.companyName || "");
          setCompanyValue("companyDescription", data.companyDescription || "");
          setCompanyValue(
            "createdAt",
            data.createdAt ? data.createdAt.split("T")[0] : ""
          ); // Định dạng YYYY-MM-DD
          setCompanyValue("isPrivated", data.isPrivated);

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
    loadCompanyProfile();
  }, [setAvatar, setCompanyValue, setAddressValue, navigate]);

  const onSubmitCompany = async (formData) => {
    try {
      setIsCompanyLoading(true);
      const validData = {
        ...formData,
        isPrivated: formData.isPrivated ? formData.isPrivated : "No",
      };
      console.log("Data gửi đi:", validData);
      const message = await updateCompanyProfile(validData);
      toast.success(message);
      window.location.reload();
    } catch (error) {
      console.error("Error updating company profile:", error);
      toast.error("Error updating company profile");
    } finally {
      setIsCompanyLoading(false);
    }
  };

  const onSubmitAddress = async (formData) => {
    try {
      setIsAddressLoading(true);
      const message = await updateCompanyAddress(formData);
      toast.success(message);
    } catch (error) {
      console.error("Error updating company address:", error);
      toast.error("Error updating company profile");
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
      if (img.width < 330 || img.height < 300) {
        setFileError("Minimum dimensions are 330x300 pixels.");
        return;
      }

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
        console.error("Upload failed:", error);
        // toast.error("Error while uploading photo!");
        setFileError("Upload failed. Please try again.");
      }
    };
  };

  const handleRemoveImage = async () => {
    if (!avatar) return;
    try {
      await deleteImagesProfile(avatar);
      await updateImagesProfile("");

      // Cập nhật state để giao diện hiển thị form upload lại
      setAvatar("");
      console.log("Image deleted successfully!");
      toast.success("Image deleted successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error while deleting photo:", error);
      // toast.error("Error while deleting photo:");
      setFileError("Delete failed. Please try again.");
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
                      {avatar ? (
                        <div className="row image-container">
                          <div className="form-group col-lg-6 col-md-8">
                            <img
                              src={avatar}
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
                      className="default-form"
                      onSubmit={handleSubmitCompany(onSubmitCompany)}
                    >
                      <div className="row">
                        {/* Company Name */}
                        <div className="form-group col-lg-6 col-md-12">
                          <label>Company name </label>
                          <input
                            type="text"
                            placeholder="Enter full name"
                            {...registerCompany("companyName")}
                          />
                          {companyErrors.companyName && (
                            <span className="text-danger">
                              {companyErrors.companyName.message}
                            </span>
                          )}
                        </div>

                        {/* Email */}
                        <div className="form-group col-lg-6 col-md-12">
                          <label>Email address</label>
                          <input
                            type="email"
                            {...registerCompany("email")}
                            readOnly
                          />
                          {companyErrors.email && (
                            <span className="text-danger">
                              {companyErrors.email.message}
                            </span>
                          )}
                        </div>

                        {/* Phone Number */}
                        <div className="form-group col-lg-6 col-md-12">
                          <label>Phone</label>
                          <input
                            type="text"
                            {...registerCompany("phoneNumber")}
                          />
                          {companyErrors.phoneNumber && (
                            <span className="text-danger">
                              {companyErrors.phoneNumber.message}
                            </span>
                          )}
                        </div>

                        {/* Since */}
                        <div className="form-group col-lg-6 col-md-12">
                          <label>Est. Since</label>
                          <br />
                          <DatePicker
                            selected={
                              watch("createdAt")
                                ? new Date(watch("createdAt"))
                                : null
                            }
                            onChange={(date) => {
                              if (date) {
                                setCompanyValue(
                                  "createdAt",
                                  date.toISOString().split("T")[0]
                                );
                              } // Chuyển thành YYYY-MM-DD
                            }}
                            dateFormat="dd/MM/yyyy"
                            style={{ marginRight: "350px" }}
                          />
                          {companyErrors.createdAt && (
                            <span className="text-danger">
                              {companyErrors.createdAt.message}
                            </span>
                          )}
                        </div>

                        {/* IsPrivated */}
                        <div className="form-group col-lg-6 col-md-12">
                          <label>Allow In Search & Listing</label>
                          <select
                            {...registerCompany("isPrivated")}
                            className="chosen-select"
                          >
                            <option value="">Select</option>
                            <option value="No">Yes</option>
                            <option value="Yes">No</option>
                          </select>
                          {companyErrors.isPrivated && (
                            <span className="text-danger">
                              {companyErrors.isPrivated.message}
                            </span>
                          )}
                        </div>

                        {/* Company Description */}
                        <div className="form-group col-lg-12 col-md-12">
                          <label>About Company</label>
                          <textarea
                            placeholder="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Corporis eius, hic architecto eos magni culpa, consequatur necessitatibus ratione tempore assumenda optio corrupti deleniti molestias ad maiores rerum aperiam dolorem! A?"
                            {...registerCompany("companyDescription")}
                          />
                          {companyErrors.companyDescription && (
                            <span className="text-danger">
                              {companyErrors.companyDescription.message}
                            </span>
                          )}
                        </div>

                        {/* Save */}
                        <div className="form-group col-lg-6 col-md-12">
                          <button
                            className="theme-btn btn-style-one"
                            type="submit"
                            disabled={isCompanyLoading}
                          >
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
                    <form
                      className="default-form"
                      onSubmit={handleSubmitAddress(onSubmitAddress)}
                    >
                      <div className="row">
                        {/* Address */}
                        <div className="form-group col-lg-12 col-md-12">
                          <label>Complete Address</label>
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

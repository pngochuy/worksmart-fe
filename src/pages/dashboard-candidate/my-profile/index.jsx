import { useForm } from "react-hook-form";
import { useState, useEffect, useRef } from "react";
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
} from "../../../services/candidateServices";
import { toast, ToastContainer } from "react-toastify";

// Validation schema using Zod
const profileSchema = z.object({
  avatar: z.string().optional().or(z.literal("")), // Cho phép khoảng trắng
  fullName: z.string().min(2, "Full Name must be at least 2 characters."),
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

  // Map related states
  const [showMap, setShowMap] = useState(false);
  const [mapCoordinates, setMapCoordinates] = useState({
    lat: 10.762622,
    lng: 106.660172,
  }); // Default to HCMC
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);
  const [geocodeError, setGeocodeError] = useState("");
  const addressInputRef = useRef(null);

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
    watch: watchAddress,
    formState: { errors: addressErrors },
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(addressSchema),
  });

  // Watch the address field for changes
  const currentAddress = watchAddress("address");

  //Fetch data profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchCandidatesProfile();
        if (data) {
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
      }
    };
    loadProfile();
  }, [setProfileValue, setAddressValue, setAvatar, navigate]);

  const onSubmitProfile = async (formData) => {
    setIsProfileLoading(true);
    try {
      const message = await updateCandidateProfile(formData);
      toast.success(message);
      window.location.reload(); // reload để update fullName từ localstorage cho Sidebar
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
      console.log("formData: ", formData);
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

  // Function to geocode address to coordinates
  const geocodeAddress = async (address) => {
    if (!address || address.trim() === "") {
      setGeocodeError("Please enter an address to find on map");
      return;
    }

    setIsGeocodingLoading(true);
    setGeocodeError("");

    try {
      // Use Nominatim API (OpenStreetMap's geocoding service)
      const encodedAddress = encodeURIComponent(address);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
        { headers: { "Accept-Language": "en" } }
      );

      const data = await response.json();

      if (data && data.length > 0) {
        setMapCoordinates({
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        });
        setShowMap(true);
      } else {
        setGeocodeError("Location not found. Please try a different address");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setGeocodeError("Error finding location. Please try again");
    } finally {
      setIsGeocodingLoading(false);
    }
  };

  const handleFindOnMap = () => {
    geocodeAddress(currentAddress);
  };

  const handleToggleMap = () => {
    setShowMap(!showMap);
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
                  <ToastContainer />
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
                          <label>
                            Full Name<span style={{ color: "red" }}>*</span>
                          </label>
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

              {/* Contact Information Widget */}
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
                          <div className="location-input-container">
                            <input
                              type="text"
                              name="name"
                              placeholder="Enter your address"
                              ref={addressInputRef}
                              {...registerAddress("address")}
                              className="location-input"
                            />
                            <button
                              type="button"
                              className="find-on-map-btn"
                              onClick={handleFindOnMap}
                              disabled={!currentAddress || isGeocodingLoading}
                            >
                              {isGeocodingLoading ? (
                                <span className="loading-spinner-small"></span>
                              ) : (
                                <>
                                  <i className="fas fa-map-marker-alt"></i> Find
                                  on Map
                                </>
                              )}
                            </button>
                          </div>
                          {addressErrors.address && (
                            <p className="text-danger">
                              {addressErrors.address.message}
                            </p>
                          )}
                          {geocodeError && (
                            <p className="text-danger">{geocodeError}</p>
                          )}
                        </div>

                        {/* Map Container */}
                        {currentAddress && (
                          <div className="form-group col-lg-12 col-md-12">
                            <div className="map-toggle-container">
                              <button
                                type="button"
                                className="map-toggle-btn"
                                onClick={handleToggleMap}
                              >
                                {showMap ? "Hide Map" : "Show Map"}
                              </button>
                            </div>

                            {showMap && (
                              <div className="map-container">
                                <iframe
                                  title="Location Map"
                                  width="100%"
                                  height="300"
                                  frameBorder="0"
                                  scrolling="no"
                                  marginHeight="0"
                                  marginWidth="0"
                                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                                    mapCoordinates.lng - 0.002
                                  }%2C${mapCoordinates.lat - 0.002}%2C${
                                    mapCoordinates.lng + 0.002
                                  }%2C${
                                    mapCoordinates.lat + 0.002
                                  }&layer=mapnik&marker=${
                                    mapCoordinates.lat
                                  }%2C${mapCoordinates.lng}`}
                                  style={{ border: 0, borderRadius: "8px" }}
                                ></iframe>

                                <div className="map-actions">
                                  <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                      currentAddress
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="view-on-google-btn"
                                  >
                                    <i className="fas fa-external-link-alt"></i>{" "}
                                    View on Google Maps
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

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
      {/* End Dashboard */}

      <style>{`
        .location-input-container {
          display: flex;
          gap: 10px;
        }

        .location-input {
          flex: 1;
        }

        .find-on-map-btn {
          padding: 10px 15px;
          background-color: #0074d9;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .find-on-map-btn:hover {
          background-color: #0063b1;
        }

        .find-on-map-btn:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }

        .loading-spinner-small {
          display: inline-block;
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: #fff;
          animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .map-toggle-container {
          margin: 10px 0;
          display: flex;
          justify-content: flex-end;
        }

        .map-toggle-btn {
          padding: 5px 15px;
          background-color: #f8f9fa;
          border: 1px solid #ddd;
          border-radius: 5px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .map-toggle-btn:hover {
          background-color: #e2e6ea;
        }

        .map-container {
          margin-top: 10px;
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
        }

        .map-actions {
          padding: 10px;
          background-color: #f8f9fa;
          border-top: 1px solid #ddd;
          text-align: center;
        }

        .view-on-google-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #0074d9;
          text-decoration: none;
          font-weight: 500;
        }

        .view-on-google-btn:hover {
          text-decoration: underline;
        }
      `}</style>
    </>
  );
};

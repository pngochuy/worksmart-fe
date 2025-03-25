import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  fetchCompanyProfile,
  updateCompanyProfile,
  updateCompanyAddress,
  updateImagesProfile,
  uploadImagesProfile,
} from "@/services/employerServices";
import { z } from "zod";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Editor } from "@tinymce/tinymce-react";
import { getUserLoginData } from "@/helpers/decodeJwt";
const API_TYNI_KEY = import.meta.env.VITE_TINY_API_KEY;

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
    .regex(/^[A-Za-zÀ-Ỹà-ỹ\s]+$/, "Company Name must contain only letters."),
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
  const [isCompanyLoading, setIsCompanyLoading] = useState(false);
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
    watch: watchAddress,
    formState: { errors: addressErrors },
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(addressSchema),
  });

  // Watch the address field for changes
  const currentAddress = watchAddress("address");

  useEffect(() => {
    const loadCompanyProfile = async () => {
      try {
        const user = getUserLoginData();

        if (user.role === "Employer") {
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
            setCompanyValue(
              "companyDescription",
              data.companyDescription || ""
            );
            setCompanyValue(
              "createdAt",
              data.createdAt ? data.createdAt.split("T")[0] : ""
            );

            setAddressValue("address", data.address || "");

            // Try to geocode the address if it exists
            if (data.address) {
              geocodeAddress(data.address);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching company profile", error.response);
      }
    };
    loadCompanyProfile();
  }, [setAvatar, setCompanyValue, setAddressValue, navigate]);

  const handleEditorChange = (content) => {
    setCompanyValue("companyDescription", content);
  };

  const onSubmitCompany = async (formData) => {
    try {
      setIsCompanyLoading(true);
      const message = await updateCompanyProfile(formData);
      toast.success(message);
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

      // After successful update, geocode the new address
      if (formData.address) {
        await geocodeAddress(formData.address);
      }
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
        setFileError("Upload failed. Please try again.");
      }
    };
  };

  const handleRemoveImage = async () => {
    if (!avatar) return;
    try {
      await updateImagesProfile("");
      setAvatar("");
      console.log("Image deleted successfully!");
      toast.success("Image deleted successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error while deleting photo:", error);
      setFileError("Delete failed. Please try again.");
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
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <h3>Company Profile!</h3>
            <div className="text">Ready to jump back in?</div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              {/* Company Profile Widget */}
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
                          <label>
                            Company name <span style={{ color: "red" }}>*</span>
                          </label>
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

                        {/* Est. Since */}
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
                              }
                            }}
                            dateFormat="dd/MM/yyyy"
                            maxDate={new Date()}
                            showYearDropdown
                            scrollableYearDropdown
                            yearDropdownItemNumber={100}
                            className="form-control"
                            popperPlacement="bottom-start"
                            popperModifiers={[
                              {
                                name: "offset",
                                options: {
                                  offset: [0, 5],
                                },
                              },
                              {
                                name: "computeStyles",
                                options: {
                                  gpuAcceleration: false,
                                },
                              },
                            ]}
                            popperContainer={({ children }) => (
                              <div
                                style={{ position: "relative", zIndex: 999 }}
                              >
                                {children}
                              </div>
                            )}
                          />
                          {companyErrors.createdAt && (
                            <span className="text-danger">
                              {companyErrors.createdAt.message}
                            </span>
                          )}
                        </div>

                        {/* Company Description */}
                        <div className="form-group col-lg-12 col-md-12">
                          <label>About Company</label>
                          <Editor
                            apiKey={API_TYNI_KEY}
                            {...registerCompany("companyDescription")}
                            value={watch("companyDescription")}
                            init={{
                              height: 300,
                              menubar: false,
                              plugins:
                                "advlist autolink lists link charmap print preview anchor searchreplace visualblocks code fullscreen insertdatetime media table paste help wordcount",
                              toolbar:
                                "undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help",
                            }}
                            onEditorChange={handleEditorChange}
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

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { vietnamProvinces } from "../../helpers/getLocationVN";
import { registerUser } from "@/services/accountServices";
import { useNavigate } from "react-router-dom";

// Validation schema using Zod
const schema = z
  .object({
    fullname: z.string().min(2, "Full name is required"),
    gender: z.enum(["male", "female"], {
      required_error: "Gender is required",
    }),
    personalPhone: z
      .string()
      .regex(/^[0-9]{10}$/, "Phone number must be 10 digits"),
    companyName: z.string().min(2, "Company name is required"),
    workLocation: z.string().min(1, "Work location is required"),
    district: z.string().optional(), // District không bắt buộc
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(20, "Password must not exceed 20 characters")
      .regex(/[a-z]/, "Password must include at least one lowercase letter")
      .regex(/[A-Z]/, "Password must include at least one uppercase letter")
      .regex(/\d/, "Password must include at least one numeric character"),
    confirmPassword: z
      .string()
      .min(8, "Confirm password must be at least 8 characters"),
    agree: z.boolean().refine((value) => value, {
      message: "You must agree to the terms",
    }), 
  })
  // sau khi check hết validate ở trên rồi mới check đk này
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // Field to show the error
  });

export const EmployerRegisterForm = () => {
  const [provinces, setProvinces] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setProvinces(vietnamProvinces); // Lưu dữ liệu các tỉnh vào state
  }, []);

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    control,
    setError,
  } = useForm({
    mode: "onChange", // Real-time validation
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true); // Bắt đầu loading

    try {
      // Gửi request đăng ký
      const response = await registerUser({
        email: data.email,
        password: data.password,
        fullname: data.fullname,
        gender: data.gender,
        personalPhone: data.personalPhone,
        companyName: data.companyName,
        workLocation: data.workLocation,
        role: "Employer",
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          data.fullname
        )}&background=random&color=fff`,
      });

      console.log("Đăng ký thành công:", response);

      // Chuyển hướng sang trang xác nhận email
      navigate(
        `/confirm-email?emailRegistered=${encodeURIComponent(data.email)}`
      );
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      setError("email", {
        // Đặt lỗi cho trường confirmEmailCode
        type: "manual",
        message: error.error || "Email is already registered.",
      });
    }
    setIsLoading(false); // Kết thúc loading
  };

  const isAgreed = watch("agree");

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label>
            Email <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="email"
            placeholder="Enter email"
            {...register("email")}
            style={{ borderColor: errors.email ? "red" : "" }}
          />
          {errors.email && <p className="error-text">{errors.email.message}</p>}
        </div>

        <div className="form-group">
          <label>
            Password <span style={{ color: "red" }}>*</span>
          </label>
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              {...register("password")}
              style={{ borderColor: errors.password ? "red" : "" }}
            />
            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
              role="button"
              aria-label="Toggle password visibility"
            >
              <i
                className={`fa-solid fa-eye${!showPassword ? "-slash" : ""}`}
              ></i>
            </span>
          </div>
          {errors.password && (
            <p className="error-text">{errors.password.message}</p>
          )}
        </div>

        <div className="form-group">
          <label>
            Confirm Password <span style={{ color: "red" }}>*</span>
          </label>
          <div className="password-container">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter password"
              {...register("confirmPassword")}
              style={{ borderColor: errors.confirmPassword ? "red" : "" }}
            />
            <span
              className="eye-icon"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              role="button"
              aria-label="Toggle confirm password visibility"
            >
              <i
                className={`fa-solid fa-eye${
                  !showConfirmPassword ? "-slash" : ""
                }`}
              ></i>
            </span>
          </div>
          {errors.confirmPassword && (
            <p className="error-text">{errors.confirmPassword.message}</p>
          )}
        </div>

        <h3>Employer Information</h3>
        <div className="form-group">
          <label>
            Full name <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="text"
            placeholder="Enter your name"
            {...register("fullname")}
            style={{ borderColor: errors.fullname ? "red" : "" }}
          />
          {errors.fullname && (
            <p className="error-text">{errors.fullname.message}</p>
          )}
        </div>
        <div className="form-group">
          <label>
            Gender <span style={{ color: "red" }}>*</span>
          </label>
          <div className="gender-options">
            <label style={{ marginRight: "10px" }}>
              <input type="radio" value="male" {...register("gender")} /> Male
            </label>
            <label>
              <input type="radio" value="female" {...register("gender")} />{" "}
              Female
            </label>
          </div>
          {errors.gender && (
            <p className="error-text">{errors.gender.message}</p>
          )}
        </div>

        <div className="form-group">
          <label>
            Personal Phone Number <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="text"
            placeholder="Enter your phone number"
            {...register("personalPhone")}
            style={{ borderColor: errors.personalPhone ? "red" : "" }}
          />
          {errors.personalPhone && (
            <p className="error-text">{errors.personalPhone.message}</p>
          )}
        </div>
        <div className="form-group">
          <label>
            Company Name <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="text"
            placeholder="Enter your company name"
            {...register("companyName")}
            style={{ borderColor: errors.companyName ? "red" : "" }}
          />
          {errors.companyName && (
            <p className="error-text">{errors.companyName.message}</p>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="province">
            Work Location <span style={{ color: "red" }}>*</span>
          </label>
          <Controller
            name="workLocation"
            control={control}
            defaultValue="" // Đặt giá trị mặc định
            render={({ field }) => (
              <select
                {...field}
                id="province"
                onChange={(e) => {
                  field.onChange(e.target.value); // Gọi onChange từ react-hook-form
                  // handleProvinceChange(e); // Đồng thời cập nhật tỉnh và quận huyện
                }}
                value={field.value || ""} // Lấy giá trị từ react-hook-form
                // value ở đây 1 là field.value -> chạy đc form
                // 2 là selectedProvince  mới chạy đc selection quận ở dưới
                // => chắc cho chọn tiếng Việt rồi lưu bawfg english
                className="select-dropdown"
                style={{ borderColor: errors.workLocation ? "red" : "" }}
              >
                <option value="" disabled>
                  Select province/city
                </option>
                {provinces.map((province, index) => (
                  <option key={index} value={province.name}>
                    {province.name}
                  </option>
                ))}
              </select>
            )}
          />

          {errors.workLocation && (
            <p className="error-text">{errors.workLocation.message}</p>
          )}
        </div>

        {/* <div className="form-group">
          <label htmlFor="district">District</label>
          <Controller
            name="district"
            control={control}
            defaultValue="" // Giá trị mặc định
            render={({ field }) => (
              <select
                {...field} // Kết nối field của react-hook-form
                id="district"
                value={field.value || ""} // Lấy giá trị từ react-hook-form
                onChange={(e) => {
                  field.onChange(e.target.value); // Cập nhật giá trị của react-hook-form
                }}
                className="select-dropdown"
                disabled={!selectedProvince} // Disable nếu chưa chọn tỉnh
              >
                <option value="" disabled>
                  Select district
                </option>
                {districts.map((district) => (
                  <option key={district.code} value={district.name}>
                    {district.name}
                  </option>
                ))}
              </select>
            )}
          />
        </div> */}

        <div className="form-group">
          <label>
            <input type="checkbox" defaultChecked {...register("agree")} /> I
            agree to the <a href="/terms">Terms of Service</a> and{" "}
            <a href="/privacy">Privacy Policy</a>
          </label>
          {errors.agree && <p className="error-text">{errors.agree.message}</p>}
        </div>
        <div className="form-group">
          <button
            type="submit"
            className={`theme-btn btn-style-one ${
              isValid ? "" : "btn-disabled"
            }`}
            disabled={!isValid || !isAgreed || isLoading} // Disable khi đang loading
          >
            {isLoading ? <span className="loading-spinner"></span> : "Register"}
          </button>
        </div>
      </form>
    </>
  );
};

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../services/accountServices";

// Validation schema using Zod
const schema = z
  .object({
    fullname: z.string().min(2, "Full name cannot be blank"),
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
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // Field to show the error
  });

export const CandidateResgiterForm = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setError, //
  } = useForm({
    mode: "onChange", // Real-time validation
    // mode: "onSubmit",
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true); // Bắt đầu loading

    try {
      // Gửi request đăng ký
      const response = await registerUser({
        fullname: data.fullname,
        email: data.email,
        password: data.password,
        role: "Candidate", // Role thì mặc định là '1' (Candidate)
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
            Full name <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="text"
            placeholder="Enter full name"
            {...register("fullname")}
            style={{ borderColor: errors.fullname ? "red" : "" }}
          />
          {errors.fullname && (
            <p className="error-text">{errors.fullname.message}</p>
          )}
        </div>

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
            // className={`theme-btn btn-style-one ${isAgreed ? "" : "disabled"}`}
            // disabled={!isValid || !isAgreed}
            className={`theme-btn btn-style-one ${
              isValid ? "" : "btn-disabled"
            }`}
            // disabled={!isValid || !isAgreed}
            disabled={!isValid || !isAgreed || isLoading} // Disable khi đang loading
          >
            {isLoading ? <span className="loading-spinner"></span> : "Register"}
          </button>
        </div>
      </form>
    </>
  );
};

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm({
    mode: "onChange", // Real-time validation
    // mode: "onSubmit",
    resolver: zodResolver(schema),
  });

  const onSubmit = (data) => {
    // Chỉ lấy fullname, email và password từ data
    const { fullname, email, password } = data;

    // In ra kết quả
    console.log("Form Data:", { fullname, email, password });
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
            disabled={!isValid || !isAgreed}
          >
            Register
          </button>
        </div>
      </form>
    </>
  );
};

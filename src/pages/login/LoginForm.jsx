import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { loginUser } from "../../services/accountServices";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { getUserRoleFromToken } from "@/helpers/decodeJwt";

const schema = z.object({
  email: z.string().min(1, "Password cannot be blank").email("Invalid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(20, "Password must not exceed 20 characters")
    .regex(/[a-z]/, "Password must include at least one lowercase letter")
    .regex(/[A-Z]/, "Password must include at least one uppercase letter")
    .regex(/\d/, "Password must include at least one numeric character"),
});

export const LoginForm = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(schema), // Kết nối schema với react-hook-form
  });

  const onSubmit = async (data) => {
    setIsLoading(true); // Bắt đầu loading
    try {
      const response = await loginUser({
        email: data.email,
        password: data.password,
      });
      toast.success("Login success!");
      console.log("Login thành công:", response);

      const userRole = getUserRoleFromToken();
      navigate(`/${userRole.toLowerCase()}/dashboard`);
    } catch (error) {
      console.log("Login thất bại:", error);
      setError("email", {
        // Đặt lỗi cho trường confirmEmailCode
        type: "manual",
        message: error.error || "Email is not registered!",
      });
    }
    setIsLoading(false); // Kết thúc loading
  };

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
          <div className="field-outer">
            <div className="input-group checkboxes square">
              <input
                type="checkbox"
                name="remember-me"
                value=""
                id="remember"
              />
              <label htmlFor="remember" className="remember">
                <span className="custom-checkbox"></span> Remember me
              </label>
            </div>
            <a href="/forgot-password" className="pwd">
              Forgot password?
            </a>
          </div>
        </div>

        <div className="form-group">
          <button
            className="theme-btn btn-style-one"
            type="submit"
            name="log-in"
            disabled={isLoading} // Disable khi đang loading
          >
            {isLoading ? <span className="loading-spinner"></span> : "Login"}
          </button>
        </div>
      </form>
    </>
  );
};

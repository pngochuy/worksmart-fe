import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

const schema = z.object({
  email: z.string().min(1, "Password cannot be blank").email("Invalid email"),
  password: z.string().min(1, "Password cannot be blank"),
});

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema), // Kết nối schema với react-hook-form
  });

  const onSubmit = (data) => {
    console.log("Form submitted:", data);
    // Xử lý logic gửi form
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label>Email</label>
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
          >
            Log In
          </button>
        </div>
      </form>
    </>
  );
};

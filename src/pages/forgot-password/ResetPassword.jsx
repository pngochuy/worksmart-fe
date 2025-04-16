import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-toastify";
import { resetPassword } from "@/services/accountServices";
import { useNavigate } from "react-router-dom";

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(50, "Password must not exceed 50 characters")
      .regex(/[a-z]/, "Password must include at least one lowercase letter")
      .regex(/[A-Z]/, "Password must include at least one uppercase letter")
      .regex(/\d/, "Password must include at least one numeric character")
      .regex(
        /[^a-zA-Z\d]/,
        "Password must include at least one special character"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const ResetPassword = ({ email, resetToken }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const resetData = {
        email,
        resetToken,
        newPassword: data.newPassword,
      };

      await resetPassword(resetData);
      toast.success("Password changed successfully! Please login again.");
      navigate("/login");
    } catch (error) {
      if (error.response?.status === 500) {
        toast.error(
          error.response.data?.error || "Server error, please try again."
        );
      } else {
        setError("newPassword", {
          type: "manual",
          message: error.response?.data || "Failed to reset password",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="default-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="form-group">
        <label>New Password</label>
        <input
          type="password"
          {...register("newPassword")}
          placeholder="Enter new password"
        />
        {errors.newPassword && (
          <p className="text-danger">{errors.newPassword.message}</p>
        )}
      </div>
      <div className="form-group">
        <label>Confirm Password</label>
        <input
          type="password"
          {...register("confirmPassword")}
          placeholder="Confirm new password"
        />
        {errors.confirmPassword && (
          <p className="text-danger">{errors.confirmPassword.message}</p>
        )}
      </div>
      <div className="form-group">
        <button className="theme-btn btn-style-one" disabled={loading}>
          {loading ? (
            <span className="loading-spinner"></span>
          ) : (
            "Reset Password"
          )}
        </button>
      </div>
    </form>
  );
};

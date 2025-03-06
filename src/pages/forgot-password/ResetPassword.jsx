import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-toastify";
import { resetPassword } from "@/services/accountServices";
import { useNavigate } from "react-router-dom";

const resetPasswordSchema = z.object({
  token: z.string().min(6, "OTP must be 6 digits"),
  newPassword: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password must not exceed 50 characters")
    .regex(/[a-z]/, "Password must include at least one lowercase letter")
    .regex(/[A-Z]/, "Password must include at least one uppercase letter")
    .regex(/\d/, "Password must include at least one numeric character")
    .regex(/[^a-zA-Z\d]/, "Password must include at least one special character"), // Thêm kiểm tra ký tự đặc biệt
});

export const ResetPassword = ({ email }) => {
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
        token: data.token,
        newPassword: data.newPassword,
      };

      await resetPassword(resetData);
      toast.success("Password changed successfully! Please login again.");
      navigate("/login");
    } catch (error) {
        if (error.response?.status === 500) {
            toast.error(error.response.data?.error || "Server error, please try again.");
        } else {
            setError("token", { type: "manual", message: error.response?.data?.error || "Invalid OTP" });
        }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="default-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="form-group">
        <label>OTP</label>
        <input type="text" {...register("token")} />
        {errors.token && <p className="text-danger">{errors.token.message}</p>}
      </div>
      <div className="form-group">
        <label>New Password</label>
        <input type="password" {...register("newPassword")} />
        {errors.newPassword && <p className="text-danger">{errors.newPassword.message}</p>}
      </div>
      <div className="form-group">
        <button className="theme-btn btn-style-one" disabled={loading}>
            {loading ? <span className="loading-spinner"></span> : "Reset Password"}
        </button>
      </div>
    </form>
  );
};

export default ResetPassword;

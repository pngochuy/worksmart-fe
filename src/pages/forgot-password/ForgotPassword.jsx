import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-toastify";
import { forgotPassword } from "@/services/accountServices";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export const ForgotPassword = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    setError, 
    } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await forgotPassword(data.email);
      toast.success("OTP sent to your email!");
      onSuccess(data.email); // Chuyển sang trang OTP
    } catch (error) {
        if (error.response?.status === 500) {
            toast.error(error.response.data?.error || "Server error, please try again.");
        } else {
            setError("email", { type: "manual", message: error.data || "Email is not register" });
        }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="default-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="form-group">
        <label>Email</label>
        <input type="email" {...register("email")} />
        {errors.email && <p className="text-danger">{errors.email.message}</p>}
      </div>
      <div className="form-group">
        <button className="theme-btn btn-style-one" disabled={loading}>
            {loading ? <span className="loading-spinner"></span> : "Send OTP"}
        </button>
      </div>
    </form>
  );
};

export default ForgotPassword;

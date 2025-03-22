import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-toastify";
import { verifyOTP } from "@/services/accountServices";

const verifyOTPSchema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits"),
});

export const VerifyOTP = ({ email, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { 
    register, 
    handleSubmit, 
    setError, 
    formState: { errors },
  } = useForm({
    resolver: zodResolver(verifyOTPSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const verifyData = {
        email,
        otp: data.otp,
      };

      // Gọi API xác thực OTP
      const response = await verifyOTP(verifyData);
      toast.success("OTP verified successfully!");
      // Lấy resetToken từ response và chuyển sang bước tiếp theo
      onSuccess(response.resetToken);
    } catch (error) {
      if (error.response?.status === 500) {
        toast.error(error.response.data?.error || "Server error, please try again.");
      } else {
        setError("otp", { 
          type: "manual", 
          message: error.response?.data || "Invalid OTP" 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="default-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="form-group">
        <label>OTP</label>
        <input type="text" {...register("otp")} placeholder="Enter 6-digit code" />
        {errors.otp && <p className="text-danger">{errors.otp.message}</p>}
      </div>
      <div className="form-group">
        <button className="theme-btn btn-style-one" disabled={loading}>
          {loading ? <span className="loading-spinner"></span> : "Verify OTP"}
        </button>
      </div>
    </form>
  );
};

export default VerifyOTP;
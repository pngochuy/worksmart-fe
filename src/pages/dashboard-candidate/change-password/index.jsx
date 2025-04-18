import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { requestChangePasswordOTP, verifyChangePasswordOTP, confirmChangePassword } from "@/services/accountServices";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const otpSchema = z.object({
  otp: z.string().min(6, "OTP must be at least 6 characters"),
});
const passwordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(20, "Password must not exceed 20 characters")
    .regex(/[a-z]/, "Password must include at least one lowercase letter")
    .regex(/[A-Z]/, "Password must include at least one uppercase letter")
    .regex(/\d/, "Password must include at least one numeric character"),
  confirmPassword: z.string()
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "Current password cannot be the same as the new password",
  path: ["newPassword"],
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const Index = () => {
  const [step, setStep] = useState(1);
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [changePasswordToken, setChangePasswordToken] = useState("");

  // Step 1: Email form
  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors },
    setError: setError,
  } = useForm({
    resolver: zodResolver(emailSchema),
  });

  // Step 2: OTP form
  const {
    register: registerOTP,
    handleSubmit: handleSubmitOTP,
    formState: { errors: otpErrors },
    setError: setErrorOTP,
  } = useForm({
    resolver: zodResolver(otpSchema),
  });

  // Step 3: Password form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
    setError: setErrorPassword,
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    const userDataString = localStorage.getItem("userLoginData");
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        if (userData.email) {
          setEmail(userData.email);
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    }
  }, []);

  const onSubmitEmail = async (data) => {
    setLoading(true);
    try {
      await requestChangePasswordOTP(data.email);
      setEmail(data.email);
      toast.success("OTP has been sent to your email", {
        position: "top-right",
        autoClose: 3000,
      });
      setStep(2);
    } catch (error) {
      // Thay vì dùng toast, hiển thị lỗi dưới trường email
      setError("email", {
        type: "manual",
        message: error.message || "Failed to send OTP"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const onSubmitOTP = async (data) => {
    setLoading(true);
    try {
      const response = await verifyChangePasswordOTP(email, data.otp);
      setChangePasswordToken(response.changePasswordToken);
      toast.success("OTP verified successfully", {
        position: "top-right",
        autoClose: 3000,
      });
      console.log("OTP:", data.otp);
      setStep(3);
    } catch (error) {
      // Hiển thị lỗi dưới trường OTP
      setErrorOTP("otp", {
        type: "manual",
        message: error.message || "Invalid OTP"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const onSubmitPassword = async (data) => {
    setLoading(true);
    try {
      await confirmChangePassword({
        email: email,
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.newPassword,
        changePasswordToken: changePasswordToken,
      });
      console.log("Data:", data);
      toast.success("Password changed successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      resetPasswordForm();
      setStep(1);
    } catch (error) {
      const errorMsg = error.message || "Incorrect Current Password";
      
      if (errorMsg.toLowerCase().includes("current") || errorMsg.toLowerCase().includes("old")) {
        setErrorPassword("currentPassword", {
          type: "manual",
          message: errorMsg
        });
      } else if (errorMsg.toLowerCase().includes("new")) {
        setErrorPassword("newPassword", {
          type: "manual",
          message: errorMsg
        });
      } else {
        setErrorPassword("currentPassword", {
          type: "manual",
          message: errorMsg
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="user-dashboard">
      <div className="dashboard-outer">
        <div className="upper-title-box">
          <h3>Change Password</h3>
          <div className="text">Secure your account with a new password</div>
        </div>

        <div className="row">
          <div className="col-lg-12">
            <div className="ls-widget">
              <div className="tabs-box">
                <ToastContainer />

                {/* Step 1: Email Form */}
                {step === 1 && (
                  <div className="widget-content">
                    <form className="default-form" onSubmit={handleSubmitEmail(onSubmitEmail)}>
                      <div className="form-group" style={{ marginTop: 20 }}>
                        <h4>Your Email</h4>
                        <input
                          type="email"
                          name="email"
                          placeholder="Enter your email"
                          {...registerEmail("email")}
                          defaultValue={email}
                          style={{ marginTop: 20 }}
                        />
                        {emailErrors.email && (
                          <p className="text-danger">{emailErrors.email.message}</p>
                        )}
                      </div>

                      <div className="form-group">
                        <button
                          className="theme-btn btn-style-one"
                          type="submit"
                          disabled={loading}
                        >
                          {loading ? <span className="loading-spinner"></span> : "Send OTP"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Step 2: OTP Form */}
                {step === 2 && (
                  <div className="widget-content">
                    <form className="default-form" onSubmit={handleSubmitOTP(onSubmitOTP)}>
                      <div className="form-group" style={{ marginTop: 20 }}>
                        <h4 >OTP sent to: {email}</h4>
                        <input
                          type="text"
                          name="otp"
                          placeholder="Enter OTP sent to your email"
                          {...registerOTP("otp")}
                          style={{ marginTop: 20 }}
                        />
                        {otpErrors.otp && (
                          <p className="text-danger">{otpErrors.otp.message}</p>
                        )}
                      </div>

                      <div className="form-group">
                        <button
                          className="theme-btn btn-style-one"
                          type="submit"
                          disabled={loading}
                        >
                          {loading ? <span className="loading-spinner"></span> : "Verify OTP"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Step 3: Password Form */}
                {step === 3 && (
                  <div className="widget-content">
                    <form className="default-form" onSubmit={handleSubmitPassword(onSubmitPassword)}>
                      <div className="form-group" style={{ marginTop: 20 }}>
                        <h4>Current Password</h4>
                        <input
                          type="password"
                          name="currentPassword"
                          placeholder="Enter your current password"
                          {...registerPassword("currentPassword")}
                        />
                        {passwordErrors.currentPassword && (
                          <p className="text-danger">{passwordErrors.currentPassword.message}</p>
                        )}
                      </div>
                      <div className="form-group">
                        <h4>New Password</h4>
                        <input
                          type="password"
                          name="newPassword"
                          placeholder="Enter new password"
                          {...registerPassword("newPassword")}
                        />
                        {passwordErrors.newPassword && (
                          <p className="text-danger">{passwordErrors.newPassword.message}</p>
                        )}
                      </div>

                      <div className="form-group">
                        <h4>Confirm New Password</h4>
                        <input
                          type="password"
                          name="confirmPassword"
                          placeholder="Confirm new password"
                          {...registerPassword("confirmPassword")}
                        />
                        {passwordErrors.confirmPassword && (
                          <p className="text-danger">{passwordErrors.confirmPassword.message}</p>
                        )}
                      </div>

                      <div className="form-group">
                        <button
                          className="theme-btn btn-style-one"
                          type="submit"
                          disabled={loading}
                        >
                          {loading ? <span className="loading-spinner"></span> : "Change Password"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Index;

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { changePassword } from "@/services/accountServices";

const changePasswordSchema = z.object({
  oldPassword: z.string(),
  newPassword: z.string()
  .min(8, "Password must be at least 8 characters")
  .max(20, "Password must not exceed 20 characters")
  .regex(/[a-z]/, "Password must include at least one lowercase letter")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter")
  .regex(/\d/, "Password must include at least one numeric character"),
}).refine((data) => data.oldPassword !== data.newPassword, {
  message: "Old password cannot be the same as the new password",
  path: ["newPassword"],
});

export const Index = () => {
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await changePassword({
        OldPassword: data.oldPassword,
        NewPassword: data.newPassword,
      });
      toast.success("Password changed successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
      reset();
      setApiError("");
    } catch (error) {
      console.error("Full Error Response:", error);
      setError("oldPassword", {
        type: "manual",
        message: error.error || "Old password is incorrect",
      });
      toast.error(error.error || "Failed to change password", {
        position: "top-right",
        autoClose: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <h3>Change Password</h3>
            <div className="text">Ready to jump back in?</div>
          </div>
          <ToastContainer />
          {/* Ls widget */}
          <div className="ls-widget">
            <div className="widget-title">
              <h4>Change Password</h4>
            </div>

            <div className="widget-content">
              <form className="default-form" onSubmit={handleSubmit(onSubmit)}>
                <div className="row">
                  {/* Input */}
                  <div className="form-group col-lg-7 col-md-12">
                    <label>Old Password </label>
                    <input type="password" {...register("oldPassword")} />
                    {errors.oldPassword && (
                      <p className="text-danger">
                        {errors.oldPassword.message}
                      </p>
                    )}
                  </div>

                  {/* Input */}
                  <div className="form-group col-lg-7 col-md-12">
                    <label>New Password</label>
                    <input type="password" {...register("newPassword")} />
                    {errors.newPassword && (
                      <p className="text-danger">
                        {errors.newPassword.message}
                      </p>
                    )}
                  </div>

                  {/* Input */}
                  <div className="form-group col-lg-6 col-md-12">
                    <button
                      className="theme-btn btn-style-one"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="loading-spinner"></span>
                      ) : (
                        "Update"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;

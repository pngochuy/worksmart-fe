import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { toast } from "react-toastify";
import { changePassword } from "@/services/accountServices";

const changePasswordSchema = z.object({
  oldPassword: z.string().min(6, "Old password must be at least 6 characters"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export const Index = () => {
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
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
      toast.success("Password changed successfully!");
      setApiError("");
    } catch (error) {
      console.error("Full Error Response:", error);
      setError("oldPassword", {
        type: "manual",
        message: error.error || "Error while change password!",
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

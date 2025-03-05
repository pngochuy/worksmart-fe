import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { toast } from "react-toastify";
import { changePassword } from "@/services/accountServices";

const changePasswordSchema = z.object({
  oldPassword: z.string().min(6, "Old password must be at least 6 characters"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const index = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data, event) => {
    event.preventDefault();
    try {
      toast.info("Processing...");

      await changePassword({
        OldPassword: data.oldPassword,
        NewPassword: data.newPassword,
      });
      console.log("Data receive", data)
      toast.success("Password changed successfully!");
    } catch (err) {
      console.log("Error:", err);
      toast.error("Failed to change password");
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
                    <input type="password" {...register("oldPassword")}/>
                    {errors.oldPassword && <p className="error">{errors.oldPassword.message}</p>}
                  </div>

                  {/* Input */}
                  <div className="form-group col-lg-7 col-md-12">
                    <label>New Password</label>
                    <input type="password" {...register("newPassword")}/>
                    {errors.newPassword && <p className="error">{errors.newPassword.message}</p>}
                  </div>

                  {/* Input */}
                  <div className="form-group col-lg-7 col-md-12">
                    <label>Confirm Password</label>
                    <input type="password" {...register("confirmPassword")}/>
                    {errors.confirmPassword && <p className="error">{errors.confirmPassword.message}</p>}
                  </div>

                  {/* Input */}
                  <div className="form-group col-lg-6 col-md-12">
                    <button className="theme-btn btn-style-one">Update</button>
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

export default index;
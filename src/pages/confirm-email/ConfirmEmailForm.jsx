import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { confirmEmailWithCode } from "../../services/accountServices";

const schema = z.object({
  confirmEmailCode: z.string().min(1, "Code cannot be blank"),
});

export const ConfirmEmailForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setError, // Sử dụng setError từ react-hook-form để đặt lỗi tùy chỉnh
  } = useForm({
    resolver: zodResolver(schema), // Kết nối schema với react-hook-form
  });

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailRegistered = searchParams.get("emailRegistered"); // Lấy email từ URL
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Gửi request đăng ký
      const response = await confirmEmailWithCode({
        email: emailRegistered,
        code: data.confirmEmailCode,
      });

      console.log("Confirm email thành công:", response);

      // Chuyển hướng sang trang login
      sessionStorage.setItem("emailConfirmed", "true");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Lỗi confirm email:", error);
      setError("confirmEmailCode", {
        // Đặt lỗi cho trường confirmEmailCode
        type: "manual",
        message: error.error || "Mã xác nhận không hợp lệ.",
      });
      setIsLoading(false); // Kết thúc loading
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label>Code</label>
          <input
            type="text"
            placeholder="Enter code"
            {...register("confirmEmailCode")}
            style={{ borderColor: errors.confirmEmailCode ? "red" : "" }}
          />
          {errors.confirmEmailCode && (
            <p className="error-text">{errors.confirmEmailCode.message}</p>
          )}
        </div>

        <div className="form-group">
          <button
            type="submit"
            className={`theme-btn btn-style-one ${
              isValid ? "" : "btn-disabled"
            }`}
            disabled={!isValid || isLoading} // Disable khi đang loading
          >
            {isLoading ? <span className="loading-spinner"></span> : "Confirm"}
          </button>
        </div>
      </form>
    </>
  );
};

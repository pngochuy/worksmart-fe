import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const PaymentCancel = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Tự động chuyển về trang chọn gói ngay lập tức
    navigate("/employer/package-list", {
      state: {
        paymentStatus: "CANCELLED",
        message: "You have canceled the payment",
      },
    });
  }, [navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-xl">Redirecting...</div>
    </div>
  );
};

export default PaymentCancel;

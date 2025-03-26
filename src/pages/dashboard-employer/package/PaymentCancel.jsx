import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentCancel = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Tự động chuyển về trang chọn gói ngay lập tức
    navigate('/employer/package-list', {
      state: {
        paymentStatus: 'CANCELLED',
        message: 'Bạn đã hủy thanh toán'
      }
    });
  }, [navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-xl">Đang chuyển hướng...</div>
    </div>
  );
};

export default PaymentCancel;
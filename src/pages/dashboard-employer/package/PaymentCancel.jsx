import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cancelPayment, processPaymentReturn, checkPaymentStatus } from '@/services/employerServices';

const PaymentCancel = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Tự động chuyển về trang chọn gói ngay lập tức
    navigate('/employer/package-list', {
      state: {
        paymentStatus: 'CANCELLED',
        message: 'You have canceled the payment'
      }
    });
  }, [navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      {/* <div className={`p-8 rounded-lg shadow-xl text-center w-96 ${status?.success ? 'bg-green-100' : 'bg-yellow-100'}`}>
        <h1 className={`text-2xl font-bold mb-4 ${status?.success ? 'text-green-800' : 'text-yellow-800'}`}>
          {status?.success ? 'Payment Successful' : error ? 'Payment Processing Failed' : 'Payment Canceled'}
        </h1>

        {error ? (
          <p className="text-red-700 mb-4">{error}</p>
        ) : status?.success ? (
          <>
            <p className="text-green-700 mb-4">
              Your payment has been processed successfully.
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Redirecting to package list...
            </p>
          </>
        ) : (
          <>
            <p className="text-yellow-700 mb-4">
              Your payment has been canceled.
            </p>
            <p className="text-sm text-gray-600 mb-4">
              You will be redirected to the package selection page in 50 seconds...
            </p>
          </>
        )}

        <button
          onClick={() => navigate('/employer/package-list')}
          className={`${status?.success ? 'bg-green-500' : 'bg-blue-500'} text-white px-4 py-2 rounded hover:bg-blue-600`}
        >
          {status?.success ? 'View Packages' : 'Return to Packages'}
        </button>
      </div> */}
    </div>
  );
};

export default PaymentCancel;

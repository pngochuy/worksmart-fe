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
    const handlePayment = async () => {
      try {
        // Lấy tham số từ URL query parameters
        const searchParams = new URLSearchParams(location.search);
        const orderCode = searchParams.get('orderCode');
        const status = searchParams.get('status');
        const code = searchParams.get('code');
        const id = searchParams.get('id');
        const cancel = searchParams.get('cancel') === 'true' || searchParams.get('cancel') === true;

        if (!orderCode) {
          throw new Error('Order code not found in URL');
        }

        console.log('Processing payment with parameters:', { orderCode, status, code, id, cancel });

        // Kiểm tra xem đây có phải là thanh toán thành công không
        if (code === '00' && status === 'PAID' && cancel === false) {
          // Sử dụng API processPaymentReturn thay vì cancelPayment
          console.log('Detected successful payment, processing return instead of cancel');
          const response = await processPaymentReturn(
            parseInt(orderCode),
            status,
            code,
            id,
            cancel
          );
          
          console.log('Payment return response:', response);
          
          // Kiểm tra lại trạng thái thanh toán
          const paymentStatus = await checkPaymentStatus(orderCode);
          
          setStatus({
            success: true,
            message: 'Payment successful!',
            details: response
          });
          
          // Chuyển hướng đến trang package-list sau khi xử lý thành công
          setTimeout(() => {
            navigate('/employer/package-list');
          }, 100000);
          
          return;
        }

        // Xử lý hủy thanh toán nếu không phải thanh toán thành công
        console.log('Canceling payment for order:', orderCode);
        const response = await cancelPayment(orderCode);
        
        console.log('Cancel payment response:', response);

        setStatus({
          success: false,
          canceled: true,
          message: 'Payment has been canceled',
          details: response
        });
      } catch (error) {
        console.error('Error during payment processing:', error);
        
        setError(
          error.response?.data?.error || 
          error.message || 
          'An error occurred while processing the payment'
        );
      } finally {
        setLoading(false);
      }
    };

    handlePayment();
  }, [location, navigate]);

  // Tự động chuyển hướng sau 5 giây nếu đã hủy
  useEffect(() => {
    let timer;
    if (!loading && status?.canceled) {
      timer = setTimeout(() => {
        navigate('/employer/package-list');
      }, 100000);
    }
    return () => clearTimeout(timer);
  }, [loading, navigate, status]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Processing payment status...</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <div className={`p-8 rounded-lg shadow-xl text-center w-96 ${status?.success ? 'bg-green-100' : 'bg-yellow-100'}`}>
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
      </div>
    </div>
  );
};

export default PaymentCancel;
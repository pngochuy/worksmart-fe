import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  checkPaymentStatus,
  processPaymentReturn,
} from "@/services/employerServices";

const PaymentResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Trích xuất các tham số từ URL
        const searchParams = new URLSearchParams(location.search);
        const orderCode = searchParams.get('orderCode');
        const status = searchParams.get('status');
        const code = searchParams.get('code');
        const id = searchParams.get('id');
        const cancel = searchParams.get('cancel') === 'true' || searchParams.get('cancel') === true;

        // Log toàn bộ thông tin từ URL
        console.log("URL Parameters:", {
          orderCode,
          status,
          code,
          id,
          cancel,
        });

        if (!orderCode) {
          throw new Error("Transaction code not found");
        }

        // Gọi API xử lý kết quả thanh toán
        console.log('Calling processPaymentReturn with:', {
          orderCode: parseInt(orderCode),
          status,
          code,
          id,
          cancel
        });

        const paymentReturnResult = await processPaymentReturn(
          parseInt(orderCode),
          status,
          code,
          id,
          cancel === 'false'
        );

        // Log kết quả trả về từ API xử lý thanh toán
        console.log("Payment Return Result:", paymentReturnResult);

        // Kiểm tra trạng thái thanh toán
        const paymentStatus = await checkPaymentStatus(orderCode);

        // Xác định trạng thái
        const success = paymentStatus.status === 'SUCCESS' &&
          (paymentStatus.status === 'SUCCESS' || paymentStatus.status === 'PAID');

        const canceled = paymentStatus.status === 'CANCELLED';

        setStatus({
          success: success,
          canceled: canceled,
          message: success
            ? 'Payment successful!'
            : canceled
              ? 'Payment canceled.'
              : 'Payment failed.',
          details: {
            paymentStatus,
          }
        });
      } catch (error) {
        // Log toàn bộ thông tin lỗi
        console.error('Error detail:', {
          message: error.message,
          fullError: error,
          responseError: error.response ? error.response.data : null
        });

        setStatus({
          success: false,
          message:
            error.message || "An error occurred while processing the payment",
        });
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  }, [location, navigate]);

  // Đếm ngược và chuyển hướng
  useEffect(() => {
    let timer;
    if (status?.success) {
      // Đếm ngược
      const interval = setInterval(() => {
        setSeconds(prevSeconds => {
          if (prevSeconds <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prevSeconds - 1;
        });
      }, 1000);
      
      // Chuyển hướng sau 30 giây
      timer = setTimeout(() => {
        navigate("/employer/package-list");
      }, 30000);
      
      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
    return () => clearTimeout(timer);
  }, [status, navigate]);

  if (loading) {
    return (
      <div className="container d-flex justify-content-center align-items-center vh-45">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h3 className="text-primary">Confirming payment...</h3>
          <p className="text-muted">Please wait while we verify your transaction</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container d-flex justify-content-center align-items-center vh-45">
      <div className="col-md-8 col-lg-6">
        <div className={`card border-0 shadow ${
          status.success 
            ? 'border-success' 
            : status.canceled 
              ? 'border-warning' 
              : 'border-danger'
        }`}>
          <div className={`card-header text-white ${
            status.success 
              ? 'bg-success' 
              : status.canceled 
                ? 'bg-warning' 
                : 'bg-danger'
          }`}>
            <h4 className="mb-0 text-center">
              {status.success && (
                <i className="bi bi-check-circle-fill me-2"></i>
              )}
              {status.canceled && (
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
              )}
              {!status.success && !status.canceled && (
                <i className="bi bi-x-circle-fill me-2"></i>
              )}
              Payment Status
            </h4>
          </div>
          
          <div className="card-body text-center p-5">
            {status.success && (
              <div className="mb-4">
                <div className="d-flex justify-content-center mb-4">
                  <div className="success-animation">
                    <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52" width="70">
                      <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                      <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                    </svg>
                  </div>
                </div>
                <h2 className="text-success fw-bold">{status.message}</h2>
                <p className="lead mb-4">Your payment has been confirmed successfully.</p>
                <div className="alert alert-light border">
                  <p className="text-muted mb-0">
                    You will be redirected to the package selection page in <span className="fw-bold">{seconds}</span> seconds...
                  </p>
                </div>
                <div className="mt-4">
                  <button 
                    onClick={() => navigate('/employer/package-list')} 
                    className="btn btn-outline-success btn-lg px-4"
                  >
                    Return to Packages
                  </button>
                </div>
              </div>
            )}
            
            {status.canceled && (
              <div className="mb-4">
                <div className="d-flex justify-content-center mb-4">
                  <div className="warning-icon">
                    <i className="bi bi-exclamation-circle text-warning" style={{ fontSize: "5rem" }}></i>
                  </div>
                </div>
                <h2 className="text-warning fw-bold">{status.message}</h2>
                <p className="lead mb-4">Your payment has been canceled.</p>
                <div className="alert alert-light border">
                  <p className="text-muted mb-0">
                    You can try again or select a different payment method.
                  </p>
                </div>
                <div className="mt-4">
                  <button 
                    onClick={() => navigate('/employer/package-list')} 
                    className="btn btn-warning btn-lg px-4"
                  >
                    Return to Packages
                  </button>
                </div>
              </div>
            )}
            
            {!status.success && !status.canceled && (
              <div className="mb-4">
                <div className="d-flex justify-content-center mb-4">
                  <div className="error-icon">
                    <i className="bi bi-x-circle text-danger" style={{ fontSize: "5rem" }}></i>
                  </div>
                </div>
                <h2 className="text-danger fw-bold">{status.message}</h2>
                <p className="lead mb-4">Sorry, we couldn't process your payment.</p>
                <div className="alert alert-light border">
                  <p className="text-muted mb-0">
                    Please check your payment details and try again, or contact customer support if the problem persists.
                  </p>
                </div>
                <div className="mt-4 d-flex justify-content-center gap-3">
                  <button 
                    onClick={() => navigate('/employer/package-list')} 
                    className="btn btn-danger btn-lg px-4"
                  >
                    Try Again
                  </button>
                  <button 
                    onClick={() => navigate('/contact')} 
                    className="btn btn-outline-secondary btn-lg px-4"
                  >
                    Contact Support
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="card-footer bg-light p-3 text-center">
            <small className="text-muted">
              Transaction ID: {new URLSearchParams(location.search).get('orderCode')}
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;
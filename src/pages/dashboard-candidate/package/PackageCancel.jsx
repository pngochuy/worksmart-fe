import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cancelPayment, checkPaymentStatus } from '@/services/employerServices';

const PaymentCancel = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seconds, setSeconds] = useState(5);

  useEffect(() => {
    const processCancellation = async () => {
      try {
        // Extract parameters from URL
        const searchParams = new URLSearchParams(location.search);
        const orderCode = searchParams.get('orderCode');
        const status = searchParams.get('status');
        const code = searchParams.get('code');
        const id = searchParams.get('id');
        const cancel = searchParams.get('cancel') === 'true' || searchParams.get('cancel') === true;

        // Log all information from URL
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

        // Call API to process payment cancellation
        console.log('Calling cancelPayment with:', {
          orderCode: parseInt(orderCode),
          status,
          code,
          id,
          cancel
        });

        const cancellationResult = await cancelPayment({
          orderCode: parseInt(orderCode),
          status,
          code,
          id,
          cancel
        });

        // Log result from API
        console.log("Payment Cancellation Result:", cancellationResult);

        // Check payment status
        const paymentStatus = await checkPaymentStatus(orderCode);

        setStatus({
          success: false,
          canceled: true,
          message: 'Payment cancelled.',
          details: {
            paymentStatus,
          }
        });
      } catch (error) {
        // Log all error information
        console.error('Error detail:', {
          message: error.message,
          fullError: error,
          responseError: error.response ? error.response.data : null
        });

        setStatus({
          success: false,
          canceled: true,
          message: error.message || "An error occurred while processing the cancellation",
        });
      } finally {
        setLoading(false);
      }
    };

    processCancellation();
  }, [location, navigate]);

  // Countdown and redirect
  useEffect(() => {
    let timer;
    if (status?.canceled) {
      // Countdown
      const interval = setInterval(() => {
        setSeconds(prevSeconds => {
          if (prevSeconds <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prevSeconds - 1;
        });
      }, 1000);
      
      // Redirect after 5 seconds
      timer = setTimeout(() => {
        navigate("/candidate/package-list");
      }, 5000);
      
      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
    return () => clearTimeout(timer);
  }, [status, navigate]);

  if (loading) {
    return (
      <div className="container d-flex justify-content-center align-items-center vh-45" style={{marginTop: 30}}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h3 className="text-primary">Processing cancellation...</h3>
          <p className="text-muted">Please wait while we process your cancellation request</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container d-flex justify-content-center align-items-center vh-45">
      <div className="col-md-8 col-lg-6" style={{marginTop: 30}}>
        <div className="card border-0 shadow border-warning">
          <div className="card-header text-white bg-warning">
            <h4 className="mb-0 text-center">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              Payment Cancellation
            </h4>
          </div>
          
          <div className="card-body text-center p-5">
            <div className="mb-4">
              <div className="d-flex justify-content-center mb-4">
                <div className="warning-icon">
                  <i className="bi bi-exclamation-circle text-warning" style={{ fontSize: "5rem" }}></i>
                </div>
              </div>
              <h2 className="text-warning fw-bold">{status.message}</h2>
              <p className="lead mb-4">Your payment has been cancelled.</p>
              <div className="alert alert-light border">
                <p className="text-muted mb-0">
                  You will be redirected to the package selection page in <span className="fw-bold">{seconds}</span> seconds...
                </p>
              </div>
              <div className="mt-4">
                <button 
                  onClick={() => navigate('/candidate/package-list')} 
                  className="btn btn-warning btn-lg px-4"
                >
                  Return to Packages
                </button>
              </div>
            </div>
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

export default PaymentCancel;
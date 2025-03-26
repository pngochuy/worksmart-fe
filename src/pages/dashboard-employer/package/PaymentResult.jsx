import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { checkPaymentStatus, processPaymentReturn } from '@/services/employerServices';

const PaymentResult = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const processPayment = async () => {
            try {
                // Trích xuất các tham số từ URL
                const searchParams = new URLSearchParams(location.search);
                const orderCode = searchParams.get('orderCode');
                const status = searchParams.get('status');
                const code = searchParams.get('code');
                const id = searchParams.get('id');
                const cancel = searchParams.get('cancel') === 'false';
    
                // Log toàn bộ thông tin từ URL
                console.log('URL Parameters:', {
                    orderCode,
                    status,
                    code,
                    id,
                    cancel
                });
    
                if (!orderCode) {
                    throw new Error('Không tìm thấy mã giao dịch');
                }
    
                // Gọi API xử lý kết quả thanh toán
                console.log('Calling processPaymentReturn with:', {
                    orderCode: parseInt(orderCode),
                    status, 
                    code, 
                    id, 
                    cancel: cancel === 'false'
                });
    
                const paymentReturnResult = await processPaymentReturn(
                    parseInt(orderCode), 
                    status, 
                    code, 
                    id, 
                    cancel === 'false'
                );
    
                // Log kết quả trả về từ API xử lý thanh toán
                console.log('Payment Return Result:', paymentReturnResult);
    
                // Kiểm tra trạng thái thanh toán
                console.log('Checking payment status for orderCode:', orderCode);
                const paymentStatus = await checkPaymentStatus(orderCode);
                console.log('Payment Status Result:', paymentStatus);
    
                // Xác định trạng thái
                const success = paymentReturnResult.status === 'SUCCESS' && 
                                (paymentStatus.status === 'SUCCESS' || paymentStatus.status === 'PAID');
                
                console.log('Calculated Success Status:', success);
    
                setStatus({
                    success: success,
                    message: success
                        ? 'Thanh toán thành công!'
                        : 'Thanh toán không thành công.',
                    details: {
                        paymentReturnResult,
                        paymentStatus
                    }
                });
            } catch (error) {
                // Log toàn bộ thông tin lỗi
                console.error('Lỗi chi tiết:', {
                    message: error.message,
                    fullError: error,
                    responseError: error.response ? error.response.data : null
                });
    
                setStatus({
                    success: false,
                    message: error.message || 'Đã xảy ra lỗi trong quá trình xử lý thanh toán',
                });
            } finally {
                setLoading(false);
            }
        };
    
        processPayment();
    }, [location, navigate]);

    // Quay về trang chọn gói sau 5 giây nếu thành công
    useEffect(() => {
        let timer;
        if (status?.success) {
            timer = setTimeout(() => {
                navigate('/employer/package-list');
            }, 30000);
        }
        return () => clearTimeout(timer);
    }, [status, navigate]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-xl">Đang xác nhận thanh toán...</div>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center h-screen">
            <div className={`
        p-8 rounded-lg shadow-xl text-center w-96
        ${status.success ? 'bg-green-100' : 'bg-red-100'}
      `}>
                <h1 className={`
          text-2xl font-bold mb-4
          ${status.success ? 'text-green-800' : 'text-red-800'}
        `}>
                    {status.message}
                </h1>

                {status.success ? (
                    <>
                        <p className="text-green-700 mb-4">
                            Thanh toán của bạn đã được xác nhận thành công.
                        </p>
                        <p className="text-sm text-gray-600">
                            Bạn sẽ được chuyển về trang chọn gói sau 30 giây...
                        </p>
                    </>
                ) : (
                    <>
                        <p className="text-red-700 mb-4">
                            Rất tiếc, thanh toán không thành công.
                        </p>
                        <button
                            onClick={() => navigate('/employer/package-list')}
                            className="bg-red-500 text-white px-4 py-2 rounded"
                        >
                            Thử lại
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentResult;
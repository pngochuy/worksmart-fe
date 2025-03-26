import React, { useState, useEffect } from 'react';
import { createPaymentLink } from '@/services/employerServices';
import { useLocation } from 'react-router-dom';

const PackagePurchase = () => {
    const location = useLocation();
    const [purchaseStatus, setPurchaseStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (location.state?.paymentStatus === 'CANCELLED') {
            setPurchaseStatus({
                success: false,
                message: location.state.message || 'Thanh toán đã bị hủy'
            });
        }
    }, [location.state]);

    // Danh sách gói dịch vụ giả
    const packages = [
        {
            id: 1,
            name: 'Gói Cơ Bản',
            price: 99000,
            description: 'Gói dịch vụ dành cho người mới bắt đầu'
        },
        {
            id: 2,
            name: 'Gói Nâng Cao',
            price: 199000,
            description: 'Gói dịch vụ đầy đủ tính năng'
        },
        {
            id: 3,
            name: 'Gói Cao Cấp',
            price: 299000,
            description: 'Gói dịch vụ toàn diện với nhiều ưu đãi'
        }
    ];

    const handlePurchase = async (selectedPackage) => {
        setLoading(true);
        setPurchaseStatus(null);
      
        try {
          const userDataString = localStorage.getItem("userLoginData");
          let userId = null;
      
          if (userDataString) {
            try {
              const userData = JSON.parse(userDataString);
              userId = userData.userID;
              console.log("UserID:", userId);
            } catch (error) {
              console.error("Lỗi phân tích dữ liệu người dùng:", error);
              throw new Error("Không thể lấy thông tin người dùng");
            }
          }
      
          if (!userId) {
            throw new Error("Vui lòng đăng nhập để thực hiện giao dịch");
          }
      
          const paymentData = await createPaymentLink(userId, selectedPackage.id);
      
          window.location.href = paymentData.checkoutUrl;
        } catch (error) {
          console.error('Lỗi trong quá trình thanh toán:', error);
          setPurchaseStatus({
            success: false,
            message: error.message || 'Thanh toán thất bại. Vui lòng thử lại.'
          });
        } finally {
          setLoading(false);
        }
      };

    return (
        <div className="container mx-auto p-4">
            {purchaseStatus && (
                <div className={`mb-4 p-4 rounded ${purchaseStatus.success ? 'bg-green-100' : 'bg-red-100'}`}>
                    {purchaseStatus.message}
                </div>
            )}

            <h1 className="text-2xl font-bold mb-4">Chọn Gói Dịch Vụ</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {packages.map((pkg) => (
                    <div key={pkg.id} className="border p-4 rounded">
                        <h2 className="text-xl font-semibold">{pkg.name}</h2>
                        <p className="text-gray-600">{pkg.description}</p>
                        <p className="text-lg font-bold">{pkg.price.toLocaleString()} VND</p>
                        <button
                            onClick={() => handlePurchase(pkg)}
                            disabled={loading}
                            className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                        >
                            {loading ? 'Đang xử lý...' : 'Chọn Gói'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PackagePurchase;
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
        message: location.state.message || 'Payment has been cancelled'
      });
    }
  }, [location.state]);

  // Danh sách gói dịch vụ giả
  const packages = [
    {
      id: 1,
      name: 'Member ship',
      price: 5000,
      description: 'Member ship'
    },
    {
      id: 2,
      name: 'Upgrade',
      price: 5000,
      description: 'Upgrade'
    },
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
          console.error("Error parsing user data:", error);
          throw new Error("Unable to get user information");
        }
      }

      if (!userId) {
        throw new Error("Please login to make a transaction");
      }

      const paymentData = await createPaymentLink(userId, selectedPackage.id);

      window.location.href = paymentData.checkoutUrl;
    } catch (error) {
      console.error('Error during payment:', error);
      setPurchaseStatus({
        success: false,
        message: error.message || 'Payment failed. Please try again.'
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

      <h1 className="text-2xl font-bold mb-4">Select Service Package</h1>
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
              {loading ? 'Processing...' : 'Select Package'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PackagePurchase;
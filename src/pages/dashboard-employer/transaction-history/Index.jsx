import React, { useState, useEffect } from "react";
import { getUserTransactions } from "@/services/employerServices";
import { format } from "date-fns";

export const Index = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getUserId = () => {
    const userDataString = localStorage.getItem("userLoginData");
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        return userData.userID;
      } catch (error) {
        console.error("Error parsing user data:", error);
        throw new Error("Unable to get user information");
      }
    }
    
    throw new Error("Please login to view your transactions");
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        
        const userId = getUserId();
        
        try {
          const data = await getUserTransactions(userId);
          setTransactions(Array.isArray(data) ? data : []);
          setError(null); // Clear any previous errors
        } catch (apiError) {
          console.error("API Error:", apiError);
          
          if (apiError.response && apiError.response.status === 404) {
            setTransactions([]);
            setError(null);
          } else {
            setError(apiError.message || "Failed to load transaction data");
          }
        }
      } catch (err) {
        setError(err.message || "Failed to load user data");
        console.error("User ID Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Format date function
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy HH:mm");
    } catch (error) {
      return dateString;
    }
  };

  // Status badge color
  const getStatusBadgeColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "success":
      case "paid":
        return "bg-success";
      case "pending":
        return "bg-warning";
      case "failed":
      case "cancelled":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  return (
    <section className="user-dashboard">
      <div className="dashboard-outer">
        <div className="upper-title-box">
          <h3>Transaction History</h3>
          <div className="text">All your payment transactions</div>
        </div>

        <div className="row">
          <div className="col-lg-12">
            <div className="ls-widget">
              <div className="tabs-box">
                <div className="widget-title">
                  <h4>My Transactions</h4>
                </div>

                <div className="widget-content">
                  {loading ? (
                    <div className="text-center py-4">Loading...</div>
                  ) : error ? (
                    <div className="text-center py-4 text-danger">{error}</div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-4">No Transaction To Display</div>
                  ) : (
                    <div className="table-outer">
                      <table className="default-table manage-job-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Order Code</th>
                            <th>Content</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                          </tr>
                        </thead>

                        <tbody>
                          {transactions.map((transaction, index) => (
                            <tr key={transaction.transactionID}>
                              <td>{index + 1}</td>
                              <td className="order-code">#{transaction.orderCode}</td>
                              <td className="transaction-content">{transaction.content}</td>
                              <td className="amount">{transaction.price.toLocaleString('vi-VN')} VNĐ</td>
                              <td className="status">
                                <span className={`badge ${getStatusBadgeColor(transaction.status)}`}>
                                  {transaction.status}
                                </span>
                              </td>
                              <td className="date">{formatDate(transaction.createdAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
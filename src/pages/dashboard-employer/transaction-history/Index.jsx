import React, { useState, useEffect } from "react";
import { getUserTransactions } from "@/services/employerServices";
import { format } from "date-fns";

export const Index = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
          console.log("Transaction data:", data);
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
      return format(date, "dd/MM/yyyy");
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
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
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2">Loading transactions...</p>
                    </div>
                  ) : error ? (
                    <div className="text-center py-4 text-danger">{error}</div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-4">
                      <div className="empty-state">
                        <i className="la la-file-invoice-dollar la-3x text-muted mb-3"></i>
                        <p>No transactions to display</p>
                      </div>
                    </div>
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
                          {currentTransactions.map((transaction, index) => (
                            <tr key={transaction.transactionID}>
                              <td>{indexOfFirstItem + index + 1}</td>
                              <td className="order-code">#{transaction.orderCode}</td>
                              <td className="transaction-content">{transaction.content}</td>
                              <td className="amount">{transaction.price.toLocaleString('vi-VN')} VND</td>
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
                      
                      {/* Thêm phân trang */}
                      {transactions.length > 0 && (
                        <div className="pagination-container mt-4 d-flex justify-content-center">
                          <nav aria-label="Transaction pagination">
                            <ul className="pagination">
                              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                <button
                                  className="page-link"
                                  onClick={goToPreviousPage}
                                  disabled={currentPage === 1}
                                >
                                  <i className="la la-angle-left"></i>
                                </button>
                              </li>

                              {[...Array(totalPages).keys()].map((number) => (
                                <li
                                  key={number + 1}
                                  className={`page-item ${currentPage === number + 1 ? "active" : ""}`}
                                >
                                  <button
                                    className="page-link"
                                    onClick={() => paginate(number + 1)}
                                  >
                                    {number + 1}
                                  </button>
                                </li>
                              ))}

                              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                <button
                                  className="page-link"
                                  onClick={goToNextPage}
                                  disabled={currentPage === totalPages}
                                >
                                  <i className="la la-angle-right"></i>
                                </button>
                              </li>
                            </ul>
                          </nav>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          /* Empty state styling */
          .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            color: #6c757d;
          }
          
          /* Pagination styling */
          .pagination-container {
            margin-top: 20px;
          }
          
          .pagination .page-link {
            color: #2361ff;
            border: 1px solid #dee2e6;
            padding: 8px 12px;
          }
          
          .pagination .page-item.active .page-link {
            background-color: #2361ff;
            border-color: #2361ff;
            color: white;
          }
          
          .pagination .page-item.disabled .page-link {
            color: #6c757d;
            pointer-events: none;
            background-color: #fff;
            border-color: #dee2e6;
          }
          
          /* Badge styling enhancements */
          .badge {
            padding: 5px 10px;
            border-radius: 4px;
            font-weight: 500;
          }
          
          .bg-success {
            background-color: #28a745 !important;
          }
          
          .bg-warning {
            background-color: #ffc107 !important;
            color: #212529 !important;
          }
          
          .bg-danger {
            background-color: #dc3545 !important;
          }
          
          .bg-secondary {
            background-color: #6c757d !important;
          }
          
          /* Table styling */
          .default-table td {
            vertical-align: middle;
          }
          
          .transaction-content {
            max-width: 300px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .amount {
            font-weight: 600;
          }
          
          .order-code {
            font-family: monospace;
            font-weight: 600;
          }
        `}
      </style>
    </section>
  );
};
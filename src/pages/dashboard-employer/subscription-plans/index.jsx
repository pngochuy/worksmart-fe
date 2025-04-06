import React, { useState, useEffect } from "react";
import { getEmployerSubscriptions } from "@/services/employerServices";
import { format } from "date-fns";

export const index = () => {
  const [subscriptionsData, setSubscriptionsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  // Thêm các state phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getUserId = () => {
    if (userInfo && userInfo.userID) {
      return userInfo.userID;
    }
    
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
    
    throw new Error("Please login to view your packages");
  };

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        setLoading(true);
        const userId = getUserId();
        
        try {
          const data = await getEmployerSubscriptions(userId);
          setSubscriptionsData(Array.isArray(data) ? data : []);
          setError(null); // Clear any previous errors
        } catch (apiError) {
          console.error("API Error:", apiError);
          
          if (apiError.response && apiError.response.status === 404) {
            setSubscriptionsData([]);
            setError(null);
          } else {
            setError(apiError.message || "Failed to load subscription data");
          }
        }
      } catch (err) {
        setError(err.message || "Failed to load user data");
        console.error("User ID Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, [userInfo]);

  const calculateUsage = (subscription, package_) => {
    if (package_.jobPostLimitPerDay) {
        const remainingDays = Math.max(0, Math.ceil((new Date(subscription.expDate) - new Date()) / (1000 * 60 * 60 * 24)));

        return {
            remaining: remainingDays
        };
    }

    if (package_.cvLimit) {
        return {
            total: package_.cvLimit,
            postRemaining: package_.cvLimit,
            remaining: Math.max(0, Math.ceil((new Date(subscription.expDate) - new Date()) / (1000 * 60 * 60 * 24)))
        };
    }

    return { total: 0, postRemaining: 0, remaining: 0 };
  };

  // Helper function to determine if a subscription is active
  const isActive = (expDate) => {
    return new Date(expDate) > new Date();
  };

  // Format date function
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy");
    } catch (error) {
      return dateString;
    }
  };

  // Tính toán phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSubscriptions = subscriptionsData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(subscriptionsData.length / itemsPerPage);

  // Hàm điều hướng phân trang
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
    <>
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <h3>Packages</h3>
            <div className="text">Ready to jump back in?</div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4>My Packages</h4>
                  </div>

                  <div className="widget-content">
                    {loading ? (
                      <div className="text-center py-4">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2">Loading packages...</p>
                      </div>
                    ) : error ? (
                      <div className="text-center py-4 text-danger">{error}</div>
                    ) : subscriptionsData.length === 0 ? (
                      <div className="text-center py-4">
                        <div className="empty-state">
                          <i className="la la-box-open la-3x text-muted mb-3"></i>
                          <p>No Subscription To Display</p>
                        </div>
                      </div>
                    ) : (
                      <div className="table-outer">
                        <table className="default-table manage-job-table">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Package</th>
                              <th>Total Jobs Post</th>
                              <th>Total Jobs Featured</th>
                              <th>Expiry</th>
                              <th>Remaining Days</th>
                              <th>Status</th>
                            </tr>
                          </thead>

                          <tbody>
                            {currentSubscriptions.map((item, index) => {
                              const subscription = item.subscription || {};
                              const package_ = item.package || {};
                              const usage = calculateUsage(subscription, package_);
                              
                              return (
                                <tr key={index}>
                                  <td>{indexOfFirstItem + index + 1}</td>
                                  <td className="package" style={{ textDecoration: "none", color: "black" }}>
                                    <div className="font-weight-bold">{package_.name}</div>
                                  </td>
                                  <td className="total-jobs">
                                    {package_.jobPostLimitPerDay ? 
                                      `${package_.jobPostLimitPerDay} per day` : 
                                      package_.cvLimit || 'N/A'}
                                  </td>
                                  <td className="post-remaining">{package_.featuredJobPostLimit}</td>
                                  <td className="expiry">
                                    {formatDate(subscription.expDate)}
                                  </td>
                                  <td className="remaining">{usage.remaining}</td>
                                  <td className="status">
                                    <span className={isActive(subscription.expDate) ? "badge bg-success" : "badge bg-danger"}>
                                      {isActive(subscription.expDate) ? "Active" : "Expired"}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        
                        {/* Phân trang */}
                        {subscriptionsData.length > 0 && (
                          <div className="pagination-container mt-4 d-flex justify-content-center">
                            <nav aria-label="Subscription pagination">
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
      </section>

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
          
          /* Badge styling */
          .badge {
            padding: 5px 10px;
            border-radius: 4px;
            font-weight: 500;
          }
          
          .bg-success {
            background-color: #28a745 !important;
          }
          
          .bg-danger {
            background-color: #dc3545 !important;
          }
        `}
      </style>
    </>
  );
};
import React, { useState, useEffect } from "react";
import { getEmployerSubscriptions } from "@/services/employerServices";
import { format } from "date-fns";

export const index = () => {
  const [subscriptionsData, setSubscriptionsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null); 

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
                      <div className="text-center py-4">Loading...</div>
                    ) : error ? (
                      <div className="text-center py-4 text-danger">{error}</div>
                    ) : subscriptionsData.length === 0 ? (
                      <div className="text-center py-4">No Subscription To Display</div>
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
                            {subscriptionsData.map((item, index) => {
                              const subscription = item.subscription || {};
                              const package_ = item.package || {};
                              const usage = calculateUsage(subscription, package_);
                              
                              return (
                                <tr key={index}>
                                  <td>{index + 1}</td>
                                  <td className="package">
                                    <a href="#">{package_.name}</a>
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
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
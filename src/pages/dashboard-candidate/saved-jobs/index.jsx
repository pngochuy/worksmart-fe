import React, { useState, useEffect } from "react";
import axios from "axios";
import { fetchJobDetails } from "../../../services/jobServices";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const SavedJobsPage = () => {
  const [favoriteJobs, setFavoriteJobs] = useState([]);
  const [timeFilter, setTimeFilter] = useState("Last 6 Months");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

  // Lấy userId từ localStorage - Sửa đổi để xử lý nhiều trường hợp lưu trữ user
  const getUserId = () => {
    try {
      // Kiểm tra các cách lưu trữ khác nhau
      const userString = localStorage.getItem("user");
      if (!userString) {
        console.log("No user found in localStorage");
        return null;
      }

      // Parse dữ liệu user
      const user = JSON.parse(userString);
      console.log("User from localStorage:", user);

      // Xác định id từ các cấu trúc khác nhau
      if (user.id) return user.id;
      if (user.userId) return user.userId;
      if (user.userID) return user.userID;

      console.log("User object does not contain id field");
      return null;
    } catch (e) {
      console.error("Error parsing user data:", e);
      return null;
    }
  };

  // Kiểm tra xác thực
  const checkAuth = () => {
    const token = localStorage.getItem("token");
    const userId = getUserId();

    console.log(
      "Auth check - Token:",
      token ? "Exists" : "Missing",
      "UserId:",
      userId
    );

    if (!token || !userId) {
      console.log("Authentication failed, redirecting to login");
      return false;
    }

    return true;
  };

  // Fetch favorite jobs - Đã sửa để xử lý lỗi xác thực
  const fetchFavoriteJobs = async () => {
    const userId = getUserId();
    if (!userId) {
      console.log("No userId available for fetching favorite jobs");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log(`Fetching favorite jobs for user ${userId}`);

      // Thêm token vào header request
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(
        `${BACKEND_API_URL}/api/FavoriteJob/user/${userId}`,
        { headers }
      );
      console.log("Favorite jobs API response:", response.data);

      // Get job details for each favorite job
      const favoriteJobsWithDetails = await Promise.all(
        response.data.map(async (favorite) => {
          try {
            const jobDetails = await fetchJobDetails(favorite.jobID);
            return {
              ...favorite,
              job: jobDetails,
            };
          } catch (err) {
            console.error(
              `Error fetching job details for job ${favorite.jobID}:`,
              err
            );
            return {
              ...favorite,
              job: {
                title: "Job information unavailable",
                companyName: "Unknown",
              },
            };
          }
        })
      );

      setFavoriteJobs(favoriteJobsWithDetails);
      setError(null);
    } catch (err) {
      console.error("Error fetching favorite jobs:", err);

      // Kiểm tra lỗi xác thực
      if (
        err.response &&
        (err.response.status === 401 || err.response.status === 403)
      ) {
        console.log("Authentication error, redirecting to login");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      setError("Failed to load saved jobs. Please try again later.");
      toast.error("Failed to load saved jobs");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a favorite job
  const deleteFavoriteJob = async (favoriteJobId) => {
    try {
      // Thêm token vào header request
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.delete(
        `${BACKEND_API_URL}/api/FavoriteJob/${favoriteJobId}`,
        { headers }
      );
      // After successful deletion, update the local state
      setFavoriteJobs(
        favoriteJobs.filter((job) => job.favoriteJobID !== favoriteJobId)
      );
      toast.success("Job removed from saved list");
    } catch (err) {
      console.error("Error deleting favorite job:", err);
      toast.error("Failed to remove job from saved list");
    }
  };

  // Handle time filter change
  const handleFilterChange = (e) => {
    setTimeFilter(e.target.value);
    // Filter jobs based on selected time range
    filterJobsByTime(e.target.value);
  };

  // Filter jobs based on time range
  const filterJobsByTime = (timeRange) => {
    setIsLoading(true);

    const currentDate = new Date();
    let filterDate = new Date();

    switch (timeRange) {
      case "Last 6 Months":
        filterDate.setMonth(currentDate.getMonth() - 6);
        break;
      case "Last 12 Months":
        filterDate.setMonth(currentDate.getMonth() - 12);
        break;
      case "Last 16 Months":
        filterDate.setMonth(currentDate.getMonth() - 16);
        break;
      case "Last 24 Months":
        filterDate.setMonth(currentDate.getMonth() - 24);
        break;
      case "Last 5 year":
        filterDate.setFullYear(currentDate.getFullYear() - 5);
        break;
      default:
        filterDate.setMonth(currentDate.getMonth() - 6);
    }

    // Re-fetch from API or filter the existing data
    fetchFavoriteJobs(); // You might want to add filter parameters to the API call instead
  };

  // View job details
  const viewJobDetails = (jobId) => {
    navigate(`/job/${jobId}`);
  };

  // Load favorite jobs on component mount
  useEffect(() => {
    // Kiểm tra xác thực trước khi fetch dữ liệu
    if (checkAuth()) {
      fetchFavoriteJobs();
    } else {
      // Chuyển hướng đến trang đăng nhập nếu không có thông tin xác thực
      navigate("/login");
    }
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      {/* Dashboard */}
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <h3>Saved Jobs</h3>
            <div className="text">Ready to jump back in?</div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              {/* Ls widget */}
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4>My Saved Jobs</h4>

                    <div className="chosen-outer">
                      {/*Tabs Box*/}
                      <select
                        className="chosen-select"
                        value={timeFilter}
                        onChange={handleFilterChange}
                      >
                        <option>Last 6 Months</option>
                        <option>Last 12 Months</option>
                        <option>Last 16 Months</option>
                        <option>Last 24 Months</option>
                        <option>Last 5 year</option>
                      </select>
                    </div>
                  </div>

                  <div className="widget-content">
                    <div className="table-outer">
                      {isLoading ? (
                        <div className="text-center py-5">
                          <div
                            className="spinner-border text-primary"
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                      ) : error ? (
                        <div className="alert alert-danger" role="alert">
                          {error}
                        </div>
                      ) : favoriteJobs.length === 0 ? (
                        <div className="text-center py-5">
                          <p>You don't have any saved jobs yet.</p>
                        </div>
                      ) : (
                        <table className="default-table manage-job-table">
                          <thead>
                            <tr>
                              <th>Job Title</th>
                              <th>Date Saved</th>
                              <th>Status</th>
                              <th>Action</th>
                            </tr>
                          </thead>

                          <tbody>
                            {favoriteJobs.map((favoriteJob) => (
                              <tr key={favoriteJob.favoriteJobID}>
                                <td>
                                  {/* Job Block */}
                                  <div className="job-block">
                                    <div className="inner-box">
                                      <div className="content">
                                        <span className="company-logo">
                                          <img
                                            src={
                                              favoriteJob.job?.logo ||
                                              "images/resource/company-logo/1-1.png"
                                            }
                                            alt={
                                              favoriteJob.job?.companyName ||
                                              "Company"
                                            }
                                          />
                                        </span>
                                        <h4>
                                          <a href={`/job/${favoriteJob.jobID}`}>
                                            {favoriteJob.job?.title ||
                                              "Job Title"}
                                          </a>
                                        </h4>
                                        <ul className="job-info">
                                          <li>
                                            <span className="icon flaticon-briefcase"></span>{" "}
                                            {favoriteJob.job?.companyName ||
                                              "Company Name"}
                                          </li>
                                          <li>
                                            <span className="icon flaticon-map-locator"></span>{" "}
                                            {favoriteJob.job?.location ||
                                              "Location"}
                                          </li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td>{formatDate(favoriteJob.createAt)}</td>
                                <td className="status">
                                  {favoriteJob.job?.status || "Active"}
                                </td>
                                <td>
                                  <div className="option-box">
                                    <ul className="option-list">
                                      <li>
                                        <button
                                          data-text="View Job"
                                          onClick={() =>
                                            viewJobDetails(favoriteJob.jobID)
                                          }
                                        >
                                          <span className="la la-eye"></span>
                                        </button>
                                      </li>
                                      <li>
                                        <button
                                          data-text="Remove from Saved"
                                          onClick={() =>
                                            deleteFavoriteJob(
                                              favoriteJob.favoriteJobID
                                            )
                                          }
                                        >
                                          <span className="la la-trash"></span>
                                        </button>
                                      </li>
                                    </ul>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* End Dashboard */}
    </>
  );
};

export default SavedJobsPage;

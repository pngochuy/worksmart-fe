import React, { useState, useEffect } from "react";
import axios from "axios";
import { fetchJobDetails } from "../../../services/jobServices"; // Adjust the import path as necessary

const SavedJobsPage = () => {
  const [favoriteJobs, setFavoriteJobs] = useState([]);
  const [timeFilter, setTimeFilter] = useState("Last 6 Months");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

  // Lấy userId từ localStorage hoặc context/redux state
  const getUserId = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.id;
  };

  const userId = getUserId();

  // Fetch favorite jobs
  const fetchFavoriteJobs = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get(
        `${BACKEND_API_URL}/api/FavoriteJob/user/${userId}`
      );

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
      setError("Failed to load saved jobs. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a favorite job
  const deleteFavoriteJob = async (favoriteJobId) => {
    try {
      await axios.delete(`${BACKEND_API_URL}/api/FavoriteJob/${favoriteJobId}`);
      // After successful deletion, update the local state
      setFavoriteJobs(
        favoriteJobs.filter((job) => job.favoriteJobID !== favoriteJobId)
      );
    } catch (err) {
      console.error("Error deleting favorite job:", err);
      setError("Failed to delete job. Please try again later.");
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

  // Load favorite jobs on component mount
  useEffect(() => {
    fetchFavoriteJobs();
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
                                            (window.location.href = `/job/${favoriteJob.jobID}`)
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

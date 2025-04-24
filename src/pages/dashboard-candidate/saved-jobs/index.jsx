import React, { useEffect, useState } from "react";
import {
  getFavoriteJobsByUserId,
  removeFavoriteJob,
} from "../../../services/favoriteJobService";
import { fetchJobDetails } from "../../../services/jobServices";
import { Link, useNavigate } from "react-router-dom";
import { Search } from "lucide-react"; // Import icon Search

import Pagination from "./Pagination";

// Import UI components for popup confirmation dialog
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

// Job status enum matching the C# definition
const JobStatus = {
  0: "Pending",
  1: "Rejected",
  2: "Hidden",
  3: "Active",
};

const getStatusClass = (status) => {
  switch (status) {
    case "Pending":
      return "pending";
    case "Rejected":
      return "rejected";
    case "Hidden":
      return "hidden";
    case "Active":
      return "active";
    default:
      return "";
  }
};

export const index = () => {
  const [favoriteJobs, setFavoriteJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("Last 6 Months");
  const [searchTerm, setSearchTerm] = useState(""); // Added state for search term
  const navigate = useNavigate();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Popup dialog states
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);

  // Function to get user info from localStorage
  const getUserFromLocalStorage = () => {
    try {
      const keys = ["user", "userData", "currentUser", "userInfo"];

      for (const key of keys) {
        const userStr = localStorage.getItem(key);
        if (userStr) {
          try {
            const userData = JSON.parse(userStr);
            console.log(
              `User data found in localStorage key '${key}':`,
              userData
            );
            return userData;
          } catch (e) {
            console.log(`Error parsing JSON from key '${key}'`, e);
          }
        }
      }

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        try {
          const value = localStorage.getItem(key);
          const parsedValue = JSON.parse(value);

          if (parsedValue && (parsedValue.userID || parsedValue.id)) {
            console.log(
              `Potential user data found in key '${key}':`,
              parsedValue
            );
            return parsedValue;
          }
        } catch (e) {}
      }

      console.warn("No user data found in localStorage");
      return null;
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      return null;
    }
  };

  useEffect(() => {
    const loadFavoriteJobs = async () => {
      try {
        setIsLoading(true);

        const currentUser = getUserFromLocalStorage();
        console.log("Current user:", currentUser);

        const userId = currentUser?.userID || currentUser?.id;

        if (!userId) {
          console.error("No valid user ID found");
          setIsLoading(false);
          setFavoriteJobs([]);
          return;
        }

        console.log(`Fetching favorite jobs for user ID: ${userId}`);

        const favorites = await getFavoriteJobsByUserId(userId);
        console.log("Favorite jobs retrieved:", favorites);

        if (!favorites || favorites.length === 0) {
          console.log("No favorite jobs found for this user");
          setFavoriteJobs([]);
          setIsLoading(false);
          return;
        }

        const jobDetailsPromises = favorites.map(async (favorite) => {
          try {
            console.log("Processing favorite job:", favorite);
            const jobId = favorite.jobID;

            if (!jobId) {
              console.error("No jobID found in favorite:", favorite);
              return favorite;
            }

            console.log(`Fetching details for job ID: ${jobId}`);
            const jobDetails = await fetchJobDetails(jobId);
            console.log(`Job details for job ${jobId}:`, jobDetails);

            return {
              ...favorite,
              job: jobDetails,
            };
          } catch (error) {
            console.error(
              `Error fetching details for job ${favorite.jobID}:`,
              error
            );
            return {
              ...favorite,
              job: {
                title: favorite.title || "Job information not available",
                companyName: favorite.companyName || "Unknown",
              },
            };
          }
        });

        const jobsWithDetails = await Promise.all(jobDetailsPromises);
        console.log("Jobs with details:", jobsWithDetails);
        setFavoriteJobs(jobsWithDetails);
      } catch (error) {
        console.error("Error loading favorite jobs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFavoriteJobs();
  }, []);

  const handleRemoveClick = (favoriteJobId) => {
    setSelectedJobId(favoriteJobId);
    setConfirmDialogOpen(true);
  };

  const handleRemoveFavorite = async () => {
    if (!selectedJobId) return;

    try {
      await removeFavoriteJob(selectedJobId);
      setFavoriteJobs(
        favoriteJobs.filter((job) => job.favoriteJobID !== selectedJobId)
      );
      setConfirmDialogOpen(false);
      setSelectedJobId(null);
    } catch (error) {
      console.error("Error removing favorite job:", error);
    }
  };

  const handleViewJob = (jobId) => {
    navigate(`/job-list/${jobId}`);
  };

  const getJobCreateDate = (favoriteJob) => {
    if (favoriteJob.createAt) {
      return new Date(favoriteJob.createAt);
    }

    return new Date(
      favoriteJob.dateSaved || favoriteJob.createdAt || new Date()
    );
  };

  const filterJobs = () => {
    console.log("Total favorite jobs before filtering:", favoriteJobs.length);

    if (!favoriteJobs.length) return [];

    const now = new Date();
    let monthsAgo;

    switch (timeFilter) {
      case "Last 6 Months":
        monthsAgo = 6;
        break;
      case "Last 12 Months":
        monthsAgo = 12;
        break;
      case "Last 16 Months":
        monthsAgo = 16;
        break;
      case "Last 24 Months":
        monthsAgo = 24;
        break;
      case "Last 5 year":
        monthsAgo = 60;
        break;
      default:
        monthsAgo = 6;
    }

    const cutoffDate = new Date();
    cutoffDate.setMonth(now.getMonth() - monthsAgo);
    console.log("Cutoff date for filtering:", cutoffDate);

    const timeFiltered = favoriteJobs.filter((job) => {
      const savedDate = getJobCreateDate(job);
      return savedDate >= cutoffDate;
    });

    if (!searchTerm.trim()) {
      return timeFiltered;
    }

    const searchLower = searchTerm.toLowerCase().trim();
    const searchFiltered = timeFiltered.filter((job) => {
      const jobTitle = (
        job?.job?.job?.title ||
        job?.job?.title ||
        job?.title ||
        ""
      ).toLowerCase();

      const companyName = (
        job?.job?.job?.companyName ||
        job?.job?.companyName ||
        job?.companyName ||
        ""
      ).toLowerCase();

      return (
        jobTitle.includes(searchLower) || companyName.includes(searchLower)
      );
    });

    return searchFiltered;
  };

  const getJobStatus = (job) => {
    let statusValue = job?.job?.job?.status;

    if (
      typeof statusValue === "number" &&
      statusValue >= 0 &&
      statusValue <= 3
    ) {
      return JobStatus[statusValue];
    }

    if (typeof statusValue === "string") {
      const validStatuses = Object.values(JobStatus);
      if (validStatuses.includes(statusValue)) {
        return statusValue;
      }
    }

    return "Hidden";
  };

  const getPaginatedJobs = () => {
    const filtered = filterJobs();
    setTotalItems(filtered.length);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const handleSearch = (params) => {
    if (params && params.PageIndex !== undefined) {
      console.log("Setting current page to:", params.PageIndex);
      setCurrentPage(params.PageIndex);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  useEffect(() => {
    const paginatedJobs = getPaginatedJobs();
    setFilteredJobs(paginatedJobs);
  }, [favoriteJobs, timeFilter, searchTerm, currentPage, itemsPerPage]);

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your saved jobs...</p>
      </div>
    );
  }

  return (
    <>
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <h3>Saved Jobs</h3>
            <div className="text">Ready to jump back in?</div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4>My Saved Jobs</h4>

                    <div className="chosen-outer">
                      <div
                        className="search-box inline-icon"
                        style={{ marginRight: "5px" }}
                      >
                        <input
                          type="text"
                          placeholder="Search job titles..."
                          value={searchTerm}
                          onChange={handleSearchChange}
                          className="form-control"
                        />
                      </div>

                      <select
                        className="chosen-select mr-3"
                        value={timeFilter}
                        onChange={(e) => {
                          setTimeFilter(e.target.value);
                          setCurrentPage(1);
                        }}
                      >
                        <option>Last 6 Months</option>
                        <option>Last 12 Months</option>
                        <option>Last 16 Months</option>
                        <option>Last 24 Months</option>
                        <option>Last 5 year</option>
                      </select>

                      <select
                        className="chosen-select"
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                      >
                        <option value={5}>Show 5</option>
                        <option value={10}>Show 10</option>
                        <option value={15}>Show 15</option>
                        <option value={20}>Show 20</option>
                      </select>
                    </div>
                  </div>

                  <div className="widget-content">
                    <div className="table-outer">
                      <table className="default-table manage-job-table">
                        <thead>
                          <tr>
                            <th>Job Title</th>
                            <th className="text-center">Date Saved</th>
                            <th className="text-center status-column">
                              Status
                            </th>
                            <th className="text-center">Action</th>
                          </tr>
                        </thead>

                        <tbody>
                          {filteredJobs.length > 0 ? (
                            filteredJobs.map((favoriteJob) => {
                              const jobStatus = getJobStatus(favoriteJob);
                              const statusClass = getStatusClass(jobStatus);
                              const isHidden = jobStatus === "Hidden";
                              const isRejected = jobStatus === "Rejected";
                              const isDisabled = isHidden || isRejected;
                              const savedDate = getJobCreateDate(favoriteJob);

                              return (
                                <tr
                                  key={
                                    favoriteJob.favoriteJobID ||
                                    `fav-${favoriteJob.jobID}`
                                  }
                                >
                                  <td>
                                    <div className="job-block">
                                      <div className="inner-box">
                                        <div className="content">
                                          <span className="company-logo">
                                            <img
                                              src={
                                                favoriteJob.job?.job?.avatar ||
                                                favoriteJob.companyLogo ||
                                                "images/resource/company-logo/default.png"
                                              }
                                              alt="Company Logo"
                                            />
                                          </span>
                                          <h4>
                                            {isDisabled ? (
                                              <span
                                                className="disabled-job-title"
                                                style={{
                                                  color: "red",
                                                  cursor: "not-allowed",
                                                }}
                                              >
                                                {favoriteJob.job?.job?.title ||
                                                  "Job Title Unavailable"}
                                              </span>
                                            ) : (
                                              <Link
                                                to={`/job-details/${favoriteJob.jobID}`}
                                              >
                                                {favoriteJob.job?.job?.title ||
                                                  "Job Title Unavailable"}
                                              </Link>
                                            )}
                                          </h4>
                                          <ul className="job-info">
                                            <li>
                                              <span className="icon flaticon-briefcase"></span>{" "}
                                              {favoriteJob.job?.job
                                                ?.companyName ||
                                                favoriteJob.companyName ||
                                                "Company Name Unavailable"}
                                            </li>
                                            <li>
                                              <span className="icon flaticon-map-locator"></span>{" "}
                                              {favoriteJob.job?.job?.location ||
                                                favoriteJob.location ||
                                                "Location Unavailable"}
                                            </li>
                                          </ul>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="text-center">
                                    {savedDate.toLocaleDateString()}
                                  </td>
                                  <td className="text-center status-column">
                                    {!isHidden && (
                                      <span className={`status ${statusClass}`}>
                                        {jobStatus}
                                      </span>
                                    )}
                                    {isHidden && (
                                      <span className="status-placeholder"></span>
                                    )}
                                  </td>
                                  <td className="text-center">
                                    <div className="option-box">
                                      <ul className="option-list">
                                        {!isDisabled && (
                                          <li>
                                            <button
                                              data-text="View Job"
                                              onClick={() =>
                                                handleViewJob(favoriteJob.jobID)
                                              }
                                            >
                                              <span className="la la-eye"></span>
                                            </button>
                                          </li>
                                        )}
                                        <li>
                                          <button
                                            data-text="Remove from Favorites"
                                            onClick={() =>
                                              handleRemoveClick(
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
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan="4" className="text-center">
                                <div className="no-data-message">
                                  <i className="la la-heart-o"></i>
                                  <p>
                                    No saved jobs found. Jobs you save will
                                    appear here.
                                  </p>
                                  <Link
                                    to="/job-list"
                                    className="theme-btn btn-style-one"
                                    style={{ color: "#fff" }}
                                  >
                                    Browse Jobs
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {totalItems > 0 && (
                      <div className="pagination-box">
                        <Pagination
                          currentPage={currentPage}
                          totalPage={totalPages}
                          setSearchParams={handleSearch}
                        />

                        <div className="pagination-summary">
                          Showing{" "}
                          {Math.min(
                            (currentPage - 1) * itemsPerPage + 1,
                            totalItems
                          )}{" "}
                          to {Math.min(currentPage * itemsPerPage, totalItems)}{" "}
                          of {totalItems} entries
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove Job</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this job from your favorites?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setConfirmDialogOpen(false);
                setSelectedJobId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleRemoveFavorite}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default index;

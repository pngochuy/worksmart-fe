import React, { useEffect, useState } from 'react';
import { 
  getFavoriteJobsByUserId, 
  removeFavoriteJob 
} from "../../../services/favoriteJobService";
import { fetchJobDetails } from "../../../services/jobServices";
import { Link, useNavigate } from 'react-router-dom';

// Import Pagination component
import Pagination from './Pagination';

// Import UI components for popup confirmation dialog
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; // Điều chỉnh đường dẫn nếu cần

import { Button } from "@/components/ui/button"; // Điều chỉnh đường dẫn nếu cần

// Job status enum matching the C# definition
const JobStatus = {
  0: "Pending",
  1: "Rejected",
  2: "Hidden",
  3: "Active"
};

// Function to get status class based on job status
const getStatusClass = (status) => {
  switch (status) {
    case "Pending": return "pending";
    case "Rejected": return "rejected";
    case "Hidden": return "hidden";
    case "Active": return "active";
    default: return "";
  }
};

export const index = () => {
  const [favoriteJobs, setFavoriteJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('Last 6 Months');
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
      // Try common keys that localStorage might use to store user info
      const keys = ['user', 'userData', 'currentUser', 'userInfo'];
      
      for (const key of keys) {
        const userStr = localStorage.getItem(key);
        if (userStr) {
          try {
            const userData = JSON.parse(userStr);
            console.log(`User data found in localStorage key '${key}':`, userData);
            return userData;
          } catch (e) {
            console.log(`Error parsing JSON from key '${key}'`, e);
          }
        }
      }
      
      // If user not found in common keys, search all localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        try {
          const value = localStorage.getItem(key);
          const parsedValue = JSON.parse(value);
          
          // Check if object has userID or id
          if (parsedValue && (parsedValue.userID || parsedValue.id)) {
            console.log(`Potential user data found in key '${key}':`, parsedValue);
            return parsedValue;
          }
        } catch (e) {
          // Ignore errors if not JSON
        }
      }
      
      console.warn('No user data found in localStorage');
      return null;
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return null;
    }
  };

  useEffect(() => {
    // Fetch favorite jobs when component mounts
    const loadFavoriteJobs = async () => {
      try {
        setIsLoading(true);
        
        // Get user info from localStorage
        const currentUser = getUserFromLocalStorage();
        console.log('Current user:', currentUser);
        
        // Check if userID exists (or id if different data structure)
        const userId = currentUser?.userID || currentUser?.id;
        
        if (!userId) {
          console.error('No valid user ID found');
          setIsLoading(false);
          setFavoriteJobs([]);
          return;
        }
        
        console.log(`Fetching favorite jobs for user ID: ${userId}`);
        
        // Get basic favorite job data
        const favorites = await getFavoriteJobsByUserId(userId);
        console.log('Favorite jobs retrieved:', favorites);
        
        if (!favorites || favorites.length === 0) {
          console.log('No favorite jobs found for this user');
          setFavoriteJobs([]);
          setIsLoading(false);
          return;
        }
        
        // Fetch detailed information for each job
        const jobDetailsPromises = favorites.map(async (favorite) => {
          try {
            console.log('Processing favorite job:', favorite);
            const jobId = favorite.jobID;
            
            if (!jobId) {
              console.error('No jobID found in favorite:', favorite);
              return favorite; // Return as is if no jobID
            }
            
            console.log(`Fetching details for job ID: ${jobId}`);
            const jobDetails = await fetchJobDetails(jobId);
            console.log(`Job details for job ${jobId}:`, jobDetails);
            
            // Combine the data
            return {
              ...favorite,
              job: jobDetails
            };
          } catch (error) {
            console.error(`Error fetching details for job ${favorite.jobID}:`, error);
            // Return original favorite with placeholder job data
            return {
              ...favorite,
              job: { 
                title: favorite.title || 'Job information not available', 
                companyName: favorite.companyName || 'Unknown'
              }
            };
          }
        });

        const jobsWithDetails = await Promise.all(jobDetailsPromises);
        console.log('Jobs with details:', jobsWithDetails);
        setFavoriteJobs(jobsWithDetails);
      } catch (error) {
        console.error('Error loading favorite jobs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFavoriteJobs();
  }, []);

  // Hiển thị dialog xác nhận khi người dùng muốn xóa công việc đã lưu
  const handleRemoveClick = (favoriteJobId) => {
    setSelectedJobId(favoriteJobId);
    setConfirmDialogOpen(true);
  };

  // Xóa công việc đã lưu sau khi xác nhận
  const handleRemoveFavorite = async () => {
    if (!selectedJobId) return;
    
    try {
      await removeFavoriteJob(selectedJobId);
      setFavoriteJobs(favoriteJobs.filter(job => job.favoriteJobID !== selectedJobId));
      setConfirmDialogOpen(false);
      setSelectedJobId(null);
      
      // Nếu muốn hiển thị thông báo "success" sau khi xóa, bạn có thể sử dụng toast hoặc alert
      // toast({ title: "Success", description: "Job removed from favorites" });
    } catch (error) {
      console.error('Error removing favorite job:', error);
      // toast({ title: "Error", description: "Failed to remove job from favorites" });
    }
  };

  const handleViewJob = (jobId) => {
    navigate(`/job-details/${jobId}`);
  };

  // Function to get the createAt date from the job details
  const getJobCreateDate = (favoriteJob) => {
    // First try to get createAt from the job details structure seen in the console
    if (favoriteJob.createAt) {
      return new Date(favoriteJob.createAt);
    }
    
    // Otherwise check for dateSaved or createdAt as fallbacks
    return new Date(favoriteJob.dateSaved || favoriteJob.createdAt || new Date());
  };

  // Filter jobs based on selected time period
  const filterJobs = () => {
    console.log('Total favorite jobs before filtering:', favoriteJobs.length);
    
    if (!favoriteJobs.length) return [];
    
    const now = new Date();
    let monthsAgo;
    
    switch (timeFilter) {
      case 'Last 6 Months':
        monthsAgo = 6;
        break;
      case 'Last 12 Months':
        monthsAgo = 12;
        break;
      case 'Last 16 Months':
        monthsAgo = 16;
        break;
      case 'Last 24 Months':
        monthsAgo = 24;
        break;
      case 'Last 5 year':
        monthsAgo = 60;
        break;
      default:
        monthsAgo = 6;
    }
    
    const cutoffDate = new Date();
    cutoffDate.setMonth(now.getMonth() - monthsAgo);
    console.log('Cutoff date for filtering:', cutoffDate);
    
    const filtered = favoriteJobs.filter(job => {
      // Use the function to get the createAt date
      const savedDate = getJobCreateDate(job);
      console.log('Job ID:', job.favoriteJobID, 'Save date:', savedDate, 'Include?', savedDate >= cutoffDate);
      return savedDate >= cutoffDate;
    });
    
    console.log('Jobs after date filtering:', filtered.length);
    return filtered;
  };

  // Helper function to get job status as string
  const getJobStatus = (job) => {
    // Get status numeric value or string value
    let statusValue = job?.job?.job?.status;
    
    // If status is a number, map it to enum value
    if (typeof statusValue === 'number' && statusValue >= 0 && statusValue <= 3) {
      return JobStatus[statusValue];
    }
    
    // If status is already a string, check if it's a valid enum value
    if (typeof statusValue === 'string') {
      const validStatuses = Object.values(JobStatus);
      if (validStatuses.includes(statusValue)) {
        return statusValue;
      }
    }
    
    // Default to "Hidden" if status is invalid or not provided
    return "Hidden";
  };

  // Apply pagination to filtered jobs
  const getPaginatedJobs = () => {
    const filtered = filterJobs();
    setTotalItems(filtered.length);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    
    // Get current page items
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  // Update pagination when page changes
  const updatePage = (params) => {
    if (params.PageIndex) {
      setCurrentPage(params.PageIndex);
    }
  };

  // Update filtered and paginated jobs whenever dependencies change
  useEffect(() => {
    const paginatedJobs = getPaginatedJobs();
    setFilteredJobs(paginatedJobs);
  }, [favoriteJobs, timeFilter, currentPage, itemsPerPage]);

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to page 1 when changing items per page
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
                      {/* Time filter */}
                      <select 
                        className="chosen-select mr-3"
                        value={timeFilter}
                        onChange={(e) => {
                          setTimeFilter(e.target.value);
                          setCurrentPage(1); // Reset to page 1 when filter changes
                        }}
                      >
                        <option>Last 6 Months</option>
                        <option>Last 12 Months</option>
                        <option>Last 16 Months</option>
                        <option>Last 24 Months</option>
                        <option>Last 5 year</option>
                      </select>
                      
                      {/* Items per page */}
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
                            <th className="text-center status-column">Status</th>
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
                              // Use the new function to get the correct date
                              const savedDate = getJobCreateDate(favoriteJob);
                              
                              return (
                                <tr key={favoriteJob.favoriteJobID || `fav-${favoriteJob.jobID}`}>
                                  <td>
                                    {/* Job Block */}
                                    <div className="job-block">
                                      <div className="inner-box">
                                        <div className="content">
                                          <span className="company-logo">
                                            <img
                                              src={favoriteJob.job?.job?.avatar || favoriteJob.companyLogo || "images/resource/company-logo/default.png"}
                                              alt="Company Logo"
                                            />
                                          </span>
                                          <h4>
                                            {isDisabled ? (
                                              <span className="disabled-job-title" style={{ color: 'red', cursor: 'not-allowed' }}>
                                                {favoriteJob.job?.job?.title || "Job Title Unavailable"}
                                              </span>
                                            ) : (
                                              <Link to={`/job-details/${favoriteJob.jobID}`}>
                                                {favoriteJob.job?.job?.title || "Job Title Unavailable"}
                                              </Link>
                                            )}
                                          </h4>
                                          <ul className="job-info">
                                            <li>
                                              <span className="icon flaticon-briefcase"></span>{" "}
                                              {favoriteJob.job?.job?.companyName || favoriteJob.companyName || "Company Name Unavailable"}
                                            </li>
                                            <li>
                                              <span className="icon flaticon-map-locator"></span>{" "}
                                              {favoriteJob.job?.job?.location || favoriteJob.location || "Location Unavailable"}
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
                                              onClick={() => handleViewJob(favoriteJob.jobID)}
                                            >
                                              <span className="la la-eye"></span>
                                            </button>
                                          </li>
                                        )}
                                        <li>
                                          <button 
                                            data-text="Remove from Favorites"
                                            onClick={() => handleRemoveClick(favoriteJob.favoriteJobID)}
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
                                  <p>No saved jobs found. Jobs you save will appear here.</p>
                                  <Link to="/jobs" className="theme-btn btn-style-one">
                                    Browse Jobs
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>  
                    
                    {/* Pagination */}
                    {totalItems > 0 && (
                      <div className="pagination-box">
                        <Pagination 
                          currentPage={currentPage} 
                          totalPage={totalPages} 
                          setSearchParams={updatePage} 
                        />
                        
                        <div className="pagination-summary">
                          Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
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
      {/* End Dashboard */}

      {/* Confirmation Dialog */}
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
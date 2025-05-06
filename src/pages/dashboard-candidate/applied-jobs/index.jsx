import { getUserLoginData } from "@/helpers/decodeJwt";
import { useEffect, useState } from "react";
import { useNotifications } from "@/layouts/NotificationProvider";
import { fetchUserNotifications } from "@/services/notificationServices";
import { fetchAppliedJobs } from "@/services/jobServices";
import {
  Clock,
  FileEdit,
  Heart,
  MoveUpRight,
  Search,
  RefreshCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateTimeNotIncludeTime } from "@/helpers/formatDateTime";
import { toast } from "react-toastify";
import LoadingButton from "@/components/LoadingButton";
import {
  toggleFavoriteJob,
  isJobFavorited,
  deleteFavoriteJob,
} from "@/services/favoriteJobService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const index = () => {
  const [userDataLogin, setUserDataLogin] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [jobError, setJobError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Thêm state cho chức năng save/unsave
  const [favoriteStatus, setFavoriteStatus] = useState({});
  const [savingFavorite, setSavingFavorite] = useState(null);
  const [showSaveConfirmDialog, setShowSaveConfirmDialog] = useState(false);
  const [showUnsaveConfirmDialog, setShowUnsaveConfirmDialog] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const userID = userDataLogin?.userID || null;

  useEffect(() => {
    const user = getUserLoginData();
    setUserDataLogin(user);
  }, []);

  useEffect(() => {
    if (userDataLogin) {
      loadAppliedJobs();
    }
  }, [userDataLogin]);

  const handleRefresh = () => {
    loadAppliedJobs();
  };

  // Filter jobs whenever search term or applied jobs change
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredJobs(appliedJobs);
    } else {
      const filtered = appliedJobs.filter((job) =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredJobs(filtered);
    }
    // Reset về trang 1 khi thay đổi kết quả tìm kiếm
    setCurrentPage(1);
  }, [searchTerm, appliedJobs]);

  // Thêm hàm kiểm tra trạng thái favorite
  const checkFavoriteStatuses = async (jobs) => {
    if (!userID || !jobs.length) return;

    try {
      const statusPromises = jobs.map((job) =>
        isJobFavorited(userID, job.jobID).then((isFavorite) => ({
          jobId: job.jobID,
          isFavorite,
        }))
      );

      const statuses = await Promise.all(statusPromises);
      const statusMap = {};

      statuses.forEach(({ jobId, isFavorite }) => {
        statusMap[jobId] = isFavorite;
      });

      setFavoriteStatus(statusMap);
    } catch (error) {
      console.error("Error checking favorite statuses:", error);
    }
  };

  const loadAppliedJobs = async () => {
    try {
      setLoadingJobs(true);
      const userId = userDataLogin.userID;
      const data = await fetchAppliedJobs(userId);
      setAppliedJobs(data);
      setFilteredJobs(data); // Initialize filtered jobs with all jobs

      // Kiểm tra trạng thái yêu thích cho mỗi job
      if (data && data.length > 0) {
        await checkFavoriteStatuses(data);
      }
    } catch (err) {
      setJobError("Failed to load applied jobs");
      console.error(err);
    } finally {
      setLoadingJobs(false);
    }
  };

  // Thêm hàm xử lý khi click vào nút Save
  const handleSaveJobClick = (job) => {
    setSelectedJob(job);
    setSelectedJobId(job.jobID);

    // Nếu job đã được lưu, hiện dialog xác nhận bỏ lưu
    if (favoriteStatus[job.jobID]) {
      setShowUnsaveConfirmDialog(true);
    } else {
      // Nếu chưa lưu, hiện dialog xác nhận lưu
      setShowSaveConfirmDialog(true);
    }
  };

  // Thêm hàm xử lý khi xác nhận lưu job
  const handleToggleFavorite = async () => {
    if (!userID || !selectedJobId) return;

    setSavingFavorite(selectedJobId);
    try {
      const result = await toggleFavoriteJob(userID, selectedJobId);

      setFavoriteStatus((prev) => ({
        ...prev,
        [selectedJobId]: result.isFavorite,
      }));

      toast.success(
        result.isFavorite
          ? "Job saved to favorites successfully!"
          : "Job removed from favorites."
      );
    } catch (error) {
      console.error("Error toggling favorite status:", error);
      toast.error("Failed to update favorites. Please try again.");
    } finally {
      setSavingFavorite(null);
      setShowSaveConfirmDialog(false);
    }
  };

  // Thêm hàm xử lý khi xác nhận bỏ lưu job
  const handleUnsaveJob = async () => {
    if (!userID || !selectedJobId) return;

    setSavingFavorite(selectedJobId);
    try {
      await deleteFavoriteJob(userID, selectedJobId);

      setFavoriteStatus((prev) => ({
        ...prev,
        [selectedJobId]: false,
      }));

      toast.success("Job removed from favorites.");
    } catch (error) {
      console.error("Error removing job from favorites:", error);
      toast.error("Failed to remove job from favorites. Please try again.");
    } finally {
      setSavingFavorite(null);
      setShowUnsaveConfirmDialog(false);
    }
  };

  const formatSalary = (salary) => {
    if (!salary) return "Negotiable";
    return salary;
  };

  const getTimeAgo = (dateString) => {
    const postDate = new Date(dateString);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - postDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Tính toán phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);

  // Các hàm điều hướng
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
      {/* Save Job Confirm Dialog */}
      <Dialog
        open={showSaveConfirmDialog}
        onOpenChange={setShowSaveConfirmDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Job</DialogTitle>
            <DialogDescription>
              Do you want to save <b>{selectedJob?.title}</b> at{" "}
              <b>{selectedJob?.companyName}</b> to your favorites? You can view
              all saved jobs in your profile.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setShowSaveConfirmDialog(false)}
              disabled={savingFavorite === selectedJobId}
            >
              Cancel
            </Button>
            <LoadingButton
              variant="default"
              onClick={handleToggleFavorite}
              loading={savingFavorite === selectedJobId}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save Job
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unsave Job Confirm Dialog */}
      <Dialog
        open={showUnsaveConfirmDialog}
        onOpenChange={setShowUnsaveConfirmDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove from Saved Jobs</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <b>{selectedJob?.title}</b> at{" "}
              <b>{selectedJob?.companyName}</b> from your saved jobs?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setShowUnsaveConfirmDialog(false)}
              disabled={savingFavorite === selectedJobId}
            >
              Cancel
            </Button>
            <LoadingButton
              variant="destructive"
              onClick={handleUnsaveJob}
              loading={savingFavorite === selectedJobId}
            >
              Remove
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dashboard */}
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <h3>Applied Jobs</h3>
            <div className="text">Ready to jump back in?</div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              {/* Ls widget */}
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4>My Applied Jobs</h4>
                    {!loadingJobs && filteredJobs.length > 0 && (
                      <Button
                        className="h-8 px-2 lg:px-3"
                        variant="outline"
                        disabled={loadingJobs}
                        onClick={handleRefresh}
                      >
                        <RefreshCcw
                          className={`h-4 w-4 ${loadingJobs ? "animate-spin" : ""
                            }`}
                        />
                        <span className="ml-1 hidden sm:inline"></span>
                      </Button>
                    )}
                  </div>

                  {/* Search box */}
                  <div className="search-box-outer w-full border border-gray-300 rounded-md p-3 mb-4 bg-white shadow-sm">
                    <div className="relative w-full">
                      <input
                        type="text"
                        placeholder="Search by title..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="form-control w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="widget-content">
                    <div className="table-outer">
                      <table className="row">
                        {loadingJobs ? (
                          <div className="col-12 text-center py-4">
                            <p>Loading applied jobs...</p>
                          </div>
                        ) : jobError ? (
                          <div className="col-12 text-center py-4">
                            <p>{jobError}</p>
                          </div>
                        ) : filteredJobs.length > 0 ? (
                          currentJobs.map((job) => (
                            <div
                              key={job.jobID}
                              className="job-block col-lg-12 col-md-12 col-sm-12"
                            >
                              <div className="inner-box">
                                <div className="content">
                                  <span className="company-logo">
                                    <img
                                      src={
                                        job.companyAvatar ||
                                        "https://via.placeholder.com/80"
                                      }
                                      alt={job.companyName}
                                    />
                                  </span>
                                  <h4>
                                    <a href={`/job-list/${job.jobID}`}>
                                      {job.title}
                                    </a>
                                  </h4>
                                  <ul className="job-info">
                                    <li>
                                      <span className="icon flaticon-briefcase"></span>{" "}
                                      {job.companyName}
                                    </li>
                                    <li>
                                      <span className="icon flaticon-map-locator"></span>{" "}
                                      {job.location}
                                    </li>
                                    <li>
                                      <span className="icon flaticon-clock-3"></span>{" "}
                                      {formatDateTimeNotIncludeTime(
                                        job.deadline
                                      )}
                                    </li>
                                    <li>
                                      <span className="icon flaticon-money"></span>{" "}
                                      {formatSalary(job.salary)}
                                    </li>
                                  </ul>
                                  <ul className="job-other-info">
                                    <li className="time">{job.workType}</li>
                                    {job.level && (
                                      <li className="privacy">{job.level}</li>
                                    )}
                                    {job.priority && (
                                      <li className="required">Urgent</li>
                                    )}
                                    <li
                                      className={`status ${job.applicationStatus === "Approved"
                                        ? "bg-green-500"
                                        : job.applicationStatus === "Rejected"
                                          ? "bg-red-500"
                                          : "bg-amber-500"
                                        }`}
                                    >
                                      {job.applicationStatus}
                                    </li>
                                  </ul>
                                  {/* <button
                                    className="bookmark-btn"
                                    style={{ right: 70 }}
                                  >
                                    <Button
                                      variant="outline"
                                      className={`border hover:bg-blue-100 hover:text-blue-700 flex items-center gap-2 ${
                                        favoriteStatus[job.jobID]
                                          ? "text-blue-600 border-blue-200 bg-blue-50"
                                          : "text-gray-500 border-gray-200"
                                      }`}
                                      onClick={() => handleSaveJobClick(job)}
                                      disabled={savingFavorite === job.jobID}
                                    >
                                      <Heart
                                        className={`h-4 w-4 ${
                                          favoriteStatus[job.jobID]
                                            ? "text-blue-500 fill-blue-500"
                                            : "text-gray-500"
                                        }`}
                                      />
                                      <span className="hidden sm:inline">
                                        {favoriteStatus[job.jobID]
                                          ? "Saved"
                                          : "Save"}
                                      </span>
                                    </Button>
                                  </button> */}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="col-12 text-center py-4">
                            {searchTerm ? (
                              <p>No jobs found matching "{searchTerm}".</p>
                            ) : (
                              <p>You haven't applied to any jobs yet.</p>
                            )}
                            {!searchTerm && (
                              <a
                                href="/job-list"
                                className="btn btn-primary mt-3"
                              >
                                Browse Jobs
                              </a>
                            )}
                          </div>
                        )}
                      </table>

                      {/* Phân trang */}
                      {filteredJobs.length > 0 && (
                        <div className="pagination-container mt-4 d-flex justify-content-center">
                          <nav aria-label="Job applications pagination">
                            <ul className="pagination">
                              <li
                                className={`page-item ${currentPage === 1 ? "disabled" : ""
                                  }`}
                              >
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
                                  className={`page-item ${currentPage === number + 1 ? "active" : ""
                                    }`}
                                >
                                  <button
                                    className="page-link"
                                    onClick={() => paginate(number + 1)}
                                  >
                                    {number + 1}
                                  </button>
                                </li>
                              ))}

                              <li
                                className={`page-item ${currentPage === totalPages ? "disabled" : ""
                                  }`}
                              >
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>
        {`
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
          
          /* Status badge styling */
          .job-other-info .status {
            color: white;
            padding: 5px 15px;
            border-radius: 30px;
            display: inline-block;
            margin-right: 8px;
          }
        `}
      </style>
    </>
  );
};

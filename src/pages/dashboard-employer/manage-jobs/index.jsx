import { useEffect, useState } from "react";
import {
  fetchCandidatesForJob,
  hideJob,
  unhideJob,
  toggleJobPriority
} from "../../../services/jobServices";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Pagination from "./Pagination";
import ConfirmDialog from "./ConfirmDialog";
import { fetchCompanyProfile } from "@/services/employerServices";
import { fetchJobsForManagement } from "../../../services/jobServices";
import { formatDateTimeNotIncludeTime } from "@/helpers/formatDateTime";
import { getUserLoginData } from "@/helpers/decodeJwt";
import "../manage-jobs/styleManageJob.css";
export default function ManageJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [totalPage, setTotalPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [candidateCounts, setCandidateCounts] = useState({});
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedJob, setSelectedJob] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    PageIndex: 1,
    PageSize: 5,
    title: "",
    IncludeHidden: true,
    MostRecent: false, 
  });
  const [verificationLevel, setVerificationLevel] = useState(null);
  
  const currentUser = getUserLoginData();

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = getUserLoginData();

        if (user.role === "Employer") {
          const companyData = await fetchCompanyProfile();

          setVerificationLevel(companyData.verificationLevel);
          console.log("Verification Level:", companyData.verificationLevel);
        }
      } catch (error) {
        console.error("Error loading verification data:", error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (verificationLevel !== null && verificationLevel < 3) {
      navigate("/employer/verification");
    }
  }, [verificationLevel, navigate]);

  useEffect(() => {
    getJobs();
  }, [
    searchParams.PageSize,
    searchParams.PageIndex,
    searchParams.title,
    searchParams.MostRecent,
  ]);

  const isJobExpired = (deadline) => {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    const today = new Date();
    return deadlineDate < today;
  };

  const getJobs = async () => {
    try {
      setLoading(true);
      
      const userInfo = getUserLoginData();
      
      if (!userInfo || !userInfo.userID) {
        console.log("Thông tin người dùng chưa có sẵn, bỏ qua việc tải job");
        setLoading(false);
        return;
      }
      
      // Nếu backend không hỗ trợ lọc theo userID, chúng ta cần lấy tất cả và lọc ở frontend
      const paramsToSend = {
        ...searchParams,
        IncludeHidden: true,
        MostRecent: searchParams.MostRecent,
        // Tạm thời không truyền PageIndex và PageSize để lấy tất cả dữ liệu
        PageIndex: 1,
        PageSize: 1000 // Số lớn để lấy tất cả dữ liệu
      };
      
      const data = await fetchJobsForManagement(paramsToSend);
      console.log("Jobs từ API:", data.jobs.length);
      
      // Lọc ở phía client
      const filteredJobs = data.jobs.filter(job => job.userID == userInfo.userID);
      const totalItems = filteredJobs.length;
      const calculatedTotalPages = Math.max(1, Math.ceil(totalItems / searchParams.PageSize));
      const startIndex = (searchParams.PageIndex - 1) * searchParams.PageSize;
      
      if (startIndex >= totalItems && totalItems > 0) {
        setSearchParams(prev => ({
          ...prev,
          PageIndex: 1
        }));  
        return;
      }
      
      const endIndex = Math.min(startIndex + searchParams.PageSize, totalItems);
      const paginatedJobs = filteredJobs.slice(startIndex, endIndex);
      
      setJobs(paginatedJobs);
      setTotalPage(calculatedTotalPages);
      
      // Lấy số lượng ứng viên cho các job đã phân trang
      const counts = {};
      for (const job of paginatedJobs) {
        try {
          const candidates = await fetchCandidatesForJob(job.jobID);
          counts[job.jobID] = candidates.length;
        } catch (error) {
          console.error(`Không thể lấy ứng viên cho job ${job.jobID}:`, error);
          counts[job.jobID] = 0;
        }
      }
      setCandidateCounts(counts);
    } catch (error) {
      console.error("Không thể tải danh sách job:", error);
      toast.error("Không thể tải danh sách job. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };
  
  // Handle sort order change
  const handleSortOrderChange = (e) => {
    const newSortOrder = e.target.value;
    setSortOrder(newSortOrder);

    // Update MostRecent parameter based on sort type
    setSearchParams((prevParams) => ({
      ...prevParams,
      MostRecent: newSortOrder === "createdAt", // true if sorting by creation date, false if by update date
    }));
  };

  // Toggle job priority with duration check
  const handleTogglePriority = async (jobId) => {
    try {
      const job = jobs.find(j => j.jobID === jobId);
      
      // Do not allow toggling priority for expired or pending/rejected jobs
      if (job && (isJobExpired(job.deadline) || job.status === 0 || job.status === 1)) {
        let reason = isJobExpired(job.deadline) 
          ? "expired jobs" 
          : job.status === 0 
            ? "pending jobs" 
            : "rejected jobs";
        toast.error(`Cannot change priority for ${reason}.`);
        return;
      }
      
      // Call the backend to toggle priority
      const response = await toggleJobPriority(jobId);
      
      // If the backend returns false, it means either:
      // 1. The job's high priority duration hasn't expired yet, or
      // 2. The user has reached their featured job limit
      if (response === false) {
        if (job.priority) {
          // If trying to change from high to low priority
          toast.error("High priority status cannot be changed until your subscription duration expires.");
        } else {
          // If trying to change from low to high priority
          toast.error("You have reached the maximum number of featured jobs allowed by your subscription.");
        }
        return;
      }
      
      // If successful, update local state to reflect the new priority status
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.jobID === jobId ? { ...job, priority: !job.priority } : job
        )
      );
      
      const priorityStatus = jobs.find(job => job.jobID === jobId)?.priority ? 'Low' : 'High';
      toast.success(`Job priority has been set to ${priorityStatus}!`);
    } catch (error) {
      console.error("Failed to update job priority:", error);
      if (error.response && error.response.status === 400) {
        toast.error(error.response.data.message || "Unable to update priority. You might have reached your limit.");
      } else {
        toast.error("Unable to update job priority.");
      }
    }
  };

  // Hide job - Updated to use status instead of isHidden
  const handleHideJob = async (jobId) => {
    try {
      await hideJob(jobId);

      // Update local state to reflect the new status (2 = Hidden)
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.jobID === jobId ? { ...job, status: 2 } : job
        )
      );

      toast.success("Job has been hidden successfully!");
    } catch (error) {
      console.error("Failed to hide job:", error);
      toast.error("Unable to hide job.");
    }
  };

  // Unhide job - Updated to use status instead of isHidden
  const handleUnhideJob = async (jobId) => {
    try {
      await unhideJob(jobId);

      // Update local state to set status to Active (3)
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.jobID === jobId ? { ...job, status: 3 } : job
        )
      );

      toast.success("Job has been unhidden successfully!");
    } catch (error) {
      console.error("Failed to unhide job:", error);
      toast.error("Unable to unhide job.");
    }
  };

  const handleEdit = (jobId) => {
    navigate(`/employer/manage-jobs/edit/${jobId}`);
  };

  const handleViewCandidates = (jobId) => {
    navigate(`/employer/manage-jobs/applied-candidates/${jobId}`);
  };

  const handleViewDetail = (job) => {
    setSelectedJob(job);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedJob(null);
  };

  // Function to get the appropriate button text based on candidate count
  const getCandidateButtonText = (jobId) => {
    const count = candidateCounts[jobId] || 0;
    return count === 0
      ? "No Candidates"
      : count === 1
      ? "View 1 Candidate"
      : `View ${count} Candidates`;
  };

  // Updated to use status values instead of isHidden
  const getStatusBadge = (status, deadline) => {
    // Check if job is expired first
    if (isJobExpired(deadline)) {
      return <span className="status-badge expired">Expired</span>;
    }

    // Handle status based on JobStatus enum values
    let badgeClass = "status-badge";
    console.log("Job status: ", status);
    switch (status) {
      case 0: // Pending
        badgeClass += " pending";
        return <span className={badgeClass}>Pending</span>;
      // case 1: // Approved
      //   badgeClass += " accepted";
      //   return <span className={badgeClass}>Active</span>;
      case 1: // Rejected
        badgeClass += " rejected";
        return <span className={badgeClass}>Rejected</span>;
      case 2: // Hidden
        badgeClass += " hidden";
        return <span className={badgeClass}>Hidden</span>;
      case 3: // Active
        badgeClass += " accepted";
        return <span className={badgeClass}>Active</span>;
      default:
        badgeClass += " pending";
        return <span className={badgeClass}>Pending</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    let badgeClass = "priority-badge";

    if (priority) {
      badgeClass += " high";
      return <span className={badgeClass}><i className="fas fa-star"></i> High Priority</span>;
    } else {
      badgeClass += " low";
      return <span className={badgeClass}><i className="fas fa-star-half-alt"></i> Low Priority</span>;
    }
  };

  // Render the job detail modal
  const renderJobDetailModal = () => {
    if (!selectedJob || !showDetailModal) return null;

    return (
      <div className="job-detail-modal">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Job Details</h3>
            <button className="close-btn" onClick={closeDetailModal}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="modal-body">
            {isJobExpired(selectedJob.deadline) && (
              <div className="expired-job-notice">
                <i className="fas fa-exclamation-circle"></i>
                <span>
                  This job has expired. It&apos;s no longer accepting
                  applications.
                </span>
              </div>
            )}

            <div className="job-detail-header">
              <div className="job-title-section">
                <h2>
                  {selectedJob.priority === true && <i className="fas fa-star text-warning mr-2"></i>}
                  {selectedJob.title}
                </h2>
                <div className="job-meta">
                  {getStatusBadge(selectedJob.status, selectedJob.deadline)}
                  {getPriorityBadge(selectedJob.priority)}
                </div>
              </div>
              <div className="job-actions">
                <button
                  className="edit-btn"
                  onClick={() => {
                    closeDetailModal();
                    handleEdit(selectedJob.jobID);
                  }}
                >
                  <i className="fas fa-edit"></i> Edit
                </button>
                {isJobExpired(selectedJob.deadline) || selectedJob.status === 0 || selectedJob.status === 1 ? (
                  <button 
                    className="priority-btn disabled" 
                    disabled
                    title={
                      isJobExpired(selectedJob.deadline) 
                        ? "Cannot change priority for expired jobs" 
                        : selectedJob.status === 0 
                          ? "Cannot change priority for pending jobs" 
                          : "Cannot change priority for rejected jobs"
                    }
                  >
                    <i className="fas fa-star-half-alt"></i> 
                    Priority Change Disabled
                  </button>
                ) : (
                  <button
                    className={`priority-btn ${selectedJob.priority ? 'high-priority' : 'low-priority'}`}
                    onClick={() => {
                      closeDetailModal();
                      handleTogglePriority(selectedJob.jobID);
                    }}
                  >
                    <i className={`fas ${selectedJob.priority ? 'fa-star' : 'fa-star-half-alt'}`}></i> 
                    {selectedJob.priority ? 'Set Low Priority' : 'Set High Priority'}
                  </button>
                )}
                <button
                  className={`view-candidates-btn ${
                    candidateCounts[selectedJob.jobID]
                      ? "has-candidates"
                      : "no-candidates"
                  }`}
                  onClick={() => {
                    closeDetailModal();
                    handleViewCandidates(selectedJob.jobID);
                  }}
                  disabled={candidateCounts[selectedJob.jobID] === 0}
                >
                  <i className="fas fa-user-check"></i>{" "}
                  {getCandidateButtonText(selectedJob.jobID)}
                </button>
              </div>
            </div>

            <div className="job-details-grid">
              <div className="detail-item">
                <div className="detail-label">
                  <i className="fas fa-map-marker-alt"></i> Location
                </div>
                <div className="detail-value">
                  {selectedJob.location || "Remote"}
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-label">
                  <i className="fas fa-solid fa-money-bill"></i> Salary (VND)
                  
                </div>
                <div className="detail-value">
                  {selectedJob.minSalary && selectedJob.salary
                    ? `${selectedJob.minSalary.toLocaleString()} - ${selectedJob.salary.toLocaleString()}`
                    : selectedJob.salary
                      ? `${selectedJob.salary.toLocaleString()}`
                      : selectedJob.minSalary
                        ? `From ${selectedJob.minSalary.toLocaleString()}`
                        : "Negotiable"}
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-label">
                  <i className="fas fa-briefcase"></i> Work Type
                </div>
                <div className="detail-value">
                  {selectedJob.workType || "Full Time"}
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-label">
                  <i className="fas fa-user-plus"></i> Openings
                </div>
                <div className="detail-value">
                  {selectedJob.numberOfRecruitment || 1}
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-label">
                  <i className="fas fa-user-graduate"></i> Education
                </div>
                <div className="detail-value">
                  {selectedJob.education || "No Requirements"}
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-label">
                  <i className="fas fa-layer-group"></i> Level
                </div>
                <div className="detail-value">
                  {selectedJob.level || "Not Specified"}
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-label">
                  <i className="fas fa-star"></i> Experience
                </div>
                <div className="detail-value">
                  {selectedJob.exp
                    ? `${selectedJob.exp} years`
                    : "No Requirements"}
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-label">
                  <i className="fas fa-calendar-plus"></i> Created Date
                </div>
                <div className="detail-value">
                  {formatDateTimeNotIncludeTime(selectedJob.createdAt)}
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-label">
                  <i className="fas fa-calendar-day"></i> Updated
                </div>
                <div className="detail-value">
                  {formatDateTimeNotIncludeTime(selectedJob.updatedAt)}
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-label">
                  <i className="fas fa-calendar-times"></i> Expires
                </div>
                <div className="detail-value">
                  {formatDateTimeNotIncludeTime(selectedJob.deadline)}
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-label">
                  <i className="fas fa-info-circle"></i> Status
                </div>
                <div className="detail-value">
                  {getStatusBadge(selectedJob.status, selectedJob.deadline)}
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-label">
                  <i className="fas fa-flag"></i> Priority
                </div>
                <div className="detail-value">
                  {getPriorityBadge(selectedJob.priority)}
                </div>
              </div>
            </div>

            {selectedJob.description && (
              <div className="job-description">
                <h4>
                  <i className="fas fa-file-alt"></i> Job Description
                </h4>
                <div className="description-content">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: selectedJob.description,
                    }}
                  />
                </div>
              </div>
            )}

            {selectedJob.requirements && (
              <div className="job-requirements">
                <h4>
                  <i className="fas fa-clipboard-list"></i> Requirements
                </h4>
                <div className="requirements-content">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: selectedJob.requirements,
                    }}
                  />
                </div>
              </div>
            )}

            {selectedJob.benefits && (
              <div className="job-benefits">
                <h4>
                  <i className="fas fa-gift"></i> Benefits
                </h4>
                <div className="benefits-content">
                  <div
                    dangerouslySetInnerHTML={{ __html: selectedJob.benefits }}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button className="close-modal-btn" onClick={closeDetailModal}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="user-dashboard">
      <div className="dashboard-outer">
        <div className="upper-title-box">
          <div className="title-flex">
            <h3>Manage Jobs</h3>
            <div className="text">Here are your job postings</div>
          </div>
          <div className="search-and-sort-container d-flex align-items-center">
            <div className="sort-options mr-3">
              <select
                className="form-control"
                value={sortOrder}
                onChange={handleSortOrderChange}
              >
                <option value="updatedAt">Sort by update date</option>
                <option value="createdAt">Sort by creation date</option>
              </select>
            </div>
            <div className="search-input-wrapper">
              <input
                type="text"
                className="form-control search-input"
                placeholder="Search by job title"
                value={searchParams.title}
                onChange={(e) =>
                  setSearchParams({
                    ...searchParams,
                    title: e.target.value,
                    PageIndex: 1,
                  })
                }
              />
              <span className="search-icon">🔍</span>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12">
            <div className="ls-widget">
              <div className="widget-title">
                <h4>
                  <i className="fas fa-list mr-2"></i>
                  Job Listings
                </h4>
                <div className="widget-title-right">
                  <div className="refresh-button">
                    <button className="btn-refresh" onClick={() => getJobs()}>
                      <i className="fas fa-sync-alt"></i> Refresh
                    </button>
                  </div>
                  <div className="page-size-selector">
                    <label>Show per page:</label>
                    <select
                      value={searchParams.PageSize}
                      onChange={(e) =>
                        setSearchParams({
                          ...searchParams,
                          PageSize: parseInt(e.target.value),
                          PageIndex: 1,
                        })
                      }
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="20">20</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="widget-content">
                {loading ? (
                  <div className="loading-container">
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Loading jobs...</span>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="default-table manage-job-table">
                      <thead>
                        <tr>
                          <th>
                            <i className="fas fa-file-alt mr-1"></i> Title
                          </th>
                          <th>
                            <i className="fas fa-map-marker-alt mr-1"></i>{" "}
                            Location
                          </th>
                          <th>
                          
                            <i className="fas fa-solid fa-money-bill mr-1"></i> Salary(VND)
                          </th>
                          <th>
                            <i className="fas fa-info-circle mr-1"></i> Status
                          </th>
                          <th>
                            <i className="fas fa-briefcase mr-1"></i> Work Type
                          </th>
                          <th>
                            <i className="fas fa-calendar-plus mr-1"></i>{" "}
                            Created
                          </th>
                          <th>
                            <i className="fas fa-calendar-times mr-1"></i>{" "}
                            Expires
                          </th>
                          <th>
                            <i className="fas fa-user-plus mr-1"></i> Openings
                          </th>
                          <th className="text-center">
                            <i className="fas fa-cogs mr-1"></i> Actions
                          </th>
                          <th className="text-center">
                            <i className="fas fa-users mr-1"></i> Candidates
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {jobs.length > 0 ? (
                          jobs.map((job) => (
                            <tr
                              key={job.jobID}
                              className={`job-row ${
                                job.status === 2 ? "job-hidden" : ""
                              } ${
                                isJobExpired(job.deadline) ? "job-expired" : ""
                              }`}
                            >
                              <td
                                className="clickable-cell"
                                onClick={() => handleViewDetail(job)}
                              >
                                <div
                                  className={`job-title ${
                                    job.status === 3 ? "text-danger" : ""
                                  }`}
                                >
                                  {job.priority === true && <i className="fas fa-star text-warning mr-2"></i>}
                                  <span
                                    className={`job-title ${
                                      isJobExpired(job.deadline)
                                        ? "text-danger"
                                        : ""
                                    }`}
                                  >
                                    {job.title}
                                  </span>
                                </div>
                              </td>
                              <td
                                className="clickable-cell"
                                onClick={() => handleViewDetail(job)}
                              >
                                {job.location || "Remote"}
                              </td>
                              <td
                                className="clickable-cell"
                                onClick={() => handleViewDetail(job)}
                              >
                                {job.salary
                                  ? `${job.salary.toLocaleString()}`
                                  : "Negotiable"}
                              </td>
                              <td
                                className="clickable-cell"
                                onClick={() => handleViewDetail(job)}
                              >
                                {getStatusBadge(job.status, job.deadline)}
                              </td>
                              <td
                                className="clickable-cell text-center"
                                onClick={() => handleViewDetail(job)}
                              >
                                {job.workType || "Full-Time"}
                              </td>
                              <td
                                className="clickable-cell"
                                onClick={() => handleViewDetail(job)}
                              >
                                {formatDateTimeNotIncludeTime(job.createdAt)}
                              </td>
                              <td
                                className="clickable-cell"
                                onClick={() => handleViewDetail(job)}
                              >
                                {formatDateTimeNotIncludeTime(job.deadline)}
                              </td>
                              <td
                                className="clickable-cell text-center"
                                onClick={() => handleViewDetail(job)}
                              >
                                {job.numberOfRecruitment || 1}
                              </td>
                              <td className="text-center">
                                <div className="action-buttons">
                                  <button
                                    className="view-btn"
                                    onClick={() => handleViewDetail(job)}
                                  >
                                    <i className="fas fa-eye"></i> View
                                  </button>
                                  <button
                                    className="edit-btn"
                                    onClick={() => handleEdit(job.jobID)}
                                  >
                                    <i className="fas fa-edit"></i> Edit
                                  </button>
                                  
                                  {/* Add the Priority toggle button with disabled state check */}
                                  {isJobExpired(job.deadline) || job.status === 0 || job.status === 1 ? (
                                    <button 
                                      className="priority-btn disabled" 
                                      disabled
                                      title={
                                        isJobExpired(job.deadline) 
                                          ? "Cannot change priority for expired jobs" 
                                          : job.status === 0 
                                            ? "Cannot change priority for pending jobs" 
                                            : "Cannot change priority for rejected jobs"
                                      }
                                    >
                                      <i className="fas fa-star-half-alt"></i> 
                                      {job.priority ? 'High Priority' : 'Low Priority'}
                                    </button>
                                  ) : (
                                    <ConfirmDialog
                                      title={job.priority ? "Change to Low Priority?" : "Change to High Priority?"}
                                      description={
                                        job.priority 
                                          ? "Are you sure you want to set this job to Low Priority? Note: This may not be possible until your subscription duration expires." 
                                          : "Are you sure you want to set this job to High Priority? This will count against your featured job limit and cannot be changed back until your subscription duration expires."
                                      }
                                      confirmText={job.priority ? "Set Low" : "Set High"}
                                      variant={job.priority ? "warning" : "primary"}
                                      onConfirm={() => handleTogglePriority(job.jobID)}
                                    >
                                      <button className={`priority-btn ${job.priority ? 'high-priority' : 'low-priority'}`}>
                                        <i className={`fas ${job.priority ? 'fa-star' : 'fa-star-half-alt'}`}></i> 
                                        {job.priority ? 'Low Priority' : 'High Priority'}
                                      </button>
                                    </ConfirmDialog>
                                  )}
                                  
                                  {job.status !== 2 ? (
                                    <ConfirmDialog
                                      title="Hide job?"
                                      description="Are you sure you want to hide this job? It will not be visible to candidates."
                                      confirmText="Hide"
                                      variant="destructive"
                                      onConfirm={() => handleHideJob(job.jobID)}
                                    >
                                      <button className="hide-btn">
                                        <i className="fas fa-eye-slash"></i>{" "}
                                        Hide
                                      </button>
                                    </ConfirmDialog>
                                  ) : (
                                    <ConfirmDialog
                                      title="Show job?"
                                      description="Are you sure you want to show this job again? It will be visible to candidates."
                                      confirmText="Show"
                                      variant="primary"
                                      onConfirm={() =>
                                        handleUnhideJob(job.jobID)
                                      }
                                    >
                                      <button className="unhide-btn">
                                        <i className="fas fa-eye"></i> Unhide
                                      </button>
                                    </ConfirmDialog>
                                  )}
                                </div>
                              </td>
                              <td className="text-center">
                                <button
                                  className={`view-candidates-btn ${
                                    candidateCounts[job.jobID]
                                      ? "has-candidates"
                                      : "no-candidates"
                                  }`}
                                  onClick={() =>
                                    handleViewCandidates(job.jobID)
                                  }
                                  disabled={candidateCounts[job.jobID] === 0}
                                >
                                  <i className="fas fa-user-check"></i>{" "}
                                  {getCandidateButtonText(job.jobID)}
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr className="no-results">
                            <td colSpan="12">
                              <div className="no-jobs">
                                <i className="fas fa-briefcase-medical"></i>
                                <p>No jobs found</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>

                    {/* Pagination Component */}
                    <Pagination
                      currentPage={searchParams.PageIndex}
                      totalPage={totalPage}
                      setSearchParams={setSearchParams}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {renderJobDetailModal()}

      
         </section>
  );
}
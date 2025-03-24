import { useEffect, useState } from "react";
import {
  fetchCandidatesForJob,
  hideJob,
  unhideJob,
} from "../../../services/jobServices";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Pagination from "./Pagination";
import ConfirmDialog from "./ConfirmDialog"; // Import component ConfirmDialog
import { fetchCompanyProfile } from "@/services/employerServices";
import { fetchJobsForManagement } from "../../../services/jobServices";
import { formatDateTimeNotIncludeTime } from "@/helpers/formatDateTime";
import { getUserLoginData } from "@/helpers/decodeJwt";

export default function ManageJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [totalPage, setTotalPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [candidateCounts, setCandidateCounts] = useState({});
  const [sortOrder, setSortOrder] = useState("desc"); // 'desc' cho giảm dần, 'asc' cho tăng dần
  const [selectedJob, setSelectedJob] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    PageIndex: 1,
    PageSize: 5,
    title: "",
    IncludeHidden: true,
    MostRecent: false, // MostRecent parameter with false value for sorting by updatedAt
  });
  const [verificationLevel, setVerificationLevel] = useState(null);

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

  // Check if job is expired
  const isJobExpired = (deadline) => {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    const today = new Date();
    return deadlineDate < today;
  };

  const getJobs = async () => {
    try {
      setLoading(true);
      const paramsToSend = {
        ...searchParams,
        IncludeHidden: true,
        MostRecent: searchParams.MostRecent, // Ensure MostRecent parameter is sent
      };

      const data = await fetchJobsForManagement(paramsToSend);
      console.log("Jobs from API:", data.jobs);
      setJobs(data.jobs);
      setTotalPage(data.totalPage);

      // Fetch candidate counts for each job
      const counts = {};
      for (const job of data.jobs) {
        try {
          const candidates = await fetchCandidatesForJob(job.jobID);
          counts[job.jobID] = candidates.length;
        } catch (error) {
          console.error(
            `Failed to fetch candidates for job ${job.jobID}:`,
            error
          );
          counts[job.jobID] = 0;
        }
      }
      setCandidateCounts(counts);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      setLoading(false);
      toast.error("Could not load jobs. Please try again.");
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
      return <span className={badgeClass}>High</span>;
    } else {
      badgeClass += " low";
      return <span className={badgeClass}>Low</span>;
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
                <h2>{selectedJob.title}</h2>
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
                  <i className="fas fa-dollar-sign"></i> Salary
                </div>
                <div className="detail-value">
                  {selectedJob.minSalary && selectedJob.salary
                    ? `${selectedJob.minSalary.toLocaleString()} - ${selectedJob.salary.toLocaleString()}`
                    : selectedJob.salary
                    ? `Up to ${selectedJob.salary.toLocaleString()}`
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

              {/* <div className="detail-item">
                <div className="detail-label">
                  <i className="fas fa-id-badge"></i> Position
                </div>
                <div className="detail-value">
                  {selectedJob.jobPosition || "Not Specified"}
                </div>
              </div> */}

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
                  <i className="fas fa-eye-slash"></i> Visibility
                </div>
                <div className="detail-value">
                  {selectedJob.status === 3 ? "Hidden" : "Visible"}
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
                            <i className="fas fa-dollar-sign mr-1"></i> Salary
                          </th>
                          <th>
                            <i className="fas fa-info-circle mr-1"></i> Status
                          </th>
                          <th>
                            <i className="fas fa-briefcase mr-1"></i> Work Type
                          </th>
                          {/* <th>
                            <i className="fas fa-id-badge mr-1"></i> Position
                          </th> */}
                          <th>
                            <i className="fas fa-flag mr-1"></i> Priority
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
                              {/* <td
                                className="clickable-cell"
                                onClick={() => handleViewDetail(job)}
                              >
                                {job.jobPosition || "Not specified"}
                              </td> */}
                              <td
                                className="clickable-cell"
                                onClick={() => handleViewDetail(job)}
                              >
                                {getPriorityBadge(job.priority)}
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
                                  {/* <ConfirmDialog
                                    title="Delete job?"
                                    description="Are you sure you want to delete this job? This action cannot be undone."
                                    confirmText="Delete"
                                    variant="destructive"
                                    onConfirm={() => handleDelete(job.jobID)}
                                  >
                                    <button className="delete-btn">
                                      <i className="fas fa-trash-alt"></i> Delete
                                    </button>
                                  </ConfirmDialog> */}
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

      <style>{`
        .upper-title-box {
          margin-bottom: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
        }

        .title-flex {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .upper-title-box h3 {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 5px;
        }

        .upper-title-box .text {
          color: #6c757d;
          font-size: 16px;
        }

        .search-box-container {
          position: relative;
          min-width: 250px;
        }

        .search-input-wrapper {
          position: relative;
        }

        .search-input {
          padding: 8px 15px;
          padding-right: 35px;
          border: 1px solid #ddd;
          border-radius: 4px;
          width: 100%;
        }

        .search-icon {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #6c757d;
        }

        .ls-widget {
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
          overflow: hidden;
          margin-bottom: 30px;
        }

        .widget-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          background: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
        }

        .widget-title h4 {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
        }

        .widget-title-right {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .page-size-selector {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .page-size-selector label {
          margin: 0;
          font-weight: 500;
        }

        .page-size-selector select {
          padding: 5px 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
        }

        .btn-refresh {
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 5px 15px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-refresh:hover {
          background: #f1f1f1;
          border-color: #ccc;
        }

        .widget-content {
          padding: 20px;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 200px;
          flex-direction: column;
          gap: 10px;
          color: #666;
        }

        .loading-container i {
          font-size: 32px;
          color: #3498db;
        }

        .table-responsive {
          overflow-x: auto;
        }

        .default-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }

        .default-table th {
          background: #f8f9fa;
          padding: 12px 15px;
          text-align: left;
          font-weight: 600;
          color: #495057;
          border-bottom: 2px solid #dee2e6;
          white-space: nowrap;
        }

        .default-table th.text-center {
          text-align: center;
        }

        .default-table td {
          padding: 12px 15px;
          border-bottom: 1px solid #dee2e6;
          vertical-align: middle;
        }

        .default-table td.text-center {
          text-align: center;
        }

        .default-table tr:hover {
          background-color: #f8f9fa;
        }

        .clickable-cell {
          cursor: pointer;
        }

        .clickable-cell:hover {
          background-color: #f1f1f1;
        }

        .job-title {
          font-weight: 600;
          color: #3498db;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .hidden-tag {
          display: inline-block;
          font-size: 0.7em;
          background-color: #ffc107;
          color: #212529;
          padding: 2px 5px;
          border-radius: 3px;
          font-weight: 600;
        }

        .expired-tag {
          display: inline-block;
          font-size: 0.7em;
          background-color: #6c757d;
          color: white;
          padding: 2px 5px;
          border-radius: 3px;
          font-weight: 600;
        }

        /* Style cho job bị ẩn */
        .job-row.job-hidden {
          opacity: 0.6;
          background-color: #f8f9fa;
        }

        .job-row.job-hidden:hover {
          opacity: 0.8;
        }

        /* Style cho job hết hạn */
        .job-row.job-expired {
          opacity: 0.7;
          background-color: #f8f9fa;
        }

        .job-row.job-expired:hover {
          opacity: 0.9;
        }

        .status-badge,
        .priority-badge {
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 0.85em;
          font-weight: 600;
          display: inline-block;
        }

        .status-badge.accepted {
          background-color: #d4edda;
          color: #155724;
        }

        .status-badge.rejected {
          background-color: #f8d7da;
          color: #721c24;
        }

        .status-badge.hidden {
          background-color: #ffc107;
          color: #212529;
        }

        .status-badge.pending {
          background-color: #fff3cd;
          color: #856404;
        }

        .status-badge.expired {
          background-color: #6c757d;
          color: white;
        }

        .priority-badge.high {
          background-color: #f8d7da;
          color: #721c24;
        }

        .priority-badge.low {
          background-color: #d1ecf1;
          color: #0c5460;
        }

        .action-buttons {
          display: flex;
          gap: 10px;
          justify-content: center;
        }

        .edit-btn,
        .delete-btn,
        .view-candidates-btn,
        .view-btn {
          padding: 6px 12px;
          border-radius: 4px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
        }

        .view-btn {
          background-color: #6c757d;
          color: white;
        }

        .view-btn:hover {
          background-color: #5a6268;
        }

        .edit-btn {
          background-color: #17a2b8;
          color: white;
        }

        .edit-btn:hover {
          background-color: #138496;
        }

        .delete-btn {
          background-color: #dc3545;
          color: white;
        }

        .delete-btn:hover {
          background-color: #c82333;
        }

        .hide-btn,
        .unhide-btn {
          padding: 6px 12px;
          border-radius: 4px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
        }

        .hide-btn {
          background-color: #ffc107;
          color: #212529;
        }

        .hide-btn:hover {
          background-color: #e0a800;
        }

        .unhide-btn {
          background-color: #28a745;
          color: white;
        }

        .unhide-btn:hover {
          background-color: #218838;
        }

        .view-candidates-btn {
          background-color: #6c757d;
          color: white;
          width: 100%;
          justify-content: center;
        }

        .view-candidates-btn.has-candidates {
          background-color: #28a745;
        }

        .view-candidates-btn.has-candidates:hover {
          background-color: #218838;
        }

        .view-candidates-btn.no-candidates {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .no-results td {
          padding: 30px 15px;
        }

        .no-jobs {
          display: flex;
          flex-direction: column;
          align-items: center;
          color: #6c757d;
        }

        .no-jobs i {
          font-size: 48px;
          margin-bottom: 15px;
        }

        .no-jobs p {
          font-size: 16px;
          margin: 0;
        }

        .mr-1 {
          margin-right: 4px;
        }

        .mr-2 {
          margin-right: 8px;
        }

        .ml-2 {
          margin-left: 8px;
        }

        .job-row {
          transition: transform 0.2s, opacity 0.3s, background-color 0.3s;
        }

        .job-row:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          z-index: 1;
          position: relative;
        }

        /* Job Detail Modal Styles */
        .job-detail-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          background-color: rgba(0, 0, 0, 0.5);
        }

        .modal-content {
          position: relative;
          background-color: white;
          border-radius: 8px;
          width: 90%;
          max-width: 900px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          animation: modalSlideIn 0.3s forwards;
        }

        @keyframes modalSlideIn {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          border-bottom: 1px solid #dee2e6;
          background-color: #f8f9fa;
        }

        .modal-header h3 {
          margin: 0;
          font-weight: 600;
          color: #343a40;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #6c757d;
          transition: color 0.2s;
        }

        .close-btn:hover {
          color: #343a40;
        }

        .modal-body {
          padding: 20px;
        }

        .modal-footer {
          padding: 15px 20px;
          border-top: 1px solid #dee2e6;
          text-align: right;
        }

        .close-modal-btn {
          padding: 8px 16px;
          background-color: #6c757d;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .close-modal-btn:hover {
          background-color: #5a6268;
        }

        .job-detail-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #dee2e6;
        }

        .job-title-section h2 {
          margin: 0 0 10px 0;
          color: #343a40;
        }

        .job-meta {
          display: flex;
          gap: 10px;
        }

        .job-actions {
          display: flex;
          gap: 10px;
        }

        .job-details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 25px;
        }

        .detail-item {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 6px;
          border-left: 3px solid #3498db;
        }

        .detail-label {
          color: #6c757d;
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 5px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .detail-value {
          font-size: 16px;
          color: #343a40;
        }

        .job-description,
        .job-requirements,
        .job-benefits {
          margin-bottom: 20px;
        }

        .job-description h4,
        .job-requirements h4,
        .job-benefits h4 {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 18px;
          margin-bottom: 10px;
          color: #343a40;
          padding-bottom: 8px;
          border-bottom: 1px solid #dee2e6;
        }

        .description-content,
        .requirements-content,
        .benefits-content {
          line-height: 1.6;
          color: #495057;
        }

        /* For lists inside the job details */
        .description-content ul,
        .requirements-content ul,
        .benefits-content ul {
          padding-left: 20px;
          margin-bottom: 15px;
        }

        .expired-job-notice {
          background-color: #f8d7da;
          color: #721c24;
          padding: 10px 15px;
          border-radius: 4px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 500;
        }
        .text-danger {
          color: #dc3545 !important;
          font-weight: 500;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .job-detail-header {
            flex-direction: column;
          }

          .job-actions {
            margin-top: 15px;
          }

          .job-details-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}

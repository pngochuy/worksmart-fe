import React, { useEffect, useState } from "react";
import { fetchCandidatesForJob, rejectCandidate, acceptCandidate, fetchJobDetails } from "../../../services/jobServices";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Pagination from "./Pagination"; // Reusing your existing Pagination component

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobTitle, setJobTitle] = useState("");
  const [totalPage, setTotalPage] = useState(1);
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    PageIndex: 1,
    PageSize: 5, // Show 5 candidates per page
    name: "", // To filter by candidate name
  });

  useEffect(() => {
    getJobDetails(jobId);
    getCandidates(jobId);
  }, [jobId, searchParams.PageIndex, searchParams.PageSize, searchParams.name]);

  const getCandidates = async (jobId) => {
    try {
      setLoading(true);
      // Assuming your fetchCandidatesForJob function can accept pagination params
      // You might need to update your API service to handle pagination
      const data = await fetchCandidatesForJob(jobId, searchParams);

      // If your API returns paginated data in this format:
      if (data.candidates && data.totalPage) {
        setCandidates(data.candidates);
        setTotalPage(data.totalPage);
      } else {
        // If your API doesn't support pagination yet, handle it client-side
        setCandidates(data);

        // Calculate total pages based on data length
        const totalItems = data.length;
        const calculatedTotalPages = Math.ceil(
          totalItems / searchParams.PageSize
        );
        setTotalPage(calculatedTotalPages);

        // Paginate the data client-side
        const startIndex = (searchParams.PageIndex - 1) * searchParams.PageSize;
        const endIndex = startIndex + searchParams.PageSize;
        const filteredData = data
          .filter(
            (candidate) =>
              !searchParams.name ||
              (candidate.fullName &&
                candidate.fullName
                  .toLowerCase()
                  .includes(searchParams.name.toLowerCase()))
          )
          .slice(startIndex, endIndex);
        setCandidates(filteredData);
      }

      console.log("Candidates data:", data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching candidates:", error);
      // toast.error("Could not load candidates. Please try again.");
    }
  };

  const getJobDetails = async (jobId) => {
    try {
      const jobDetails = await fetchJobDetails(jobId);
      console.log("Job details:", jobDetails);
      setJobTitle(jobDetails.job.title || `Job #${jobId}`);
    } catch (error) {
      console.error("Error fetching job details:", error);
      setJobTitle(`Job #${jobId}`);
    }
  };

  const handleReject = async (candidateId) => {
    try {
      await rejectCandidate(candidateId, jobId);
      toast.success("Candidate rejected successfully!");
      getCandidates(jobId);
    } catch (error) {
      toast.error("Failed to reject candidate.");
      console.error("Error rejecting candidate:", error);
    }
  };

  const handleAccept = async (candidateId) => {
    try {
      await acceptCandidate(candidateId, jobId);
      toast.success("Candidate accepted successfully!");
      getCandidates(jobId);
    } catch (error) {
      toast.error("Failed to accept candidate.");
      console.error("Error accepting candidate:", error);
    }
  };

  const handleBackToJobs = () => {
    navigate('/employer/manage-jobs');
  };

  const getStatusBadge = (status) => {
    let badgeClass = "status-badge";

    switch (status?.toLowerCase()) {
      case "pending":
        badgeClass += " pending";
        break;
      case "accepted":
        badgeClass += " accepted";
        break;
      case "rejected":
        badgeClass += " rejected";
        break;
      default:
        badgeClass += " default";
    }

    return <span className={badgeClass}>{status || "Unknown"}</span>;
  };

  return (
    <section className="user-dashboard">
      <div className="dashboard-outer">
        <div className="upper-title-box">
          <div className="title-flex">
            <button className="back-button" onClick={handleBackToJobs}>
              <i className="fas fa-arrow-left mr-1"></i> Back to Job Manager
            </button>
            <h3>
              <i className="fas fa-users mr-2"></i>
              Candidates for: <span className="text-primary">{jobTitle}</span>
            </h3>
          </div>
          <div className="search-box-container">
            <div className="search-input-wrapper">
              <input
                type="text"
                className="form-control search-input"
                placeholder="Search by candidate name"
                value={searchParams.name}
                onChange={(e) =>
                  setSearchParams({
                    ...searchParams,
                    name: e.target.value,
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
                  Applied Candidates
                </h4>
                <div className="widget-title-right">
                  <div className="refresh-button">
                    <button
                      className="btn-refresh"
                      onClick={() => getCandidates(jobId)}
                    >
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
                    <span>Loading candidates...</span>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="default-table manage-job-table">
                      <thead>
                        <tr>
                          <th>
                            <i className="fas fa-user mr-1"></i> Name
                          </th>
                          <th>
                            <i className="fas fa-envelope mr-1"></i> Email
                          </th>
                          <th>
                            <i className="fas fa-phone mr-1"></i> Phone
                          </th>
                          <th>
                            <i className="fas fa-info-circle mr-1"></i> Status
                          </th>
                          <th className="text-center">
                            <i className="fas fa-cogs mr-1"></i> Actions
                          </th>
                        </tr>
                      </thead>
                     {/* comment out */}
                      <tbody>
                        {candidates.length > 0 ? (
                          candidates.map((candidate) => (
                            <tr key={candidate.applicationID}>
                              <td>
                                <div className="candidate-name">
                                  <div className="candidate-avatar">
                                    {candidate.fullName
                                      ? candidate.fullName
                                          .charAt(0)
                                          .toUpperCase()
                                      : "?"}
                                  </div>
                                  <div className="candidate-info">
                                    <span className="name">
                                      {candidate.fullName || "Unknown"}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <a
                                  href={`mailto:${candidate.email}`}
                                  className="email-link"
                                >
                                  {candidate.email || "Unknown"}
                                </a>
                              </td>
                              <td>
                                {candidate.phoneNumber ? (
                                  <a
                                    href={`tel:${candidate.phoneNumber}`}
                                    className="phone-link"
                                  >
                                    {candidate.phoneNumber}
                                  </a>
                                ) : (
                                  "Unknown"
                                )}
                              </td>
                              <td>{getStatusBadge(candidate.status)}</td>
                              <td className="text-center">
                                <div className="action-buttons">
                                  {/* Thêm nút View Detail */}
                                  <button
                                    className="view-detail-btn"
                                    onClick={() => navigate(`/employer/manage-jobs/candidates/${jobId}/${candidate.applicationID}`)}>
                                    <i className="fas fa-eye"></i> View Detail
                                  </button>
                                  {/* <button
                                    className="accept-btn"
                                    disabled={candidate.status === "Accepted"}
                                    onClick={() =>
                                      handleAccept(candidate.applicationID)
                                    }
                                  >
                                    <i className="fas fa-check-circle"></i>{" "}
                                    Accept
                                  </button>
                                  <button
                                    className="reject-btn"
                                    disabled={candidate.status === "Rejected"}
                                    onClick={() => handleReject(candidate.applicationID)}>
                                    <i className="fas fa-times-circle"></i> Reject
                                  </button> */}
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr className="no-results">
                            <td colSpan="5">
                              <div className="no-candidates">
                                <i className="fas fa-user-slash"></i>
                                <p>No candidates found</p>
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

      <style jsx>{`
      .view-detail-btn {
    padding: 6px 12px;
    border-radius: 4px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 5px;
    background-color: #6c757d;
    color: white;
  }
  
  .view-detail-btn:hover {
    background-color: #5a6268;
  }
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

        .back-button {
          display: flex;
          align-items: center;
          background-color: #f8f9fa;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 8px 15px;
          font-weight: 600;
          color: #495057;
          cursor: pointer;
          transition: all 0.3s;
          margin-bottom: 10px;
        }

        .back-button:hover {
          background-color: #e9ecef;
          color: #212529;
        }

        .back-button i {
          margin-right: 5px;
        }

        .upper-title-box h3 {
          font-size: 24px;
          font-weight: 600;
        }

        .text-primary {
          color: #3498db;
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

        .candidate-name {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .candidate-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #3498db;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .candidate-info {
          display: flex;
          flex-direction: column;
        }

        .candidate-info .name {
          font-weight: 600;
        }

        .email-link,
        .phone-link {
          color: #3498db;
          text-decoration: none;
        }

        .email-link:hover,
        .phone-link:hover {
          text-decoration: underline;
        }

        .status-badge {
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 0.85em;
          font-weight: 600;
          display: inline-block;
        }

        .status-badge.pending {
          background-color: #fff3cd;
          color: #856404;
        }

        .status-badge.accepted {
          background-color: #d4edda;
          color: #155724;
        }

        .status-badge.rejected {
          background-color: #f8d7da;
          color: #721c24;
        }

        .status-badge.default {
          background-color: #e2e3e5;
          color: #383d41;
        }

        .action-buttons {
          display: flex;
          gap: 10px;
          justify-content: center;
        }

        .accept-btn,
        .reject-btn {
          padding: 6px 12px;
          border-radius: 4px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .accept-btn {
          background-color: #28a745;
          color: white;
        }

        .accept-btn:hover:not(:disabled) {
          background-color: #218838;
        }

        .reject-btn {
          background-color: #dc3545;
          color: white;
        }

        .reject-btn:hover:not(:disabled) {
          background-color: #c82333;
        }

        .accept-btn:disabled,
        .reject-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .no-results td {
          padding: 30px 15px;
        }

        .no-candidates {
          display: flex;
          flex-direction: column;
          align-items: center;
          color: #6c757d;
        }

        .no-candidates i {
          font-size: 48px;
          margin-bottom: 15px;
        }

        .no-candidates p {
          font-size: 16px;
          margin: 0;
        }

        .mr-1 {
          margin-right: 4px;
        }

        .mr-2 {
          margin-right: 8px;
        }
      `}</style>
    </section>
  );
}

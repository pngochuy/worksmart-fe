import { useEffect, useState } from "react";
import {
  fetchCandidatesForJob,
  fetchJobDetails,
} from "../../../services/jobServices";
import { useParams, useNavigate } from "react-router-dom";
import Pagination from "./Pagination"; // Reusing your existing Pagination component
import { toast } from "react-toastify";
import axios from "axios";
import { getCVById } from "../../../services/cvServices"; // Add this import

export default function CandidatesPage() {
  const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;
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

  // New state for message dialog
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [messageText, setMessageText] = useState(
    "Congratulations! We've reviewed your application and would like to schedule an interview with you. Please let us know your availability for the coming week."
  );

  const [isSending, setIsSending] = useState(false);
  const user = JSON.parse(localStorage.getItem("userLoginData")); // Get logged in employer data

  useEffect(() => {
    getJobDetails(jobId);
    getCandidates(jobId);
  }, [jobId, searchParams.PageIndex, searchParams.PageSize, searchParams.name]);

  const getCandidates = async (jobId) => {
    try {
      setLoading(true);
      // Assuming your fetchCandidatesForJob function can accept pagination params
      const data = await fetchCandidatesForJob(jobId, searchParams);

      // Process candidates with CV data
      const processedCandidates = [];
      console.log("Fetched candidates data:", data);
      if (Array.isArray(data)) {
        // Fetch CV data for each candidate if they have a CV ID
        for (const candidate of data) {
          let enrichedCandidate = {
            ...candidate,
            // Default fallback name
            candidateName:
              candidate.candidateName ||
              candidate.fullName ||
              "Unknown Candidate",
          };

          // If candidate has a CV ID, try to fetch CV data
          if (candidate.cvid) {
            try {
              const cvData = await getCVById(candidate.cvid);
              console.log(
                `CV data for candidate ${candidate.applicationID}:`,
                cvData
              );

              enrichedCandidate = {
                ...enrichedCandidate,
                candidateName: `${cvData?.lastName} ${cvData?.firstName}`,
                email: cvData?.email || "Unknown",
                cvData: cvData,
              };
            } catch (cvError) {
              console.error(
                `Error fetching CV for candidate ${candidate.applicationID}:`,
                cvError
              );
            }
          }

          processedCandidates.push(enrichedCandidate);
        }
      }

      if (data.candidates && data.totalPage) {
        // Process paginated data similar to above
        const processedPaginatedCandidates = [];
        for (const candidate of data.candidates) {
          let enrichedCandidate = {
            ...candidate,
            candidateName:
              candidate.candidateName ||
              candidate.fullName ||
              "Unknown Candidate",
          };

          if (candidate.cvid) {
            try {
              const cvData = await getCVById(candidate.cvid);
              enrichedCandidate = {
                ...enrichedCandidate,
                candidateName:
                  cvData?.fullName || enrichedCandidate.candidateName,
                email: cvData?.email || enrichedCandidate.email,
                cvData: cvData,
              };
            } catch (cvError) {
              console.error(`Error fetching CV:`, cvError);
            }
          }

          processedPaginatedCandidates.push(enrichedCandidate);
        }

        setCandidates(processedPaginatedCandidates);
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

      console.log("Processed candidates data:", processedCandidates);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching candidates:", error);
      toast.error("Could not load candidates. Please try again.");
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

  const handleBackToJobs = () => {
    navigate("/employer/manage-jobs");
  };

  const getStatusBadge = (applicationStatus) => {
    let badgeClass = "status-badge";
    switch (applicationStatus?.toLowerCase()) {
      case "pending":
        badgeClass += " pending";
        break;
      case "approved":
        badgeClass += " accepted";
        break;
      case "rejected":
        badgeClass += " rejected";
        break;
      default:
        badgeClass += " default";
    }

    return <span className={badgeClass}>{applicationStatus || "Unknown"}</span>;
  };

  // New function to handle message button click
  const handleMessageClick = (candidate) => {
    setSelectedCandidate({
      ...candidate,
      userID: candidate.userID, // Đảm bảo userID được thiết lập đúng
      fullName: candidate.fullName, // Đảm bảo fullName được thiết lập đúng
      email: candidate.email, // Đảm bảo email được thiết lập đúng
    });
    setShowMessageDialog(true);
  };

  // Update handleSendMessage
  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setIsSending(true);

    try {
      // Get sender (employer) and receiver (candidate) IDs
      const senderId = user.userID;
      const receiverId = selectedCandidate.userID; // Assuming this property exists

      // Create message data
      const messageData = {
        senderId: senderId,
        receiverId: receiverId,
        content: messageText.trim(),
      };

      // Send message through API endpoint
      await axios.post(`${BACKEND_API_URL}/api/Messages`, messageData);

      // Close dialog and reset state
      setShowMessageDialog(false);
      setSelectedCandidate(null);
      setMessageText(
        "Congratulations! We've reviewed your application and would like to schedule an interview with you. Please let us know your availability for the coming week."
      );

      toast.success("Message sent successfully!");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again later.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="user-dashboard">
      <div className="dashboard-outer">
        <div className="upper-title-box">
          <div className="title-flex">
            <button className="back-button" onClick={handleBackToJobs}>
              <i className="fas fa-arrow-left mr-1"></i> Back
            </button>
            <h3>
              {/* <i className="fas fa-users mr-2"></i> */}
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
                      <tbody>
                        {candidates.length > 0 ? (
                          candidates.map((candidate) => (
                            <tr key={candidate.applicationID}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="flex-shrink-0">
                                    <img
                                      src={
                                        candidate?.avatar
                                          ? candidate.avatar
                                          : "https://www.topcv.vn/images/avatar-default.jpg"
                                      }
                                      alt={
                                        candidate.fullName || "Candidate"
                                      }
                                      className="rounded-circle"
                                      width="50"
                                      height="50"
                                    />
                                  </div>
                                  <div className="flex-grow-1 ms-3 text-truncate">
                                    <span className="fw-bold">
                                      {candidate.fullName ||
                                        "Unknown Candidate"}
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
                              <td>
                                {getStatusBadge(candidate.applicationStatus)}
                              </td>
                              <td className="text-center">
                                <div className="action-buttons">
                                  {/* View Detail Button */}
                                  <button
                                    className="view-detail-btn"
                                    onClick={() =>
                                      navigate(
                                        `/employer/manage-jobs/candidates/${jobId}/${candidate.applicationID}`
                                      )
                                    }
                                  >
                                    <i className="fas fa-eye"></i> View Detail
                                  </button>

                                  {/* Message Button - Only show for Approved candidates */}
                                  {candidate.applicationStatus?.toLowerCase() ===
                                    "approved" && (
                                      <button
                                        className="message-btn"
                                        onClick={() =>
                                          handleMessageClick(candidate)
                                        }
                                      >
                                        <i className="fas fa-comment-alt"></i>{" "}
                                        Message
                                      </button>
                                    )}
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

      {/* Message Dialog */}
      {showMessageDialog && selectedCandidate && (
        <div className="message-dialog-overlay">
          <div className="message-dialog">
            <div className="message-dialog-header">
              <h3>Send Message to {selectedCandidate.fullName}</h3>
              <button
                className="close-btn"
                onClick={() => setShowMessageDialog(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="message-dialog-body">
              <p className="message-info">
                You&apos;re about to send a message to this approved candidate.
                This will notify them via email and in-app notification.
              </p>

              <div className="candidate-details">
                <div className="detail-item">
                  <span className="label">Email:</span>
                  <span className="value">{selectedCandidate.email}</span>
                </div>
                {selectedCandidate.phoneNumber && (
                  <div className="detail-item">
                    <span className="label">Phone:</span>
                    <span className="value">
                      {selectedCandidate.phoneNumber}
                    </span>
                  </div>
                )}
                <div className="detail-item">
                  <span className="label">Job Position:</span>
                  <span className="value">{jobTitle}</span>
                </div>
              </div>

              <div className="message-textarea-container">
                <label>Your message:</label>
                <textarea
                  className="message-textarea"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Enter your message to the candidate..."
                  rows={6}
                ></textarea>
              </div>
            </div>
            <div className="message-dialog-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowMessageDialog(false)}
              >
                Cancel
              </button>
              <button
                className="send-btn"
                onClick={handleSendMessage}
                disabled={isSending}
              >
                {isSending ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Sending...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i> Send Message
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .view-detail-btn, .message-btn {
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

        .view-detail-btn {
          background-color: #6c757d;
          color: white;
        }

        .view-detail-btn:hover {
          background-color: #5a6268;
        }
        
        .message-btn {
          background-color: #0088cc;
          color: white;
        }
        
        .message-btn:hover {
          background-color: #0077b5;
        }
        
        /* Message Dialog Styles */
        .message-dialog-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .message-dialog {
          background-color: white;
          border-radius: 8px;
          width: 90%;
          max-width: 600px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          max-height: 90vh;
          overflow: hidden;
        }
        
        .message-dialog-header {
          padding: 15px 20px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .message-dialog-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }
        
        .close-btn {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #888;
          padding: 5px;
        }
        
        .close-btn:hover {
          color: #333;
        }
        
        .message-dialog-body {
          padding: 20px;
          overflow-y: auto;
        }
        
        .message-info {
          background-color: #f8f9fa;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 15px;
          color: #495057;
          font-size: 14px;
          border-left: 4px solid #0088cc;
        }
        
        .candidate-details {
          margin-bottom: 20px;
          background-color: #f8f9fa;
          padding: 12px;
          border-radius: 6px;
        }
        
        .detail-item {
          margin-bottom: 8px;
          display: flex;
        }
        
        .detail-item .label {
          font-weight: 600;
          width: 100px;
          color: #495057;
        }
        
        .detail-item .value {
          color: #212529;
        }
        
        .message-textarea-container {
          margin-bottom: 10px;
        }
        
        .message-textarea-container label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
        }
        
        .message-textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: inherit;
          resize: vertical;
          min-height: 120px;
        }
        
        .message-textarea:focus {
          border-color: #0088cc;
          outline: none;
          box-shadow: 0 0 0 2px rgba(0, 136, 204, 0.2);
        }
        
        .message-dialog-footer {
          padding: 15px 20px;
          border-top: 1px solid #eee;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        
        .cancel-btn, .send-btn {
          padding: 8px 16px;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .cancel-btn {
          background-color: #f8f9fa;
          border: 1px solid #ddd;
          color: #495057;
        }
        
        .cancel-btn:hover {
          background-color: #e9ecef;
        }
        
        .send-btn {
          background-color: #0088cc;
          border: none;
          color: white;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .send-btn:hover {
          background-color: #0077b5;
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
          display: inline-flex;  /* Changed from flex to inline-flex */
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
          width: fit-content;  /* Added to make width match content */
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
          width: 50px;
          height: 50px;
          border-radius: 50%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
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
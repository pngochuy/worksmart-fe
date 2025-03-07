import React, { useEffect, useState } from "react";
import { fetchCandidatesForJob, rejectCandidate, acceptCandidate } from "../../../services/jobServices";  
import { useParams } from "react-router-dom";
import { toast } from "react-toastify"; 

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);  
  const { jobId } = useParams();  

  useEffect(() => {
    getCandidates(jobId);
  }, [jobId]);

  const getCandidates = async (jobId) => {
    try {
      setLoading(true);  // Set loading true khi bắt đầu lấy dữ liệu
      const data = await fetchCandidatesForJob(jobId);
      setCandidates(data);
      console.log("Candidates data:", data);
      setLoading(false);  // Set loading false khi lấy xong dữ liệu
    } catch (error) {
      setLoading(false);  // Set loading false nếu có lỗi
      console.error("Error fetching candidates:", error);
    }
  };

  // Hàm từ chối ứng viên
  const handleReject = async (candidateId) => {
    try {
      // Gọi API reject
      await rejectCandidate(candidateId, jobId);
      toast.success("Candidate rejected successfully!");
      getCandidates(jobId);  // Cập nhật lại danh sách ứng viên
    } catch (error) {
      toast.error("Failed to reject candidate.");
      console.error("Error rejecting candidate:", error);
    }
  };

  // Hàm chấp nhận ứng viên
  const handleAccept = async (candidateId) => {
    try {
      // Gọi API accept
      await acceptCandidate(candidateId, jobId);
      toast.success("Candidate accepted successfully!");
      getCandidates(jobId);  // Cập nhật lại danh sách ứng viên
    } catch (error) {
      toast.error("Failed to accept candidate.");
      console.error("Error accepting candidate:", error);
    }
  };

  return (
    <section className="user-dashboard">
      <div className="dashboard-outer">
        <div className="upper-title-box">
          <h3>Candidates for Job {jobId}</h3>
        </div>

        <div className="row">
          <div className="col-lg-12">
            <div className="ls-widget">
              <div className="widget-title">
                <h4>Candidate List</h4>
              </div>

              <div className="widget-content">
                {loading ? (
                  <div>Loading candidates...</div>  
                ) : (
                  <table className="default-table manage-job-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {candidates.length > 0 ? (
                        candidates.map((candidate) => (
                          <tr key={candidate.applicationID}>
                            <td>
                              {candidate.user ? (
                                <span>
                                  {candidate.user.fullName}
                                </span>
                              ) : (
                                <span>Unknown</span>
                              )}
                            </td>
                            <td>{candidate.user ? candidate.user.email : "Unknown"}</td>
                            <td>{candidate.user ? candidate.user.phone : "Unknown"}</td>
                            <td>{candidate.status}</td>
                            <td>
                              <button 
                                className="accept-btn"
                                onClick={() => handleAccept(candidate.applicationID)}>
                                <i className="fas fa-check"></i> Accept
                              </button>
                              <button 
                                className="reject-btn"
                                onClick={() => handleReject(candidate.applicationID)}>
                                <i className="fas fa-times"></i> Reject
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5">No candidates applied yet</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

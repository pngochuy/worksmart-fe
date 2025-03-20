import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchCandidateDetail,
  rejectCandidate,
  acceptCandidate,
  fetchJobDetails
} from "../../../services/jobServices";
import { toast } from "react-toastify";
import ConfirmDialog from "./ConfirmDialog";
import {
  getCVById
} from "../../../services/cvServices";

export default function EmployerCandidateDetailPage() {
  const { jobId, candidateId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState(null);
  const [jobTitle, setJobTitle] = useState("");
  const [cv, setCV] = useState(null);

  useEffect(() => {
    getJobDetails();
    getCandidateDetail();
  }, []);

  const getJobDetails = async () => {
    try {
      const jobDetails = await fetchJobDetails(jobId);
      setJobTitle(jobDetails.job.title);
    } catch (error) {
      console.error("Error fetching job details:", error);
      setJobTitle(`Job #${jobId}`);
    }
  };

  const getCandidateDetail = async () => {
    try {
      setLoading(true);
      const data = await fetchCandidateDetail(candidateId, jobId);
      setCandidate(data);
      console.log("Candidate detail:", data);
      
      if (data && data.cvid) {
        try {
          const cvData = await getCVById(data.cvid);
          console.log("CV data:", cvData);
          setCV(cvData);
        } catch (cvError) {
          console.error("Error fetching CV details:", cvError);
        }
      }
    } catch (error) {
      console.error("Error fetching candidate detail:", error);
      toast.error("Could not load candidate details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (rejectionReason) => {
    try {
      await rejectCandidate(candidateId, jobId, rejectionReason);
      toast.success("Candidate rejected successfully!");
      getCandidateDetail();
    } catch (error) {
      toast.error("Failed to reject candidate.");
      console.error("Error rejecting candidate:", error);
    }
  };

  const handleAccept = async () => {
    try {
      await acceptCandidate(candidateId, jobId);
      toast.success("Candidate accepted successfully!");
      getCandidateDetail();
    } catch (error) {
      toast.error("Failed to accept candidate.");
      console.error("Error accepting candidate:", error);
    }
  };

  const handleBackToCandidates = () => {
    navigate(`/employer/manage-jobs/candidates/${jobId}`);
  };

  const handleViewFullCV = () => {
    if (cv && cv.filePath) {
      window.open(cv.filePath, '_blank');
    } 
  };

  if (loading) {
    return (
      <div className="loading-container">
        <i className="fas fa-spinner fa-spin"></i>
        <span>Loading candidate details...</span>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="error-container">
        <i className="fas fa-exclamation-circle"></i>
        <span>Could not load candidate details. Please try again later.</span>
        <button className="back-button" onClick={handleBackToCandidates}>
          Back to Candidates List
        </button>
      </div>
    );
  }

  return (
    <section className="user-dashboard candidate-detail-page">
      <div className="dashboard-outer">
        <div className="upper-title-box">
          <div className="title-flex">
            <button className="back-button" onClick={handleBackToCandidates}>
              <i className="fas fa-arrow-left mr-1"></i> Back to Candidates
            </button>
            <h3>
              <i className="fas fa-user mr-2"></i>
              Candidate Detail for: <span className="text-primary">{jobTitle}</span>
            </h3>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12">
            <div className="ls-widget">
              <div className="widget-title">
                <h4>
                  <i className="fas fa-id-card mr-2"></i>
                  Candidate Information
                </h4>
              </div>

              <div className="widget-content">
                <div className="candidate-info-container">
                  <div className="candidate-header">
                    <div className="candidate-avatar-large">
                      {candidate.fullName ? candidate.fullName.charAt(0).toUpperCase() : "?"}
                    </div>
                    <div className="candidate-header-info">
                      <h2 className="candidate-name">{candidate.fullName || "Unknown Candidate"}</h2>
                      <div className="status-badge-container">
                        <span className={`status-badge ${candidate.status?.toLowerCase()}`}>
                          {candidate.status || "Pending"}
                        </span>
                      </div>
                      <div className="candidate-contact">
                        {candidate.email && (
                          <div className="contact-item">
                            <i className="fas fa-envelope"></i>
                            <a href={`mailto:${candidate.email}`}>{candidate.email}</a>
                          </div>
                        )}
                        {candidate.phoneNumber && (
                          <div className="contact-item">
                            <i className="fas fa-phone"></i>
                            <a href={`tel:${candidate.phoneNumber}`}>{candidate.phoneNumber}</a>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="candidate-actions">
                      {candidate.status !== "Rejected" && candidate.status === "Pending" && (
                        <ConfirmDialog
                          title="Accept Candidate"
                          description="Are you sure you want to accept this candidate?"
                          confirmText="Accept"
                          variant="primary"
                          onConfirm={handleAccept}
                          showReasonField={false}
                        >
                          <button className="accept-btn">
                            <i className="fas fa-check-circle"></i> Accept Candidate
                          </button>
                        </ConfirmDialog>
                      )}

                      {candidate.status !== "Accepted" && candidate.status === "Pending" && (
                        <ConfirmDialog
                          title="Reject Candidate"
                          description="Please provide a reason for rejecting this candidate. This reason will be included in the email sent to the candidate."
                          confirmText="Reject"
                          variant="destructive"
                          onConfirm={handleReject}
                          showReasonField={true}
                        >
                          <button className="reject-btn">
                            <i className="fas fa-times-circle"></i> Reject Candidate
                          </button>
                        </ConfirmDialog>
                      )}
                    </div>
                  </div>

                  <div className="candidate-detail-grid">
                    {/* Personal Information */}
                    <div className="detail-section">
                      <h3 className="section-title">
                        <i className="fas fa-briefcase"></i> Professional Information
                      </h3>
                      <div className="detail-grid">
                        {candidate.education && (
                          <div className="detail-item">
                            <span className="detail-label">Education</span>
                            <span className="detail-value">{candidate.education}</span>
                          </div>
                        )}
                        
                        {candidate.experience && (
                          <div className="detail-item">
                            <span className="detail-label">Experience</span>
                            <span className="detail-value">{candidate.experience} years</span>
                          </div>
                        )}
                        
                        {candidate.skills && (
                          <div className="detail-item">
                            <span className="detail-label">Skills</span>
                            <div className="skills-container">
                              {candidate.skills.split(',').map((skill, index) => (
                                <span key={index} className="skill-tag">{skill.trim()}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {cv && cv.jobPosition && (
                          <div className="detail-item">
                            <span className="detail-label">Current Position</span>
                            <span className="detail-value">{cv.jobPosition}</span>
                          </div>
                        )}
                        
                        {cv && cv.skills && cv.skills.length > 0 && (
                          <div className="detail-item">
                            <span className="detail-label">CV Skills</span>
                            <div className="skills-container">
                              {cv.skills.map((skill, index) => (
                                <span key={index} className="skill-tag">{skill.skillName}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {cv && cv.summary && (
                          <div className="detail-item">
                            <span className="detail-label">Professional Summary</span>
                            <span className="detail-value">{cv.summary}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Education section */}
                      {cv && cv.educations && cv.educations.length > 0 && (
                        <div className="sub-section">
                          <h4 className="sub-section-title">Education</h4>
                          <div className="timeline-container">
                            {cv.educations.map((edu, index) => (
                              <div key={index} className="timeline-item">
                                <div className="timeline-marker"></div>
                                <div className="timeline-content">
                                  <h5>{edu.schoolName || "Educational Institution"}</h5>
                                  <h6>{edu.major || ""}</h6>
                                  {(edu.startedAt || edu.endedAt) && (
                                    <p className="timeline-period">
                                      {edu.startedAt && new Date(edu.startedAt).getFullYear()} 
                                      {edu.endedAt && ` - ${new Date(edu.endedAt).getFullYear()}`}
                                    </p>
                                  )}
                                  {edu.description && <p>{edu.description}</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Experience section */}
                      {cv && cv.experiences && cv.experiences.length > 0 && (
                        <div className="sub-section">
                          <h4 className="sub-section-title">Work Experience</h4>
                          <div className="timeline-container">
                            {cv.experiences.map((exp, index) => (
                              <div key={index} className="timeline-item">
                                <div className="timeline-marker"></div>
                                <div className="timeline-content">
                                  <h5>{exp.companyName || "Company"}</h5>
                                  <h6>{exp.jobPosition || "Position"}</h6>
                                  {(exp.startedAt || exp.endedAt) && (
                                    <p className="timeline-period">
                                      {exp.startedAt && new Date(exp.startedAt).getFullYear()}
                                      {exp.endedAt && ` - ${new Date(exp.endedAt).getFullYear()}`}
                                    </p>
                                  )}
                                  {exp.description && <p>{exp.description}</p>}
                                  {exp.address && <p><i className="fas fa-map-marker-alt"></i> {exp.address}</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Certifications section */}
                      {cv && cv.certifications && cv.certifications.length > 0 && (
                        <div className="sub-section">
                          <h4 className="sub-section-title">Certifications</h4>
                          <div className="timeline-container">
                            {cv.certifications.map((cert, index) => (
                              <div key={index} className="timeline-item">
                                <div className="timeline-marker"></div>
                                <div className="timeline-content">
                                  <h5>{cert.certificateName || "Certification"}</h5>
                                  {cert.issuer && <h6>{cert.issuer}</h6>}
                                  {cert.dateReceived && (
                                    <p className="timeline-period">
                                      Issued: {new Date(cert.dateReceived).toLocaleDateString()}
                                    </p>
                                  )}
                                  {cert.description && <p>{cert.description}</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="detail-section">
                      <h3 className="section-title">
                        <i className="fas fa-file-alt"></i> Date Applied
                      </h3>
                      <div className="detail-grid">
                        {candidate.createdAt && (
                          <div className="detail-item">
                            <span className="detail-value">{new Date(candidate.createdAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="cv-section">
                    <h3 className="section-title">
                      <i className="fas fa-file-pdf"></i> Curriculum Vitae (CV)
                    </h3>
                    <div className="cv-preview">
                      <div className="cv-actions">
                        <button
                          className="view-cv-btn"
                          onClick={handleViewFullCV}
                          disabled={!(cv?.filePath )}>
                          <i className="fas fa-eye"></i> View Full CV
                        </button>
                        {(cv?.filePath ) && (
                          <a
                            href={cv?.filePath }
                            download
                            className="download-cv-btn">
                            <i className="fas fa-download"></i> Download CV
                          </a>
                        )}
                      </div>
                      {(cv?.filePath) ? (
                        <div className="cv-preview-container">
                          <iframe
                            src={cv?.filePath}
                            title="CV Preview"
                            className="cv-preview-frame"
                            frameBorder="0"
                          />
                        </div>
                      ) : (
                        <div className="no-cv-preview">
                          <i className="fas fa-file-pdf"></i>
                          <p>CV preview not available. Click the button above to view the full CV.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .candidate-detail-page {
          padding: 30px 0;
        }
        
        .loading-container, .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          gap: 15px;
          text-align: center;
        }
        
        .loading-container i, .error-container i {
          font-size: 36px;
          color: #3498db;
        }
        
        .error-container i {
          color: #e74c3c;
        }
        
        .back-button {
          display: inline-flex;
          align-items: center;
          background-color: #f8f9fa;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 8px 15px;
          font-weight: 600;
          color: #495057;
          cursor: pointer;
          transition: all 0.3s;
          margin-top: 15px;
        }
        
        .back-button:hover {
          background-color: #e9ecef;
          color: #212529;
        }
        
        .upper-title-box {
          margin-bottom: 30px;
        }
        
        .title-flex {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .upper-title-box h3 {
          font-size: 24px;
          font-weight: 600;
          display: flex;
          align-items: center;
        }
        
        .text-primary {
          color: #3498db;
        }
        
        .ls-widget {
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
          overflow: hidden;
          margin-bottom: 30px;
        }
        
        .widget-title {
          padding: 15px 20px;
          background: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
        }
        
        .widget-title h4 {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
          display: flex;
          align-items: center;
        }
        
        .widget-content {
          padding: 20px;
        }
        
        .candidate-info-container {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }
        
        .candidate-header {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          padding-bottom: 20px;
          border-bottom: 1px solid #e9ecef;
        }
        
        .candidate-avatar-large {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background-color: #3498db;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 42px;
          font-weight: bold;
        }
        
        .candidate-header-info {
          flex: 1;
          min-width: 200px;
        }
        
        .candidate-name {
          font-size: 24px;
          font-weight: 600;
          margin: 0 0 5px 0;
        }
        
        .status-badge-container {
          margin-bottom: 10px;
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
        
        .candidate-contact {
          display: flex;
          flex-direction: column;
          gap: 5px;
          margin-top: 10px;
        }
        
        .contact-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .contact-item i {
          color: #6c757d;
          width: 20px;
          text-align: center;
        }
        
        .contact-item a {
          color: #3498db;
          text-decoration: none;
        }
        
        .contact-item a:hover {
          text-decoration: underline;
        }
        
        .candidate-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          justify-content: center;
        }
        
        .accept-btn, .reject-btn, .view-cv-btn, .download-cv-btn {
          padding: 10px 15px;
          border-radius: 4px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-width: 180px;
          text-decoration: none;
        }
        
        .accept-btn {
          background-color: #28a745;
          color: white;
        }
        
        .accept-btn:hover {
          background-color: #218838;
        }
        
        .reject-btn {
          background-color: #dc3545;
          color: white;
        }
        
        .reject-btn:hover {
          background-color: #c82333;
        }
        
        .view-cv-btn, .download-cv-btn {
          background-color: #3498db;
          color: white;
        }
        
        .view-cv-btn:hover, .download-cv-btn:hover {
          background-color: #2980b9;
        }
        
        .view-cv-btn:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
          opacity: 0.7;
        }
        
        .candidate-detail-grid {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }
        
        .detail-section {
          border: 1px solid #e9ecef;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .section-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 18px;
          font-weight: 600;
          margin: 0;
          padding: 15px 20px;
          background-color: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
        }
        
        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          padding: 20px;
        }
        
        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        
        .detail-label {
          font-weight: 600;
          color: #6c757d;
          font-size: 14px;
        }
        
        .detail-value {
          font-size: 16px;
        }
        
        .skills-container {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }
        
        .skill-tag {
          background-color: #e9ecef;
          color: #495057;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 0.85em;
        }
        
        .cv-section {
          border: 1px solid #e9ecef;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .cv-preview {
          padding: 20px;
        }
        
        .cv-actions {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        
        .cv-preview-container {
          height: 500px;
          border: 1px solid #e9ecef;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .cv-preview-frame {
          width: 100%;
          height: 100%;
        }
        
        .no-cv-preview {
          height: 300px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 15px;
          background-color: #f8f9fa;
          border-radius: 4px;
          color: #6c757d;
          text-align: center;
          padding: 20px;
        }
        
        .no-cv-preview i {
          font-size: 48px;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .candidate-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          
          .candidate-header-info, .candidate-contact {
            align-items: center;
          }
          
          .detail-grid {
            grid-template-columns: 1fr;
          }
        }
          .sub-section {
  padding: 0 20px 20px;
  border-top: 1px solid #e9ecef;
  margin-top: 20px;
}

.sub-section-title {
  font-size: 17px;
  font-weight: 600;
  margin: 20px 0;
  color: #495057;
}

.timeline-container {
  margin-left: 20px;
  position: relative;
}

.timeline-container:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 2px;
  background-color: #e9ecef;
}

.timeline-item {
  position: relative;
  padding-left: 30px;
  margin-bottom: 30px;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-marker {
  position: absolute;
  left: -5px;
  top: 5px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #3498db;
  border: 2px solid white;
}

.timeline-content h5 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 5px;
  color: #212529;
}

.timeline-content h6 {
  font-size: 15px;
  font-weight: 500;
  margin: 0 0 5px;
  color: #3498db;
}

.timeline-period {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 10px;
}
      `}</style>
    </section>
  );
}
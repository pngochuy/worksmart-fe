import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchCandidateDetail,
  rejectCandidate,
  acceptCandidate,
  fetchJobDetails,
} from "../../../services/jobServices";
import { toast } from "react-toastify";
import ConfirmDialog from "./ConfirmDialog";
import { getCVById } from "../../../services/cvServices";
import "../manage-jobs/styleApplicationPage.css";
export default function EmployerCandidateDetailPage() {
  const { jobId, candidateId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState(null);
  const [jobTitle, setJobTitle] = useState("");
  const [cv, setCV] = useState(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

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
      setIsRejecting(true);
      await rejectCandidate(candidateId, jobId, rejectionReason);
      toast.success("Candidate rejected successfully!");
      getCandidateDetail();
    } catch (error) {
      toast.error("Failed to reject candidate.");
      console.error("Error rejecting candidate:", error);
    } finally {
      setIsRejecting(false);
    }
  };

  const handleAccept = async () => {
    try {
      setIsAccepting(true);
      await acceptCandidate(candidateId, jobId);
      toast.success("Candidate accepted successfully!");
      getCandidateDetail();
    } catch (error) {
      toast.error("Failed to accept candidate.");
      console.error("Error accepting candidate:", error);
    } finally {
      setIsAccepting(false);
    }
  };
  const getStatusBadge = (status) => {
    let badgeClass = "status-badge";

    switch (status?.toLowerCase()) {
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

    return <span className={badgeClass}>{status || "Unknown"}</span>;
  };
  const handleBackToCandidates = () => {
    navigate(`/employer/manage-jobs/candidates/${jobId}`);
  };

  const handleViewFullCV = () => {
    if (cv && cv.filePath) {
      window.open(cv.filePath, "_blank");
    }
  };

  // Properly handle PDF downloading with correct approach
  const handleDownloadCV = () => {
    try {
      const filename = cv.filePath.split("/").pop() || "document.pdf";

      // Use fetch to get the PDF with proper headers
      fetch(cv.filePath)
        .then((response) => response.blob())
        .then((blob) => {
          // Create a blob URL and trigger download
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        })
        .catch((error) => {
          console.error("Download error:", error);
          toast.error("Error downloading file. Please try again.");
        });
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Error downloading file. Please try again.");
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
          Back
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
              <i className="fas fa-arrow-left mr-1"></i> Back
            </button>
            <h3>
              Candidate Detail for:
              <span className="text-primary ml-2"> {jobTitle}</span>
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
                      <img
                        src={
                          candidate?.avatar
                            ? candidate.avatar
                            : "https://www.topcv.vn/images/avatar-default.jpg"
                        }
                        alt={candidate.avatar}
                        className={{
                          height: "50px",
                          width: "50px",
                          borderRadius: "50%",
                        }}
                      />
                    </div>
                    <div className="candidate-header-info">
                      <h2 className="candidate-name">
                        {cv?.firstName && cv?.lastName ?
                          `${cv.lastName} ${cv.firstName}`.trim() :
                          (candidate.fullName || "Unknown Candidate")}
                      </h2>
                      <div className="status-badge-container">
                        <span
                          className={`status-badge ${candidate.status?.toLowerCase()}`}
                        >
                          {getStatusBadge(candidate.status)}
                        </span>
                      </div>
                      <div className="candidate-contact">
                        <div className="contact-item">
                          <i className="fas fa-envelope"></i>
                          <a href={`mailto:${cv?.email || ''}`}>
                            {cv?.email || "Unknown email"}
                          </a>
                        </div>
                        {candidate.phoneNumber && (
                          <div className="contact-item">
                            <i className="fas fa-phone"></i>
                            <a href={`tel:${candidate.phoneNumber}`}>
                              {candidate.phoneNumber}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="candidate-actions">
                      {candidate.status !== "Rejected" &&
                        candidate.status === "Pending" && (
                          <ConfirmDialog
                            title="Accept Candidate"
                            description="Are you sure you want to accept this candidate?"
                            confirmText={isAccepting ? "Processing..." : "Accept"}
                            variant="primary"
                            onConfirm={handleAccept}
                            showReasonField={false}
                            disabled={isAccepting || isRejecting}
                          >
                            <button
                              className={`accept-btn ${(isAccepting || isRejecting) ? 'disabled' : ''}`}
                              disabled={isAccepting || isRejecting}
                            >
                              {isAccepting ? (
                                <>
                                  <i className="fas fa-spinner fa-spin"></i> Processing...
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-check-circle"></i> Accept Candidate
                                </>
                              )}
                            </button>
                          </ConfirmDialog>
                        )}

                      {candidate.status !== "Accepted" &&
                        candidate.status === "Pending" && (
                          <ConfirmDialog
                            title="Reject Candidate"
                            description="Please provide a reason for rejecting this candidate. This reason will be included in the email sent to the candidate."
                            confirmText={isRejecting ? "Processing..." : "Reject"}
                            variant="destructive"
                            onConfirm={handleReject}
                            showReasonField={true}
                            disabled={isAccepting || isRejecting}
                          >
                            <button
                              className={`reject-btn ${(isAccepting || isRejecting) ? 'disabled' : ''}`}
                              disabled={isAccepting || isRejecting}
                            >
                              {isRejecting ? (
                                <>
                                  <i className="fas fa-spinner fa-spin"></i> Processing...
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-times-circle"></i> Reject Candidate
                                </>
                              )}
                            </button>
                          </ConfirmDialog>
                        )}
                    </div>
                  </div>

                  {cv?.filePath == null && (
                    <div className="candidate-detail-grid">
                      {/* Personal Information */}
                      <div className="detail-section">
                        <h3 className="section-title">
                          <i className="fas fa-briefcase"></i> Professional
                          Information
                        </h3>
                        <div className="detail-grid">
                          {candidate.education && (
                            <div className="detail-item">
                              <span className="detail-label">Education</span>
                              <span className="detail-value">
                                {candidate.education}
                              </span>
                            </div>
                          )}

                          {candidate.experience && (
                            <div className="detail-item">
                              <span className="detail-label">Experience</span>
                              <span className="detail-value">
                                {candidate.experience} years
                              </span>
                            </div>
                          )}

                          {candidate.skills && (
                            <div className="detail-item">
                              <span className="detail-label">Skills</span>
                              <div className="skills-container">
                                {candidate.skills
                                  .split(",")
                                  .map((skill, index) => (
                                    <span key={index} className="skill-tag">
                                      {skill.trim()}
                                    </span>
                                  ))}
                              </div>
                            </div>
                          )}

                          {cv && cv.jobPosition && (
                            <div className="detail-item">
                              <span className="detail-label">
                                Current Position
                              </span>
                              <span className="detail-value">
                                {cv.jobPosition}
                              </span>
                            </div>
                          )}

                          {cv && cv.skills && cv.skills.length > 0 && (
                            <div className="detail-item">
                              <span className="detail-label">CV Skills</span>
                              <div className="skills-container">
                                {cv.skills.map((skill, index) => (
                                  <span key={index} className="skill-tag">
                                    {skill.skillName}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {cv && cv.summary && (
                            <div className="detail-item">
                              <span className="detail-label">
                                Professional Summary
                              </span>
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
                                    <h5>
                                      {edu.schoolName ||
                                        "Educational Institution"}
                                    </h5>
                                    <h6>{edu.major || ""}</h6>
                                    {(edu.startedAt || edu.endedAt) && (
                                      <p className="timeline-period">
                                        {edu.startedAt &&
                                          new Date(edu.startedAt).getFullYear()}
                                        {edu.endedAt &&
                                          ` - ${new Date(
                                            edu.endedAt
                                          ).getFullYear()}`}
                                      </p>
                                    )}
                                    {edu.description && (
                                      <p>{edu.description}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Experience section */}
                        {cv && cv.experiences && cv.experiences.length > 0 && (
                          <div className="sub-section">
                            <h4 className="sub-section-title">
                              Work Experience
                            </h4>
                            <div className="timeline-container">
                              {cv.experiences.map((exp, index) => (
                                <div key={index} className="timeline-item">
                                  <div className="timeline-marker"></div>
                                  <div className="timeline-content">
                                    <h5>{exp.companyName || "Company"}</h5>
                                    <h6>{exp.jobPosition || "Position"}</h6>
                                    {(exp.startedAt || exp.endedAt) && (
                                      <p className="timeline-period">
                                        {exp.startedAt &&
                                          new Date(exp.startedAt).getFullYear()}
                                        {exp.endedAt &&
                                          ` - ${new Date(
                                            exp.endedAt
                                          ).getFullYear()}`}
                                      </p>
                                    )}
                                    {exp.description && (
                                      <p>{exp.description}</p>
                                    )}
                                    {exp.address && (
                                      <p>
                                        <i className="fas fa-map-marker-alt"></i>{" "}
                                        {exp.address}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Certifications section */}
                        {cv &&
                          cv.certifications &&
                          cv.certifications.length > 0 && (
                            <div className="sub-section">
                              <h4 className="sub-section-title">
                                Certifications
                              </h4>
                              <div className="timeline-container">
                                {cv.certifications.map((cert, index) => (
                                  <div key={index} className="timeline-item">
                                    <div className="timeline-marker"></div>
                                    <div className="timeline-content">
                                      <h5>
                                        {cert.certificateName ||
                                          "Certification"}
                                      </h5>
                                      {cert.issuer && <h6>{cert.issuer}</h6>}
                                      {cert.dateReceived && (
                                        <p className="timeline-period">
                                          Issued:{" "}
                                          {new Date(
                                            cert.dateReceived
                                          ).toLocaleDateString()}
                                        </p>
                                      )}
                                      {cert.description && (
                                        <p>{cert.description}</p>
                                      )}
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
                              <span className="detail-value">
                                {new Date(
                                  candidate.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="cv-section">
                    <h3 className="section-title">
                      <i className="fas fa-file-pdf"></i> Curriculum Vitae (CV)
                    </h3>
                    <div className="cv-preview">
                      <div className="cv-actions">
                        <button
                          className="view-cv-btn"
                          onClick={handleViewFullCV}
                          disabled={!cv?.filePath}
                        >
                          <i className="fas fa-eye"></i> View Full CV
                        </button>
                        {cv?.filePath && (
                          <button
                            href={cv?.filePath}
                            onClick={handleDownloadCV}
                            className="view-cv-btn"
                          >
                            <i className="fas fa-download"></i> Download CV
                          </button>
                        )}
                      </div>
                      {cv?.filePath ? (
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
                          <p>
                            CV preview not available. Click the button above to
                            view the full CV.
                          </p>
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
    </section>
  );
}
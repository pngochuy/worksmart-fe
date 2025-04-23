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

  const getStatusBadge = (applicationStatus) => {
    return applicationStatus || "Unknown";
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
                  <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                      {/* Avatar Section - Larger and more prominent */}
                      <div className="flex-shrink-0">
                        <img
                          src={candidate?.avatar || "https://www.topcv.vn/images/avatar-default.jpg"}
                          alt={`${candidate.fullName || "Candidate"} avatar`}
                          className="h-24 w-24 rounded-full object-cover border-2 border-gray-200"
                        />
                      </div>

                      {/* Candidate Information */}
                      <div className="flex-grow space-y-2">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                          <h2 className="text-xl font-bold text-gray-800">
                            {candidate.fullName || "Unknown Candidate"}
                          </h2>

                          <div>
                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${candidate.applicationStatus === "Approved" ? "bg-green-100 text-green-800" :
                              candidate.applicationStatus === "Rejected" ? "bg-red-100 text-red-800" :
                                "bg-yellow-100 text-yellow-800"
                              }`}>
                              {getStatusBadge(candidate.applicationStatus)}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          {candidate.email && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                              </svg>
                              <a href={`mailto:${candidate.email}`} className="hover:text-blue-600">
                                {candidate.email}
                              </a>
                            </div>
                          )}

                          {candidate.phoneNumber && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                              </svg>
                              <a href={`tel:${candidate.phoneNumber}`} className="hover:text-blue-600">
                                {candidate.phoneNumber}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto mt-4 md:mt-0">
                        {candidate.applicationStatus === "Pending" && (
                          <>
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
                                className={`flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors ${(isAccepting || isRejecting) ? "opacity-50 cursor-not-allowed" : ""
                                  }`}
                                disabled={isAccepting || isRejecting}
                              >
                                {isAccepting ? (
                                  <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Accept
                                  </>
                                )}
                              </button>
                            </ConfirmDialog>

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
                                className={`flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors ${(isAccepting || isRejecting) ? "opacity-50 cursor-not-allowed" : ""
                                  }`}
                                disabled={isAccepting || isRejecting}
                              >
                                {isRejecting ? (
                                  <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    Reject
                                  </>
                                )}
                              </button>
                            </ConfirmDialog>
                          </>
                        )}
                      </div>
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
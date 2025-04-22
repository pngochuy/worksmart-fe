import { getUserLoginData } from "@/helpers/decodeJwt";
import { fetchCompanyProfile } from "@/services/employerServices";
import {
  fetchCandidatesForJob,
  acceptCandidate,
  rejectCandidate,
  fetchJobsByUserId,
  fetchCandidateDetail
} from "@/services/jobServices";
import { getCVById } from "@/services/cvServices";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Pagination from "./Pagination"; // Import the new Pagination component

export const Index = () => {
  const [verificationLevel, setVerificationLevel] = useState(null);
  const [allCandidates, setAllCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [displayedCandidates, setDisplayedCandidates] = useState([]);
  const [activeTab, setActiveTab] = useState("totals");
  const [isLoading, setIsLoading] = useState(true);
  const [userJobs, setUserJobs] = useState([]);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [jobsMap, setJobsMap] = useState({});
  const [candidateDetails, setCandidateDetails] = useState({});
  const [selectedJobId, setSelectedJobId] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [totalPage, setTotalPage] = useState(1);

  // Pagination parameters
  const [searchParams, setSearchParams] = useState({
    PageIndex: 1,
    PageSize: 6
  });

  const navigate = useNavigate();

  // Utility function to safely get candidate information
  const getCandidateInfo = (candidate, field, defaultValue = "N/A") => {
    const candidateDetail = candidateDetails[candidate.applicationID] || {};

    // Special handling for fullName
    if (field === 'fullName') {
      // Check for firstName and lastName in candidateDetail
      if (candidateDetail.firstName && candidateDetail.lastName) {
        return `${candidateDetail.lastName} ${candidateDetail.firstName}`;
      }

      // Check user object in candidateDetail
      if (candidateDetail.user?.firstName && candidateDetail.user?.lastName) {
        return `${candidateDetail.user.lastName} ${candidateDetail.user.firstName}`;
      }

      // Check CV data in candidateDetail
      if (candidateDetail.cvData?.lastName && candidateDetail.cvData?.firstName) {
        return `${candidateDetail.cvData.lastName} ${candidateDetail.cvData.firstName}`;
      }

      // Check in candidate data directly
      if (candidate.firstName && candidate.lastName) {
        return `${candidate.lastName} ${candidate.firstName}`;
      }

      if (candidate.user?.firstName && candidate.user?.lastName) {
        return `${candidate.user.lastName} ${candidate.user.firstName}`;
      }

      // Fallback options
      return (
        candidateDetail[field] ||
        candidate[field] ||
        candidate.user?.[field] ||
        candidateDetail.user?.[field] ||
        candidate.candidateName ||
        defaultValue
      );
    }

    // Handle other fields
    return (
      candidateDetail[field] ||
      candidate[field] ||
      candidate.user?.[field] ||
      candidateDetail.user?.[field] ||
      defaultValue
    );
  };

  // Debug function to log candidate status values
  const logCandidateStatuses = () => {
    console.log("All candidates:", allCandidates);
    console.log("Active tab:", activeTab);

    // Extract all unique status values
    const statusValues = new Set();
    allCandidates.forEach(candidate => {
      statusValues.add(candidate.status);
    });

    console.log("Unique status values:", Array.from(statusValues));

    // Count by status
    const statusCounts = {};
    allCandidates.forEach(candidate => {
      const status = candidate.status || "undefined";
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    console.log("Status counts:", statusCounts);
  };

  // Fetch detailed candidate information
  const fetchCandidateDetails = async (candidateId, jobId) => {
    try {
      const candidateDetail = await fetchCandidateDetail(candidateId, jobId);

      if (candidateDetail && candidateDetail.cvid) {
        try {
          const cvData = await getCVById(candidateDetail.cvid);

          const enrichedCandidateDetail = {
            ...candidateDetail,
            cvData: cvData
          };

          setCandidateDetails(prevDetails => ({
            ...prevDetails,
            [candidateId]: enrichedCandidateDetail
          }));

          return enrichedCandidateDetail;
        } catch (cvError) {
          console.error(`Error fetching CV for candidate ${candidateId}:`, cvError);

          setCandidateDetails(prevDetails => ({
            ...prevDetails,
            [candidateId]: candidateDetail
          }));

          return candidateDetail;
        }
      } else {
        setCandidateDetails(prevDetails => ({
          ...prevDetails,
          [candidateId]: candidateDetail
        }));

        return candidateDetail;
      }
    } catch (error) {
      console.error(`Error fetching details for candidate ${candidateId}:`, error);
      return null;
    }
  };

  // Skills rendering function
  const renderSkills = (candidate) => {
    const candidateDetail = candidateDetails[candidate.applicationID] || {};

    const skills = candidateDetail.skills ||
      candidateDetail.cvData?.skills ||
      candidate.skills ||
      candidate.user?.skills ||
      candidateDetail.user?.skills ||
      [];

    if (skills && skills.length > 0) {
      return skills.slice(0, 3).map((skill, index) => {
        const skillName = typeof skill === 'string'
          ? skill
          : (skill.skillName || skill.name || 'Unknown Skill');

        return (
          <li key={index}>
            <a href="#">{skillName}</a>
          </li>
        );
      });
    }
    return null;
  };

  // Date formatting function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Fetch user authentication info and jobs list
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const user = getUserLoginData();

        if (!user || !user.userID) {
          setIsLoading(false);
          return;
        }

        if (user.role === "Employer") {
          // Get verification level info
          const companyData = await fetchCompanyProfile();
          setVerificationLevel(companyData.verificationLevel);

          // Get user's job list
          const jobs = await fetchJobsByUserId(user.userID);

          if (Array.isArray(jobs)) {
            setUserJobs(jobs);

            // Create job mapping
            const jobsMapping = jobs.reduce((map, job) => {
              map[job.jobID] = job;
              return map;
            }, {});
            setJobsMap(jobsMapping);

            // Collect candidates from all jobs
            const allCandidatesArray = [];
            for (const job of jobs) {
              try {
                const candidates = await fetchCandidatesForJob(job.jobID);

                if (Array.isArray(candidates) && candidates.length > 0) {
                  // Enrich candidates with job info
                  const enrichedCandidates = candidates.map(candidate => ({
                    ...candidate,
                    jobInfo: {
                      jobID: job.jobID,
                      title: job.title,
                      company: job.companyName
                    }
                  }));

                  // Fetch detailed info for each candidate
                  for (const candidate of enrichedCandidates) {
                    await fetchCandidateDetails(candidate.applicationID, job.jobID);
                  }

                  allCandidatesArray.push(...enrichedCandidates);
                }
              } catch (error) {
                console.error(`Error fetching candidates for job ${job.jobID}:`, error);
              }
            }

            setAllCandidates(allCandidatesArray);

            // Debug the candidates' statuses
            setTimeout(() => {
              logCandidateStatuses();
            }, 1000);
          } else {
            console.warn("API did not return an array for jobs:", jobs);
            setUserJobs([]);
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Error loading data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter candidates based on search, status, and job
  useEffect(() => {
    // Filter all candidates based on search term, status, and job
    const filtered = allCandidates.filter((candidate) => {
      // Get full name for search
      const fullName = getCandidateInfo(candidate, 'fullName', '').toLowerCase();

      // Check if name matches search term
      const nameMatch = searchTerm === '' ||
        fullName.includes(searchTerm.toLowerCase());

      // Status filtering
      let statusMatch = true;
      if (activeTab === "approved") {
        statusMatch = candidate.status === "Approved";
      } else if (activeTab === "rejected") {
        statusMatch = candidate.status === "Rejected";
      } else if (activeTab === "pending") {
        statusMatch = candidate.status === "Pending";
      }

      // Job filtering
      let jobMatch = true;
      if (selectedJobId !== "all") {
        jobMatch = candidate.jobInfo?.jobID.toString() === selectedJobId;
      }

      return nameMatch && statusMatch && jobMatch;
    });

    setFilteredCandidates(filtered);

    // Calculate total pages based on filtered results
    const totalItems = filtered.length;
    const calculatedTotalPages = Math.max(1, Math.ceil(totalItems / searchParams.PageSize));
    setTotalPage(calculatedTotalPages);

    // Check if current page is valid after filtering
    if (searchParams.PageIndex > calculatedTotalPages && calculatedTotalPages > 0) {
      setSearchParams(prev => ({
        ...prev,
        PageIndex: 1
      }));
    }
  }, [allCandidates, searchTerm, activeTab, selectedJobId, searchParams.PageSize]);

  // Apply pagination to filtered candidates
  useEffect(() => {
    // Calculate start and end index for pagination
    const startIndex = (searchParams.PageIndex - 1) * searchParams.PageSize;
    const endIndex = Math.min(startIndex + searchParams.PageSize, filteredCandidates.length);

    // Get the slice of candidates for current page
    const currentPageCandidates = filteredCandidates.slice(startIndex, endIndex);

    setDisplayedCandidates(currentPageCandidates);

    // Log pagination info for debugging
    console.log("Pagination:", {
      pageIndex: searchParams.PageIndex,
      pageSize: searchParams.PageSize,
      totalItems: filteredCandidates.length,
      totalPages: totalPage,
      startIndex,
      endIndex,
      itemsOnPage: currentPageCandidates.length
    });
  }, [filteredCandidates, searchParams.PageIndex, searchParams.PageSize, totalPage]);

  // Redirect if verification level is insufficient
  useEffect(() => {
    if (verificationLevel !== null && verificationLevel < 3) {
      navigate("/employer/verification");
    }
  }, [verificationLevel, navigate]);

  // Tab change handler
  const handleTabChange = (tab) => {
    console.log("Changing tab to:", tab);
    setActiveTab(tab);
    // Reset pagination when changing tabs
    setSearchParams(prev => ({
      ...prev,
      PageIndex: 1
    }));
  };

  // Handle search term change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // Reset pagination when searching
    setSearchParams(prev => ({
      ...prev,
      PageIndex: 1
    }));
  };

  // Handle job filter change
  const handleJobChange = (e) => {
    setSelectedJobId(e.target.value);
    // Reset pagination when changing job filter
    setSearchParams(prev => ({
      ...prev,
      PageIndex: 1
    }));
  };

  // Handle page size change
  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setSearchParams(prev => ({
      ...prev,
      PageIndex: 1, // Reset to first page when changing page size
      PageSize: newSize
    }));
  };

  // Page change handler for pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPage) {
      setSearchParams(prev => ({
        ...prev,
        PageIndex: newPage
      }));
    }
  };

  // View candidate application
  const handleViewApplication = (jobId, applicationId) => {
    navigate(`/employer/manage-jobs/candidates/${jobId}/${applicationId}`);
  };

  // Approve candidate
  const handleApproveApplication = async (jobId, candidateId) => {
    try {
      await acceptCandidate(candidateId, jobId);
      toast.success("Candidate approved successfully!");

      // Update candidate status
      setAllCandidates(prevCandidates =>
        prevCandidates.map(candidate =>
          candidate.applicationID === candidateId
            ? { ...candidate, status: "Approved" }
            : candidate
        )
      );
    } catch (error) {
      console.error("Error approving candidate:", error);
      toast.error("Error approving candidate");
    }
  };

  // Reject candidate preparation
  const handleRejectClick = (candidate) => {
    setSelectedCandidate(candidate);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  // Confirm candidate rejection
  const handleConfirmReject = async () => {
    if (!selectedCandidate) return;

    try {
      await rejectCandidate(
        selectedCandidate.applicationID,
        selectedCandidate.jobInfo.jobID,
        rejectionReason
      );
      toast.success("Candidate rejected successfully!");
      setShowRejectModal(false);

      // Update candidate status
      setAllCandidates(prevCandidates =>
        prevCandidates.map(candidate =>
          candidate.applicationID === selectedCandidate.applicationID
            ? { ...candidate, status: "Rejected", rejectionReason }
            : candidate
        )
      );
    } catch (error) {
      console.error("Error rejecting candidate:", error);
      toast.error("Error rejecting candidate");
    }
  };

  // Delete application (placeholder)
  const handleDeleteApplication = async (candidateId) => {
    toast.info("Delete function not implemented yet");
  };

  // Count candidates by status
  const totalCandidates = allCandidates.length;
  const approvedCandidates = allCandidates.filter(candidate => candidate.status === "Approved").length;
  const rejectedCandidates = allCandidates.filter(candidate => candidate.status === "Rejected").length;
  const pendingCandidates = allCandidates.filter(candidate => candidate.status === "Pending").length;

  return (
    <>
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <h3>All Applicants</h3>
            <div className="text">Ready to jump back in?</div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4>Applicant</h4>

                    <div className="filters-container d-flex align-items-center">
                      {/* Search input */}
                      <div className="search-box mr-3">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search by candidate name"
                          value={searchTerm}
                          onChange={handleSearchChange}
                        />
                      </div>

                      {/* Filter by job */}
                      <div className="chosen-outer mr-3">
                        <select
                          className="chosen-select"
                          onChange={handleJobChange}
                          value={selectedJobId}
                        >
                          <option value="all">All Jobs</option>
                          {userJobs.map(job => (
                            <option key={job.jobID} value={job.jobID.toString()}>
                              {job.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Filter by status */}
                      <div className="chosen-outer mr-3">
                        <select
                          className="chosen-select"
                          onChange={(e) => handleTabChange(e.target.value)}
                          value={activeTab}
                        >
                          <option value="totals">All Status</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                          <option value="pending">Pending</option>
                        </select>
                      </div>

                      {/* Page size selector */}
                      <div className="page-size-selector">
                        <label className="mr-2">Show:</label>
                        <select
                          className="chosen-select"
                          value={searchParams.PageSize}
                          onChange={handlePageSizeChange}
                        >
                          <option value="6">6</option>
                          <option value="12">12</option>
                          <option value="24">24</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="widget-content">
                    <div className="tabs-box">
                      {isLoading ? (
                        <div className="col-12 text-center py-5">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="aplicants-upper-bar">
                            <h6>All Jobs Candidates</h6>
                            <ul className="aplicantion-status tab-buttons clearfix">
                              <li
                                className={`tab-btn ${activeTab === "totals" ? "active-btn" : ""} totals`}
                                onClick={() => handleTabChange("totals")}
                              >
                                Total(s): {totalCandidates}
                              </li>
                              <li
                                className={`tab-btn ${activeTab === "approved" ? "active-btn" : ""} approved`}
                                onClick={() => handleTabChange("approved")}
                              >
                                Approved: {approvedCandidates}
                              </li>
                              <li
                                className={`tab-btn ${activeTab === "rejected" ? "active-btn" : ""} rejected`}
                                onClick={() => handleTabChange("rejected")}
                              >
                                Rejected(s): {rejectedCandidates}
                              </li>
                              <li
                                className={`tab-btn ${activeTab === "pending" ? "active-btn" : ""} pending`}
                                onClick={() => handleTabChange("pending")}
                              >
                                Pending(s): {pendingCandidates}
                              </li>
                            </ul>
                          </div>

                          <div className="tabs-content">
                            <div className="tab active-tab">
                              <div className="row">
                                {displayedCandidates.length === 0 ? (
                                  <div className="col-12 text-center py-5">
                                    <h5>No candidates found</h5>
                                  </div>
                                ) : (
                                  displayedCandidates.map((candidate) => (
                                    <div className="candidate-block-three col-lg-6 col-md-12 col-sm-12" key={candidate.applicationID}>
                                      <div className="inner-box">
                                        <div className="content">
                                          <figure className="image">
                                            <img
                                              src={
                                                getCandidateInfo(candidate, 'avatar') ||
                                                "images/resource/candidate-1.png"
                                              }
                                              alt={getCandidateInfo(candidate, 'fullName', 'Candidate')}
                                            />
                                          </figure>
                                          <h4 className="name">
                                            <a href="#">{getCandidateInfo(candidate, 'fullName')}</a>
                                          </h4>
                                          <ul className="candidate-info">
                                            <li className="designation">
                                              {getCandidateInfo(candidate, 'jobPosition', 'Job Position')}
                                            </li>
                                            <li>
                                              <span className="icon flaticon-map-locator"></span>{" "}
                                              {getCandidateInfo(candidate, 'address', 'Location not specified')}
                                            </li>
                                          </ul>
                                          <div className="job-info-badge mt-2 mb-2" style={{
                                            display: 'inline-block',
                                            padding: '5px 10px',
                                            backgroundColor: '#f0f0f0',
                                            borderRadius: '5px',
                                            fontSize: '12px'
                                          }}>
                                            <strong>Applied for:</strong> {candidate.jobInfo?.title || "Unknown Job"}
                                          </div>

                                          <div className="application-status mt-2" style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            padding: '5px 10px',
                                            backgroundColor: '#f5f5f5',
                                            borderRadius: '5px',
                                            fontSize: '12px',
                                            marginBottom: '10px'
                                          }}>
                                            <span>
                                              <strong>Status:</strong>
                                              <span style={{
                                                padding: '2px 8px',
                                                borderRadius: '10px',
                                                marginLeft: '5px',
                                                backgroundColor:
                                                  candidate.status === 'Approved' ? '#e0f7ea' :
                                                    candidate.status === 'Rejected' ? '#ffe5e5' :
                                                      candidate.status === 'Pending' ? '#f0f0f0' : '#f0f0f0',
                                                color:
                                                  candidate.status === 'Approved' ? '#28a745' :
                                                    candidate.status === 'Rejected' ? '#dc3545' :
                                                      candidate.status === 'Pending' ? '#666' : '#666'
                                              }}>
                                                {candidate.status}
                                              </span>
                                            </span>
                                            <span><strong>Applied:</strong> {formatDate(candidate.createdAt)}</span>
                                          </div>

                                          {renderSkills(candidate) && (
                                            <ul className="post-tags">
                                              {renderSkills(candidate)}
                                            </ul>
                                          )}
                                        </div>
                                        <div className="option-box">
                                          <ul className="option-list">
                                            <li>
                                              <button
                                                data-text="View Application"
                                                onClick={() => handleViewApplication(candidate.jobInfo.jobID, candidate.applicationID)}
                                              >
                                                <span className="la la-eye"></span>
                                              </button>
                                            </li>
                                            {candidate.status !== 'Approved' && (
                                              <li>
                                                <button
                                                  data-text="Approve Application"
                                                  onClick={() => handleApproveApplication(candidate.jobInfo.jobID, candidate.applicationID)}
                                                >
                                                  <span className="la la-check"></span>
                                                </button>
                                              </li>
                                            )}
                                            {candidate.status !== 'Rejected' && (
                                              <li>
                                                <button
                                                  data-text="Reject Application"
                                                  onClick={() => handleRejectClick(candidate)}
                                                >
                                                  <span className="la la-times-circle"></span>
                                                </button>
                                              </li>
                                            )}
                                            <li>
                                              <button
                                                data-text="Delete Application"
                                                onClick={() => handleDeleteApplication(candidate.applicationID)}
                                              >
                                                <span className="la la-trash"></span>
                                              </button>
                                            </li>
                                          </ul>
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>


                              {filteredCandidates.length > 0 && (
                                <Pagination
                                  currentPage={searchParams.PageIndex}
                                  totalPage={totalPage}
                                  onPageChange={handlePageChange}
                                  maxDisplayedPages={5}
                                />
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reject Candidate</h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setShowRejectModal(false)}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="rejectionReason">Reason for Rejection</label>
                  <textarea
                    id="rejectionReason"
                    className="form-control"
                    rows="4"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a reason for rejection (optional)"
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-secondary flex-grow-1 mr-2"
                  onClick={() => setShowRejectModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger flex-grow-1 ml-2"
                  onClick={handleConfirmReject}
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Index;
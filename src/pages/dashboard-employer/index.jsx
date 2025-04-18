import React, { useState, useEffect } from "react";
import axios from "axios";
import { getUserLoginData } from "@/helpers/decodeJwt";
import EmployerDashboardCharts from "../dashboard-employer/EmployerDashboardCharts";
import { 
  fetchJobsForManagement, 
  fetchCandidatesForJob,
  fetchJobsByUserId,
  fetchCandidateDetail
} from "../../services/jobServices";
import { 
  fetchUserNotifications, 
  markNotificationAsRead 
} from "../../services/notificationServices";
import { getCVById } from "../../services/cvServices";

// Import API URL from env if available, or use a fallback
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || "/api";

export const Index = () => {
  const [userDataLogin, setUserDataLogin] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    postedJobs: 0,
    applications: 0,
    messages: 0,
    shortlist: 0,
    profileViews: 0
  });
  const [notifications, setNotifications] = useState([]);
  const [recentApplicants, setRecentApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Candidates and Jobs Management
  const [allCandidates, setAllCandidates] = useState([]);
  const [activeTab, setActiveTab] = useState("totals");
  const [userJobs, setUserJobs] = useState([]);
  const [jobsMap, setJobsMap] = useState({});
  const [selectedJobId, setSelectedJobId] = useState("all");
  const [candidateDetails, setCandidateDetails] = useState({});

  // Helper functions for UI elements
  const getBorderColor = (status) => {
    switch(status) {
      case "Approved": return "border-green-500";
      case "Rejected": return "border-red-500";
      case "Pending": return "border-yellow-500";
      default: return "border-gray-300";
    }
  };
  
  const getStatusClass = (status) => {
    switch(status) {
      case "Approved": return "bg-green-100 text-green-800";
      case "Rejected": return "bg-red-100 text-red-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  const getStatusText = (status) => {
    return status || "Pending";
  };

  // Utility function to safely get candidate information
  const getCandidateInfo = (candidate, field, defaultValue = "N/A") => {
    const candidateDetail = candidateDetails[candidate.applicationID] || {};
    
    // Special handling for fullName
    if (field === 'fullName') {
      // Check multiple possible sources for full name
      if (candidateDetail.firstName && candidateDetail.lastName) {
        return `${candidateDetail.lastName} ${candidateDetail.firstName}`;
      }
      
      if (candidateDetail.user?.firstName && candidateDetail.user?.lastName) {
        return `${candidateDetail.user.lastName} ${candidateDetail.user.firstName}`;
      }
      
      if (candidateDetail.cvData?.lastName && candidateDetail.cvData?.firstName) {
        return `${candidateDetail.cvData.lastName} ${candidateDetail.cvData.firstName}`;
      }
      
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

  // Render skills for a candidate
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

  // Existing helper functions from the previous implementation
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  // Tab change handler
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Notification handling
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(
        notifications.map((notification) =>
          notification.notificationID === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  // Unread message and notification counting
  const countMessages = (notifications) => {
    if (!notifications || !Array.isArray(notifications)) return 0;
    return notifications.filter(
      notification => notification.type === 'message' || notification.category === 'message'
    ).length;
  };
  
  const countUnreadNotifications = (notifications) => {
    if (!notifications || !Array.isArray(notifications)) return 0;
    return notifications.filter(notification => !notification.isRead).length;
  };

  // Candidate filtering logic
  const filteredCandidates = allCandidates.filter((candidate) => {
    let statusMatch = true;
    if (activeTab === "approved") statusMatch = candidate.status === "Approved";
    if (activeTab === "rejected") statusMatch = candidate.status === "Rejected";
    if (activeTab === "pending") statusMatch = candidate.status === "Pending";

    let jobMatch = true;
    if (selectedJobId !== "all") {
      jobMatch = candidate.jobInfo?.jobID.toString() === selectedJobId;
    }

    return statusMatch && jobMatch;
  });

  // Candidate status counts
  const totalCandidates = allCandidates.length;
  const approvedCandidates = allCandidates.filter(candidate => candidate.status === "Approved").length;
  const rejectedCandidates = allCandidates.filter(candidate => candidate.status === "Rejected").length;
  const pendingCandidates = allCandidates.filter(candidate => candidate.status === "Pending").length;

  // Main data fetching effect
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get user login data
        const user = getUserLoginData();
        if (!user) {
          console.warn("No user login data found");
          setLoading(false);
          return;
        }
        setUserDataLogin(user);
        
        // Fetch user's jobs
        const userJobsResponse = await fetchJobsByUserId(user.userID);
        setUserJobs(userJobsResponse);
        
        // Create job mapping
        const jobsMapping = userJobsResponse.reduce((map, job) => {
          map[job.jobID] = job;
          return map;
        }, {});
        setJobsMap(jobsMapping);
        
        // Fetch candidates for all jobs
        const allCandidatesArray = [];
        for (const job of userJobsResponse) {
          try {
            const candidates = await fetchCandidatesForJob(job.jobID);
            
            if (Array.isArray(candidates) && candidates.length > 0) {
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
        
        // Fetch notifications
        const notificationsResponse = await fetchUserNotifications();
        const notificationsArray = Array.isArray(notificationsResponse) 
          ? notificationsResponse 
          : [];
        setNotifications(notificationsArray);
        
        // Set dashboard stats (simplified for this example)
        setDashboardStats({
          postedJobs: userJobsResponse.length,
          applications: allCandidatesArray.length,
          messages: countMessages(notificationsArray),
          shortlist: countUnreadNotifications(notificationsArray),
          profileViews: 0
        });
        
        // Set recent applicants
        const recentApps = allCandidatesArray
          .slice(0, 4)
          .map(candidate => ({
            id: candidate.applicationID,
            name: getCandidateInfo(candidate, 'fullName'),
            position: candidate.jobInfo?.title || 'Unknown Position',
            location: getCandidateInfo(candidate, 'address', 'Not specified'),
            hourlyRate: candidate.expectedSalary || 0,
            skills: renderSkills(candidate) || [],
            image: getCandidateInfo(candidate, 'avatar') || "images/resource/default-candidate.png",
            status: candidate.status || "Pending",
            createdAt: candidate.createdAt || new Date()
          }));
        
        setRecentApplicants(recentApps);
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Loading and error states
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-4" role="alert">
        <h4 className="alert-heading">Error!</h4>
        <p>{error}</p>
        <hr />
        <p className="mb-0">Please check your network connection and try again.</p>
      </div>
    );
  }

  return (
    <section className="user-dashboard">
      <div className="dashboard-outer" style={{ padding: "10px 30px" }}>
        {/* Existing dashboard header and stats cards */}
        <div className="upper-title-box">
          <h3>Hi, {userDataLogin?.fullName || "User"}!</h3>
          <div className="text">Ready to jump back in?</div>
        </div>
        
        {/* Stats Cards */}
        <div className="row">
          <div className="ui-block col-xl-3 col-lg-6 col-md-6 col-sm-12">
            <div className="ui-item">
              <div className="left">
                <i className="icon flaticon-briefcase"></i>
              </div>
              <div className="right">
                <h4>{dashboardStats.postedJobs}</h4>
                <p>Posted Jobs</p>
              </div>
            </div>
          </div>
          <div className="ui-block col-xl-3 col-lg-6 col-md-6 col-sm-12">
            <div className="ui-item ui-red">
              <div className="left">
                <i className="icon la la-file-invoice"></i>
              </div>
              <div className="right">
                <h4>{dashboardStats.applications}</h4>
                <p>Applications</p>
              </div>
            </div>
          </div>
          <div className="ui-block col-xl-3 col-lg-6 col-md-6 col-sm-12">
            <div className="ui-item ui-yellow">
              <div className="left">
                <i className="icon la la-comment-o"></i>
              </div>
              <div className="right">
                <h4>{dashboardStats.messages}</h4>
                <p>Messages</p>
              </div>
            </div>
          </div>
          <div className="ui-block col-xl-3 col-lg-6 col-md-6 col-sm-12">
            <div className="ui-item ui-green">
              <div className="left">
                <i className="icon la la-bookmark-o"></i>
              </div>
              <div className="right">
                <h4>{dashboardStats.shortlist}</h4>
                <p>Unread Notifications</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <EmployerDashboardCharts />

        {/* Notifications and Applicants Section */}
        <div className="row">
          {/* Notifications Widget */}
          <div className="col-xl-6 col-lg-6 col-md-12">
            <div className="notification-widget ls-widget">
              <div className="widget-title">
                <h4>Notifications</h4>
              </div>
              <div className="widget-content">
                {notifications.length > 0 ? (
                  <ul className="notification-list">
                    {notifications.slice(0, 6).map(notification => (
                      <li 
                        key={notification.notificationID || Math.random().toString(36).substr(2, 9)} 
                        className={!notification.isRead ? "fw-bold bg-light" : ""}
                      >
                        <span className="icon flaticon-briefcase"></span>{" "}
                        <strong>{notification.sender || "System"}</strong> {notification.message || "New notification"}
                        
                        {!notification.isRead && (
                          <span className="new-badge ml-2">New</span>
                        )}
                        
                        <span className="time-ago ml-2">
                          {formatTimeAgo(notification.createdAt || new Date())}
                        </span>
                        
                        {!notification.isRead && (
                          <button 
                            className="btn btn-sm btn-outline-primary ml-2"
                            onClick={() => handleMarkAsRead(notification.notificationID)}
                          >
                            Mark Read
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center py-3">No notifications yet</p>
                )}
              </div>
            </div>
          </div>
          
          
        </div>

        {/* Applicants Section */}
        <div className="row">
          <div className="col-lg-12">
            <div className="ls-widget">
              <div className="tabs-box">
                <div className="widget-title">
                  <h4>All Applicants</h4>
                  
                  <div className="filters-container">
                    {/* Job Filtering Dropdown */}
                    <select 
                      className="chosen-select"
                      onChange={(e) => setSelectedJobId(e.target.value)}
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
                </div>

                <div className="widget-content">
                  <div className="tabs-box">
                    {/* Applicant Status Tabs */}
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

                    {/* Candidates List */}
                    <div className="tabs-content">
                      <div className="row">
                        {filteredCandidates.length === 0 ? (
                          <div className="col-12 text-center py-5">
                            <h5>No candidates found</h5>
                          </div>
                        ) : (
                          filteredCandidates.slice(0, 4).map((candidate) => (
                            <div 
                              className="candidate-block-three col-lg-6 col-md-12 col-sm-12" 
                              key={candidate.applicationID}
                            >
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
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    
                    {/* View All Applicants Link */}
                    <div className="all-applicants-list mt-4 text-center">
                      <a href="/employer/all-candidates" className="theme-btn btn-style-one">
                        View All Applicants
                      </a>
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
};

export default Index;
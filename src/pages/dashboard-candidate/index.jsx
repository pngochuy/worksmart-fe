import { getUserLoginData } from "@/helpers/decodeJwt";
import { useEffect, useState } from "react";
import { useNotifications } from "@/layouts/NotificationProvider";
import { fetchUserNotifications } from "@/services/notificationServices";
import { fetchAppliedJobs } from "@/services/jobServices";

export const Index = () => {
  const [userDataLogin, setUserDataLogin] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]); // State mới để lưu các job đã apply
  const [loading, setLoading] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true); // State loading cho jobs
  const [error, setError] = useState(null);
  const [jobError, setJobError] = useState(null);
  
  const { unreadCount } = useNotifications();

  useEffect(() => {
    const user = getUserLoginData();
    setUserDataLogin(user);
  }, []);

  useEffect(() => {
    loadNotifications();
    if (userDataLogin) {
      loadAppliedJobs();
    }
  }, [userDataLogin]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await fetchUserNotifications();
      setNotifications(data);
    } catch (err) {
      setError("Failed to load notifications");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAppliedJobs = async () => {
    try {
      setLoadingJobs(true);
      const userId = userDataLogin.userID;
      const data = await fetchAppliedJobs(userId);
      console.log("Job Data:", data);
      console.log("Job Data:", userId);
      setAppliedJobs(data);
    } catch (err) {
      setJobError("Failed to load applied jobs");
      console.error(err);
    } finally {
      setLoadingJobs(false);
    }
  }

  const formatSalary = (salary) => {
    if (!salary) return "Negotiable";
    return salary;
  };

  const getTimeAgo = (dateString) => {
    const postDate = new Date(dateString);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - postDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

   return (
    <>
      {/* Dashboard */}
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <h3>Hello, {userDataLogin?.fullName}!!</h3>
            <div className="text">Ready to jump back in?</div>
          </div>
          <div className="row">
            <div className="col-xl-3 col-lg-6 col-md-6 col-sm-12">
              <div className="ui-item">
                <div className="left">
                  <i className="icon flaticon-briefcase"></i>
                </div>
                <div className="right">
                  <h4>{appliedJobs.length || 0}</h4>
                  <p>Applied Jobs</p>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-lg-6 col-md-6 col-sm-12">
              <div className="ui-item ui-red">
                <div className="left">
                  <i className="icon la la-file-invoice"></i>
                </div>
                <div className="right">
                  <h4>{unreadCount}</h4>
                  <p>Job Alerts</p>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-lg-6 col-md-6 col-sm-12">
              <div className="ui-item ui-yellow">
                <div className="left">
                  <i className="icon la la-comment-o"></i>
                </div>
                <div className="right">
                  <h4>74</h4>
                  <p>Messages</p>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-lg-6 col-md-6 col-sm-12">
              <div className="ui-item ui-green">
                <div className="left">
                  <i className="icon la la-bookmark-o"></i>
                </div>
                <div className="right">
                  <h4>32</h4>
                  <p>Shortlist</p>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-7">
              {/* Graph widget */}
              <div className="graph-widget ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4>Your Profile Views</h4>
                    <div className="chosen-outer">
                      {/*Tabs Box*/}
                      <select className="chosen-select">
                        <option>Last 6 Months</option>
                        <option>Last 12 Months</option>
                        <option>Last 16 Months</option>
                        <option>Last 24 Months</option>
                        <option>Last 5 year</option>
                      </select>
                    </div>
                  </div>

                  <div className="widget-content">
                    <canvas id="chart" width="100" height="45"></canvas>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              {/* Notification Widget */}
              <div className="notification-widget ls-widget">
                <div className="widget-title">
                  <h4>Notifications</h4>
                </div>
                <div className="widget-content">
                  {loading ? (
                    <p>Loading notifications...</p>
                  ) : error ? (
                    <p>{error}</p>
                  ) : (
                    <ul className="notification-list">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <li 
                            key={notification.notificationID} 
                            className={notification.isRead ? "" : "success"}
                          >
                            <span className="icon flaticon-briefcase"></span>{" "}
                            <strong>{notification.title}</strong>{" "}
                            <span className="colored">{notification.message}</span>
                          </li>
                        ))
                      ) : (
                        <li>No notifications available</li>
                      )}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-12">
              {/* applicants Widget */}
              <div className="applicants-widget ls-widget">
                <div className="widget-title">
                  <h4>Jobs Applied Recently</h4>
                </div>
                <div className="widget-content">
                  <div className="row">
                    {loadingJobs ? (
                      <div className="col-12 text-center py-4">
                        <p>Loading applied jobs...</p>
                      </div>
                    ) : jobError ? (
                      <div className="col-12 text-center py-4">
                        <p>{jobError}</p>
                      </div>
                    ) : appliedJobs.length > 0 ? (
                      appliedJobs.map((job) => (
                        <div key={job.jobID} className="job-block col-lg-6 col-md-12 col-sm-12">
                          <div className="inner-box">
                            <div className="content">
                              <span className="company-logo">
                                <img
                                  src={job.avatar || "https://via.placeholder.com/80"}
                                  alt={job.companyName}
                                />
                              </span>
                              <h4>
                                <a href={`/job-list/${job.jobID}`}>{job.title}</a>
                              </h4>
                              <ul className="job-info">
                                <li>
                                  <span className="icon flaticon-briefcase"></span>{" "}
                                  {job.companyName}
                                </li>
                                <li>
                                  <span className="icon flaticon-map-locator"></span>{" "}
                                  {job.location}
                                </li>
                                <li>
                                  <span className="icon flaticon-clock-3"></span>{" "}
                                  {getTimeAgo(job.createdAt)}
                                </li>
                                <li>
                                  <span className="icon flaticon-money"></span>{" "}
                                  {formatSalary(job.salary)}
                                </li>
                              </ul>
                              <ul className="job-other-info">
                                <li className="time">{job.workType}</li>
                                {job.level && <li className="privacy">{job.level}</li>}
                                {job.priority && <li className="required">Urgent</li>}
                              </ul>
                              <button className="bookmark-btn">
                                <span className="flaticon-bookmark"></span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-12 text-center py-4">
                        <p>You haven't applied to any jobs yet.</p>
                        <a href="/job-list" className="btn btn-primary mt-3">
                          Browse Jobs
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* End Dashboard */}
    </>
  );
};

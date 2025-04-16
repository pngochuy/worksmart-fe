import { getUserLoginData } from "@/helpers/decodeJwt";
import { useEffect, useState } from "react";
import { useNotifications } from "@/layouts/NotificationProvider";
import { fetchUserNotifications } from "@/services/notificationServices";
import { fetchAppliedJobs } from "@/services/jobServices";
import { Clock, FileEdit, Heart, MoveUpRight, Search, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export const index = () => {
  const [userDataLogin, setUserDataLogin] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [jobError, setJobError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const user = getUserLoginData();
    setUserDataLogin(user);
  }, []);

  useEffect(() => {
    if (userDataLogin) {
      loadAppliedJobs();
    }
  }, [userDataLogin]);

  const handleRefresh = () => {
    loadAppliedJobs(); // Tải lại dữ liệu giao dịch
  }
  // Filter jobs whenever search term or applied jobs change
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredJobs(appliedJobs);
    } else {
      const filtered = appliedJobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log("Search:", filtered);
      setFilteredJobs(filtered);
    }
  }, [searchTerm, appliedJobs]);

  const loadAppliedJobs = async () => {
    try {
      setLoadingJobs(true);
      const userId = userDataLogin.userID;
      const data = await fetchAppliedJobs(userId);
      setAppliedJobs(data);
      setFilteredJobs(data); // Initialize filtered jobs with all jobs
    } catch (err) {
      setJobError("Failed to load applied jobs");
      console.error(err);
    } finally {
      setLoadingJobs(false);
    }
  };

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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <>
      {/* Dashboard */}
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <h3>Applied Jobs</h3>
            <div className="text">Ready to jump back in?</div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              {/* Ls widget */}
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4>My Applied Jobs</h4>
                    {!loadingJobs && filteredJobs.length > 0 && (
                      <Button
                        className="h-8 px-2 lg:px-3"
                        variant="outline"
                        disabled={loadingJobs}
                        onClick={handleRefresh}
                      >
                        <RefreshCcw className={`h-4 w-4 ${loadingJobs ? 'animate-spin' : ''}`} />
                        <span className="ml-1 hidden sm:inline"></span>
                      </Button>
                    )}
                  </div>

                  {/* Search box */}
                  <div className="search-box-outer w-full border border-gray-300 rounded-md p-3 mb-4 bg-white shadow-sm">
                    <div className="relative w-full">
                      <input
                        type="text"
                        placeholder="Search by title..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="form-control w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="widget-content">
                    <div className="table-outer">
                      <table className="row">
                        {loadingJobs ? (
                          <div className="col-12 text-center py-4">
                            <p>Loading applied jobs...</p>
                          </div>
                        ) : jobError ? (
                          <div className="col-12 text-center py-4">
                            <p>{jobError}</p>
                          </div>
                        ) : filteredJobs.length > 0 ? (
                          filteredJobs.map((job) => (
                            <div key={job.jobID} className="job-block col-lg-12 col-md-12 col-sm-12">
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
                                  <button className="bookmark-btn" style={{ right: 70 }}>
                                    <Button
                                      variant="outline"
                                      className="text-blue-600 border-blue-200 hover:bg-blue-100 hover:text-blue-700 flex items-center gap-2 cursor-default"
                                    >
                                      <Heart className="h-4 w-4 text-blue-500" />
                                      <span className="hidden sm:inline text-blue-500">
                                        Save
                                      </span>
                                    </Button>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="col-12 text-center py-4">
                            {searchTerm ? (
                              <p>No jobs found matching "{searchTerm}".</p>
                            ) : (
                              <p>You haven't applied to any jobs yet.</p>
                            )}
                            {!searchTerm && (
                              <a href="/job-list" className="btn btn-primary mt-3">
                                Browse Jobs
                              </a>
                            )}
                          </div>
                        )}
                      </table>
                    </div>
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
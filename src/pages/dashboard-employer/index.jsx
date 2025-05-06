import { getUserLoginData } from "@/helpers/decodeJwt";
import { useEffect, useState } from "react";
import { Clock, MapPin, Briefcase, DollarSign, Users, Calendar, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchJobsByUserId } from "@/services/jobServices";
import { getApplicationByUserOwnJob } from "@/services/candidateServices";
import { useNotifications } from "@/layouts/NotificationProvider";
import { fetchUserNotifications } from "@/services/notificationServices";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const Index = () => {
  const [userDataLogin, setUserDataLogin] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [isRefreshingJobs, setIsRefreshingJobs] = useState(false);
  const [isRefreshingApplications, setIsRefreshingApplications] = useState(false);
  const [isRefreshingNotifications, setIsRefreshingNotifications] = useState(false);
  const [isRefreshingChart, setIsRefreshingChart] = useState(false);
  const [isRefreshingRow1, setIsRefreshingRow1] = useState(false);
  const [isRefreshingRow2, setIsRefreshingRow2] = useState(false);
  const [isRefreshingRow3, setIsRefreshingRow3] = useState(false);
  const [error, setError] = useState(null);
  const [notificationError, setNotificationError] = useState(null);
  const [applicationError, setApplicationError] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [chartPeriod, setChartPeriod] = useState('30');
  const [chartGroupBy, setChartGroupBy] = useState('day');

  const { unreadCount, refreshNotifications } = useNotifications();

  useEffect(() => {
    const user = getUserLoginData();
    setUserDataLogin(user);
    loadNotifications();

    if (user && user.userID) {
      loadJobs(user.userID);
      loadApplications(user.userID);
    }
  }, []);

  // Add effect to process job data for chart when jobs change or filters change
  useEffect(() => {
    if (jobs.length > 0) {
      processJobData(jobs, chartPeriod, chartGroupBy);
    } else {
      generateEmptyData(chartPeriod, chartGroupBy);
    }
  }, [jobs, chartPeriod, chartGroupBy]);

  const loadJobs = async (userId) => {
    try {
      setLoading(true);
      const data = await fetchJobsByUserId(userId);
      setJobs(data);
    } catch (error) {
      setError("Failed to fetch jobs");
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async (userId) => {
    try {
      setLoadingApplications(true);
      const data = await getApplicationByUserOwnJob(userId);
      setApplications(data);
    } catch (error) {
      setApplicationError("Failed to fetch applications");
      console.error("Failed to fetch applications:", error);
    } finally {
      setLoadingApplications(false);
    }
  };

  const loadNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const data = await fetchUserNotifications();
      setNotifications(data);
      refreshNotifications();
    } catch (err) {
      setNotificationError("Failed to load notifications");
      console.error(err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Individual refresh handlers for each data type
  const handleRefreshJobs = async () => {
    if (!userDataLogin) return;

    setIsRefreshingJobs(true);
    try {
      const data = await fetchJobsByUserId(userDataLogin.userID);
      setJobs(data);
      setError(null);
    } catch (error) {
      setError("Failed to refresh jobs");
      console.error("Failed to refresh jobs:", error);
    } finally {
      setIsRefreshingJobs(false);
    }
  };

  const handleRefreshApplications = async () => {
    if (!userDataLogin) return;

    setIsRefreshingApplications(true);
    try {
      const data = await getApplicationByUserOwnJob(userDataLogin.userID);
      setApplications(data);
      setApplicationError(null);
    } catch (error) {
      setApplicationError("Failed to refresh applications");
      console.error("Failed to refresh applications:", error);
    } finally {
      setIsRefreshingApplications(false);
    }
  };

  const handleRefreshNotifications = async () => {
    setIsRefreshingNotifications(true);
    try {
      const data = await fetchUserNotifications();
      setNotifications(data);
      setNotificationError(null);
    } catch (err) {
      setNotificationError("Failed to refresh notifications");
      console.error("Failed to refresh notifications:", err);
    } finally {
      setIsRefreshingNotifications(false);
    }
  };

  const handleRefreshChart = async () => {
    setIsRefreshingChart(true);
    try {
      // Refresh jobs data to update the chart
      if (userDataLogin) {
        const data = await fetchJobsByUserId(userDataLogin.userID);
        setJobs(data);
        // Chart will update automatically via useEffect when jobs changes
      }
    } catch (err) {
      console.error("Failed to refresh chart data:", err);
    } finally {
      setIsRefreshingChart(false);
    }
  };

  // Row 1 refresh - Jobs, Applications, Notifications summary
  const handleRefreshRow1 = async () => {
    if (!userDataLogin) return;

    setIsRefreshingRow1(true);

    try {
      // Execute all refresh operations in parallel
      await Promise.all([
        fetchJobsByUserId(userDataLogin.userID).then(data => {
          setJobs(data);
          setError(null);
        }).catch(err => {
          setError("Failed to refresh jobs");
          console.error(err);
        }),

        getApplicationByUserOwnJob(userDataLogin.userID).then(data => {
          setApplications(data);
          setApplicationError(null);
        }).catch(err => {
          setApplicationError("Failed to refresh applications");
          console.error(err);
        }),

        fetchUserNotifications().then(data => {
          setNotifications(data);
          refreshNotifications();
          setNotificationError(null);
        }).catch(err => {
          setNotificationError("Failed to refresh notifications");
          console.error(err);
        }),
      ]);
    } finally {
      setIsRefreshingRow1(false);
    }
  };

  // Row 2 refresh - Charts and Notifications
  const handleRefreshRow2 = async () => {
    if (!userDataLogin) return;

    setIsRefreshingRow2(true);
    setIsRefreshingChart(true);
    setIsRefreshingNotifications(true);

    try {
      // Execute both refresh operations in parallel
      await Promise.all([
        fetchJobsByUserId(userDataLogin.userID).then(data => {
          setJobs(data);
          setError(null);
          // Chart will update automatically via useEffect
        }).catch(err => {
          setError("Failed to refresh chart data");
          console.error(err);
        }),

        fetchUserNotifications().then(data => {
          setNotifications(data);
          refreshNotifications();
          setNotificationError(null);
        }).catch(err => {
          setNotificationError("Failed to refresh notifications");
          console.error(err);
        }),
      ]);
    } finally {
      setIsRefreshingRow2(false);
      setIsRefreshingChart(false);
      setIsRefreshingNotifications(false);
    }
  };

  // Row 3 refresh - Job Listings
  const handleRefreshRow3 = async () => {
    if (!userDataLogin) return;

    setIsRefreshingRow3(true);
    setIsRefreshingJobs(true);

    try {
      const data = await fetchJobsByUserId(userDataLogin.userID);
      setJobs(data);
      setError(null);
    } catch (err) {
      setError("Failed to refresh job listings");
      console.error(err);
    } finally {
      setIsRefreshingRow3(false);
      setIsRefreshingJobs(false);
    }
  };

  // Process job data for the chart
  const processJobData = (jobs, period, groupBy) => {
    const periodDays = parseInt(period);
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - periodDays);

    const dateRange = [];
    const dataPoints = {};

    // Format jobs by creation date
    const formattedJobs = jobs.map(job => ({
      ...job,
      date: new Date(job.createdAt)
    })).filter(job => job.date >= startDate && job.date <= now);

    // Group by the selected timeframe
    switch (groupBy) {
      case 'day':
        // Create date range - daily
        for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
          const dateKey = formatDate(d);
          dataPoints[dateKey] = 0;
          dateRange.push({
            date: new Date(d),
            key: dateKey,
            name: formatChartLabel(d, 'day'),
            jobsPosted: 0
          });
        }

        // Count jobs posted per day
        formattedJobs.forEach(job => {
          const dateKey = formatDate(job.date);
          if (dataPoints[dateKey] !== undefined) {
            dataPoints[dateKey]++;
          }
        });
        break;

      case 'month':
        // Create date range - monthly
        const monthMap = {};

        for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
          const year = d.getFullYear();
          const month = d.getMonth();
          const monthKey = `${year}-${month + 1}`;

          if (monthMap[monthKey] === undefined) {
            monthMap[monthKey] = true;

            dateRange.push({
              date: new Date(year, month, 1),
              key: monthKey,
              name: formatChartLabel(d, 'month'),
              jobsPosted: 0
            });

            dataPoints[monthKey] = 0;
          }
        }

        // Count jobs posted per month
        formattedJobs.forEach(job => {
          const year = job.date.getFullYear();
          const month = job.date.getMonth();
          const monthKey = `${year}-${month + 1}`;

          if (dataPoints[monthKey] !== undefined) {
            dataPoints[monthKey]++;
          }
        });
        break;

      case 'year':
        // Create date range - yearly
        const yearMap = {};

        for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
          const year = d.getFullYear();
          const yearKey = `${year}`;

          if (yearMap[yearKey] === undefined) {
            yearMap[yearKey] = true;

            dateRange.push({
              date: new Date(year, 0, 1),
              key: yearKey,
              name: formatChartLabel(d, 'year'),
              jobsPosted: 0
            });

            dataPoints[yearKey] = 0;
          }
        }

        // Count jobs posted per year
        formattedJobs.forEach(job => {
          const year = job.date.getFullYear();
          const yearKey = `${year}`;

          if (dataPoints[yearKey] !== undefined) {
            dataPoints[yearKey]++;
          }
        });
        break;
    }

    // Apply the counts to dateRange
    dateRange.forEach(item => {
      item.jobsPosted = dataPoints[item.key] || 0;
    });

    // Sort by date
    dateRange.sort((a, b) => a.date - b.date);

    // Format for chart
    setChartData(dateRange.map(item => ({
      name: item.name,
      jobsPosted: item.jobsPosted,
      // Add formatted date for tooltip
      formattedDate: formatFullDate(item.date)
    })));
  };

  // Generate empty data when no jobs
  const generateEmptyData = (period, groupBy) => {
    const periodDays = parseInt(period);
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - periodDays);

    const emptyData = [];

    switch (groupBy) {
      case 'day':
        // Create daily empty data
        for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
          emptyData.push({
            name: formatChartLabel(d, 'day'),
            jobsPosted: 0,
            formattedDate: formatFullDate(d)
          });
        }
        break;

      case 'month':
        // Create monthly empty data
        const monthMap = {};

        for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
          const monthKey = d.toLocaleString('default', { month: 'short' });

          if (!monthMap[monthKey]) {
            monthMap[monthKey] = true;
            emptyData.push({
              name: monthKey,
              jobsPosted: 0,
              formattedDate: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            });
          }
        }
        break;

      case 'year':
        // Create yearly empty data
        const yearMap = {};

        for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
          const yearKey = d.getFullYear().toString();

          if (!yearMap[yearKey]) {
            yearMap[yearKey] = true;
            emptyData.push({
              name: yearKey,
              jobsPosted: 0,
              formattedDate: d.getFullYear().toString()
            });
          }
        }
        break;
    }

    setChartData(emptyData);
  };

  // Helper functions for date formatting
  const formatDate = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const formatFullDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatChartLabel = (date, groupBy) => {
    switch (groupBy) {
      case 'day':
        return `${date.getDate()}/${date.getMonth() + 1}`;
      case 'month':
        return date.toLocaleString('en-US', { month: 'short' });
      case 'year':
        return date.getFullYear().toString();
      default:
        return formatDate(date);
    }
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length && payload[0].payload.jobsPosted > 0) {
      return (
        <div className="custom-tooltip" style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '5px'
        }}>
          <p><strong>{payload[0].payload.formattedDate}</strong></p>
          <p>Jobs Posted: <strong>{payload[0].value}</strong></p>
        </div>
      );
    }
    return null;
  };

  const handleChartPeriodChange = (e) => {
    setChartPeriod(e.target.value);
  };

  const handleChartGroupByChange = (e) => {
    setChartGroupBy(e.target.value);
  };

  // Function to get status text
  const getStatusText = (statusCode) => {
    switch (statusCode) {
      case 1:
        return "Draft";
      case 2:
        return "Pending";
      case 3:
        return "Active";
      case 4:
        return "Paused";
      case 5:
        return "Closed";
      default:
        return "Unknown";
    }
  };

  // Function to get status class
  const getStatusClass = (statusCode) => {
    switch (statusCode) {
      case 1:
        return "bg-gray-200 text-gray-800"; // Draft
      case 2:
        return "bg-yellow-100 text-yellow-800"; // Pending
      case 3:
        return "bg-green-100 text-green-800"; // Active
      case 4:
        return "bg-blue-100 text-blue-800"; // Paused
      case 5:
        return "bg-red-100 text-red-800"; // Closed
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Function to get border color based on status
  const getBorderColor = (statusCode) => {
    switch (statusCode) {
      case 1:
        return "border-gray-200"; // Draft
      case 2:
        return "border-yellow-200"; // Pending
      case 3:
        return "border-green-200"; // Active
      case 4:
        return "border-blue-200"; // Paused
      case 5:
        return "border-red-200"; // Closed
      default:
        return "border-gray-200";
    }
  };

  // Get time ago
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
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <h3>Howdy, {userDataLogin?.fullName}!</h3>
            <div className="text">Ready to jump back in?</div>
          </div>

          {/* First Row - Stats Summary */}
          <div className="row">
            <div className="col-12">
              <div className="stats-container bg-white p-8 rounded-lg d-flex justify-content-between align-items-center position-relative">

                {/* Posted Jobs */}
                <div className="d-flex align-items-center flex-grow-1 justify-content-start">
                  <div className="stat-inner-box d-flex align-items-center border rounded p-3" style={{ width: "280px", backgroundColor: "#f8f8f8" }}>
                    <div className="icon-wrapper mr-3">
                      <div className="bg-blue-100 p-3 rounded-lg d-flex justify-content-center align-items-center" style={{ width: "60px", height: "60px" }}>
                        <i className="icon flaticon-briefcase text-blue-600 fs-3"></i>
                      </div>
                    </div>
                    <div>
                      <h3 className="fs-2 fw-bold">{jobs?.length || 0}</h3>
                      <p className="text-muted mb-0">Posted Jobs</p>
                    </div>
                  </div>
                </div>

                {/* Application */}
                <div className="d-flex align-items-center flex-grow-1 justify-content-center">
                  <div className="stat-inner-box d-flex align-items-center border rounded p-3" style={{ width: "280px", backgroundColor: "#f8f8f8" }}>
                    <div className="icon-wrapper mr-3">
                      <div className="bg-red-100 p-3 rounded-lg d-flex justify-content-center align-items-center" style={{ width: "60px", height: "60px" }}>
                        <i className="la la-file-invoice text-red-600 fs-3"></i>
                      </div>
                    </div>
                    <div>
                      <h3 className="fs-2 fw-bold">{applications?.totalApplications || 0}</h3>
                      <p className="text-muted mb-0">Applications</p>
                    </div>
                  </div>
                </div>

                {/* Notifications */}
                <div className="d-flex align-items-center flex-grow-1 justify-content-end">
                  <div className="stat-inner-box d-flex align-items-center border rounded p-3" style={{ width: "280px", backgroundColor: "#f8f8f8" }}>
                    <div className="icon-wrapper mr-3">
                      <div className="bg-green-100 p-3 rounded-lg d-flex justify-content-center align-items-center" style={{ width: "60px", height: "60px" }}>
                        <i className="la la-bookmark-o text-green-600 fs-3"></i>
                      </div>
                    </div>
                    <div>
                      <h3 className="fs-2 fw-bold">{unreadCount}</h3>
                      <p className="text-muted mb-0">Notifications</p>
                    </div>
                  </div>
                </div>

                {/* Single refresh button positioned absolutely */}
                <Button
                  variant="ghost"
                  onClick={handleRefreshRow1}
                  disabled={isRefreshingRow1}
                  className="h-6 w-6 p-1 ml-2"
                  style={{ position: 'absolute', top: '8px', right: '8px' }}

                >
                  <RefreshCcw
                    className={`h-4 w-4 ${isRefreshingRow1
                      ? 'animate-spin'
                      : ''
                      }`}
                  />
                </Button>
              </div>
            </div>
          </div>

          {/* Second Row - Chart and Notifications */}
          <div className="row mt-4">
            <div className="col-lg-7">

            </div>

            <div className="col-xl-7 col-lg-12">
              {/* Graph widget */}
              <div className="graph-widget ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4>Your Job Posting Activity</h4>
                    <div className="d-flex align-items-center">
                      <div className="chosen-outer d-flex">
                        <select
                          className="chosen-select mr-2"
                          value={chartGroupBy}
                          onChange={handleChartGroupByChange}
                          style={{ marginRight: '10px' }}
                        >
                          <option value="day">Daily</option>
                          <option value="month">Monthly</option>
                          <option value="year">Yearly</option>
                        </select>

                        <select
                          className="chosen-select"
                          value={chartPeriod}
                          onChange={handleChartPeriodChange}
                        >
                          <option value="7">Last 7 Days</option>
                          <option value="14">Last 14 Days</option>
                          <option value="30">Last 30 Days</option>
                          <option value="90">Last 3 Months</option>
                          <option value="180">Last 6 Months</option>
                          <option value="365">Last 12 Months</option>
                        </select>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={handleRefreshChart}
                        disabled={isRefreshingChart}
                        className="h-6 w-6 p-1 ml-2"
                      >
                        <RefreshCcw className={`h-4 w-4 ${isRefreshingChart ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  </div>

                  <div className="widget-content">
                    {loading || isRefreshingChart ? (
                      <div className="d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
                        <p>Loading chart data...</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                          data={chartData}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 0,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 12 }}
                            interval={chartGroupBy === 'day' && chartData.length > 14 ? Math.floor(chartData.length / 7) : 0}
                          />
                          <YAxis allowDecimals={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="jobsPosted"
                            name="Jobs Posted"
                            stroke="#1967d2"
                            activeDot={{ r: 8 }}
                            strokeWidth={2}
                            dot={(props) => {
                              const { cx, cy, payload } = props;
                              if (payload.jobsPosted > 0) {
                                return (
                                  <circle
                                    cx={cx}
                                    cy={cy}
                                    r={4}
                                    fill="#1967d2"
                                    stroke="#fff"
                                    strokeWidth={2}
                                  />
                                );
                              }
                              return null;
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              {/* Notification Widget */}
              <div className="notification-widget ls-widget">
                <div className="widget-title">
                  <h4>Notifications</h4>
                  <Button
                    variant="ghost"
                    onClick={handleRefreshNotifications}
                    disabled={isRefreshingNotifications}
                    className="h-6 w-6 p-1 ml-2"
                    style={{ position: 'absolute', top: '8px', right: '8px' }}
                  >
                    <RefreshCcw className={`h-4 w-4 ${isRefreshingNotifications ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                <div className="widget-content">
                  {loading || isRefreshingNotifications ? (
                    <p>Loading notifications...</p>
                  ) : error ? (
                    <p>{error}</p>
                  ) : (
                    <div className="notification" style={{
                      maxHeight: '300px',
                    }}>
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
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Third Row - Job Listings */}
          <div className="row mt-4">
            <div className="col-lg-12">
              <div className="ls-widget">
                <div className="widget-title">
                  <h4>Your Job Listings</h4>
                  <Button
                    variant="ghost"
                    onClick={handleRefreshRow3}
                    disabled={isRefreshingRow3}
                    className="h-6 w-6 p-1 ml-2"
                    style={{ position: 'absolute', top: '8px', right: '8px' }}
                  >
                    <RefreshCcw className={`h-4 w-4 ${isRefreshingRow3 ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                <div className="widget-content">
                  {loading || isRefreshingRow3 ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="sr-only">Loading...</span>
                      </div>
                      <p className="mt-2">Loading your job listings...</p>
                    </div>
                  ) : error ? (
                    <div className="text-center py-5">
                      <p>{error}</p>
                    </div>
                  ) : jobs.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="empty-state">
                        <Briefcase size={48} className="text-gray-400 mx-auto mb-3" />
                        <h5>No Jobs Posted Yet</h5>
                        <p className="text-muted">Start creating job listings to attract the right candidates</p>
                        <a href="/employer/post-job" className="theme-btn btn-style-one mt-3">
                          Post a New Job
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="row">
                      {jobs.slice(0, 4).map((job) => (
                        <div key={job.jobID} className="job-block col-lg-6 col-md-12 col-sm-12 mb-4">
                          <div className={`inner-box border ${getBorderColor(job.status)} rounded hover:shadow-md transition-shadow duration-300`}>
                            <div className="content p-4">
                              <div className="d-flex justify-content-between mb-3">
                                <h4 className="job-title text-xl font-semibold">
                                  <a href={`/employer/job-detail/${job.jobID}`}>{job.title}</a>
                                </h4>
                                <span className={`status-badge px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(job.status)}`}>
                                  {getStatusText(job.status)}
                                </span>
                              </div>

                              <ul className="job-info flex flex-wrap gap-y-2 mb-3">
                                <li className="flex items-center w-full sm:w-1/2 text-gray-700">
                                  <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
                                  {job.categoryID}
                                </li>
                                <li className="flex items-center w-full sm:w-1/2 text-gray-700">
                                  <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                                  {job.location}
                                </li>
                                <li className="flex items-center w-full sm:w-1/2 text-gray-700">
                                  <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                                  {job.salary || "Negotiable"}
                                </li>
                                <li className="flex items-center w-full sm:w-1/2 text-gray-700">
                                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                                  {job.workType}
                                </li>
                                <li className="flex items-center w-full sm:w-1/2 text-gray-700">
                                  <Users className="h-4 w-4 mr-2 text-gray-500" />
                                  {job.numberOfRecruitment || 0} openings
                                </li>
                                <li className="flex items-center w-full sm:w-1/2 text-gray-700">
                                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                                  Posted {getTimeAgo(job.createdAt)}
                                </li>
                              </ul>

                              <div className="job-tags flex flex-wrap gap-2 mb-3">
                                {job.level && (
                                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                                    {job.level}
                                  </span>
                                )}
                                {typeof job.exp === 'number' && (
                                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                                    {job.exp} years exp
                                  </span>
                                )}
                                {job.education && (
                                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                                    {job.education}
                                  </span>
                                )}
                              </div>

                              <div className="job-actions flex justify-end mt-3 pt-3 border-t border-gray-100">
                                <a
                                  href="/employer/manage-jobs"
                                  className="text-blue-600 hover:text-blue-800 mr-4 text-sm"
                                >
                                  View Jobs
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
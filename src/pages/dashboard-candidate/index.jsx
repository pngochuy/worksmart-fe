import { getUserLoginData } from "@/helpers/decodeJwt";
import { useEffect, useState } from "react";
import { useNotifications } from "@/layouts/NotificationProvider";
import { fetchUserNotifications } from "@/services/notificationServices";
import { fetchAppliedJobs } from "@/services/jobServices";
import { getUserFavoriteJobsList } from "@/services/candidateServices";
import { Clock, FileEdit, Heart, MoveUpRight, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const Index = () => {
  const [userDataLogin, setUserDataLogin] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [favouriteJobs, setFavouriteJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingFavourites, setLoadingFavourites] = useState(true);
  const [isRefreshing1stNotifications, setIsRefreshing1stNotifications] = useState(false);
  const [isRefreshing2ndNotifications, setIsRefreshing2ndNotifications] = useState(false);
  const [isRefreshingJobs, setIsRefreshingJobs] = useState(false);
  const [isRefreshingFavourites, setIsRefreshingFavourites] = useState(false);
  const [isRefreshingChart, setIsRefreshingChart] = useState(false);
  const [error, setError] = useState(null);
  const [jobError, setJobError] = useState(null);
  const [favouriteJobError, setFavouriteJobError] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [chartPeriod, setChartPeriod] = useState('30');
  const [chartGroupBy, setChartGroupBy] = useState('day');
  const { unreadCount, refreshNotifications } = useNotifications();

  useEffect(() => {
    const user = getUserLoginData();
    setUserDataLogin(user);
  }, []);

  useEffect(() => {
    loadNotifications();
    if (userDataLogin) {
      loadAppliedJobs();
      loadFavouriteJobs();
    }
  }, [userDataLogin]);

  useEffect(() => {
    // Generate chart data whenever applied jobs change or filters change
    if (appliedJobs.length > 0) {
      processApplicationData(appliedJobs, chartPeriod, chartGroupBy);
    } else {
      generateEmptyData(chartPeriod, chartGroupBy);
    }
  }, [appliedJobs, chartPeriod, chartGroupBy]);

  // Handle refresh for notifications
  const handleRefresh1stNotifications = async () => {
    setIsRefreshing1stNotifications(true);
    try {
      const data = await fetchUserNotifications();
      setNotifications(data);
      refreshNotifications();
    } catch (err) {
      setError("Failed to load notifications");
      console.error(err);
    } finally {
      setIsRefreshing1stNotifications(false);
    }
  };

  // Handle refresh for notifications
  const handleRefresh2ndNotifications = async () => {
    setIsRefreshing2ndNotifications(true);
    try {
      const data = await fetchUserNotifications();
      setNotifications(data);
      refreshNotifications();
    } catch (err) {
      setError("Failed to load notifications");
      console.error(err);
    } finally {
      setIsRefreshing2ndNotifications(false);
    }
  };

  // Handle refresh for applied jobs
  const handleRefreshJobs = async () => {
    if (!userDataLogin) return;

    setIsRefreshingJobs(true);
    try {
      const userId = userDataLogin.userID;
      const data = await fetchAppliedJobs(userId);
      setAppliedJobs(data);
    } catch (err) {
      setJobError("Failed to load applied jobs");
      console.error(err);
    } finally {
      setIsRefreshingJobs(false);
    }
  };

  // Handle refresh for favourite jobs
  const handleRefreshFavourites = async () => {
    if (!userDataLogin) return;

    setIsRefreshingFavourites(true);
    try {
      const userId = userDataLogin.userID;
      const data = await getUserFavoriteJobsList(userId);
      setFavouriteJobs(data);
    } catch (err) {
      setFavouriteJobError("Failed to load favourite jobs");
      console.error(err);
    } finally {
      setIsRefreshingFavourites(false);
    }
  };

  // Handle refresh for chart data
  const handleRefreshChart = async () => {
    setIsRefreshingChart(true);
    try {
      // Refresh the jobs data first
      if (userDataLogin) {
        const userId = userDataLogin.userID;
        const data = await fetchAppliedJobs(userId);
        setAppliedJobs(data);
        // Chart will be updated automatically via useEffect when appliedJobs changes
      }
    } catch (err) {
      console.error("Failed to refresh chart data:", err);
    } finally {
      setIsRefreshingChart(false);
    }
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await fetchUserNotifications();
      setNotifications(data);
      refreshNotifications();
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
      setAppliedJobs(data);
    } catch (err) {
      setJobError("Failed to load applied jobs");
      console.error(err);
    } finally {
      setLoadingJobs(false);
    }
  };

  const loadFavouriteJobs = async () => {
    try {
      setLoadingFavourites(true);
      const userId = userDataLogin.userID;
      const data = await getUserFavoriteJobsList(userId);
      setFavouriteJobs(data);
    } catch (err) {
      setFavouriteJobError("Failed to load favourite jobs");
      console.error(err);
    } finally {
      setLoadingFavourites(false);
    }
  };

  // Process application data for the chart
  const processApplicationData = (jobs, period, groupBy) => {
    const periodDays = parseInt(period);
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - periodDays);

    const dateRange = [];
    const dataPoints = {};

    // Format applied jobs by date
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
            applications: 0
          });
        }

        // Count applications per day
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
              applications: 0
            });

            dataPoints[monthKey] = 0;
          }
        }

        // Count applications per month
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
              applications: 0
            });

            dataPoints[yearKey] = 0;
          }
        }

        // Count applications per year
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
      item.applications = dataPoints[item.key] || 0;
    });

    // Sort by date
    dateRange.sort((a, b) => a.date - b.date);

    // Format for chart
    setChartData(dateRange.map(item => ({
      name: item.name,
      applications: item.applications,
      // Add formatted date for tooltip
      formattedDate: formatFullDate(item.date)
    })));
  };

  // Helper function to get week number
  const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  // Helper function to format date
  const formatDate = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // Helper function to format full date for tooltip
  const formatFullDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper function to format chart labels
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
            applications: 0,
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
              applications: 0,
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
              applications: 0,
              formattedDate: d.getFullYear().toString()
            });
          }
        }
        break;
    }

    setChartData(emptyData);
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length && payload[0].payload.applications > 0) {
      return (
        <div className="custom-tooltip" style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '5px'
        }}>
          <p><strong>{payload[0].payload.formattedDate}</strong></p>
          <p>Applications: <strong>{payload[0].value}</strong></p>
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
            <div className="col-12">
              <div className="stats-container bg-white p-4 p-md-8 rounded-lg position-relative">
                {/* Change to flex-column on mobile */}
                <div className="d-flex flex-column flex-md-row gap-4">

                  {/* Applied Jobs */}
                  <div className="stat-box w-100">
                    <div className="stat-inner-box d-flex align-items-center border rounded p-3" style={{ backgroundColor: "#f8f8f8" }}>
                      <div className="icon-wrapper me-3">
                        <div className="bg-blue-100 p-3 rounded-lg d-flex justify-content-center align-items-center" style={{ width: "60px", height: "60px" }}>
                          <i className="icon flaticon-briefcase text-blue-600 fs-3"></i>
                        </div>
                      </div>
                      <div>
                        <h3 className="fs-2 fw-bold">{appliedJobs?.length || 0}</h3>
                        <p className="text-muted mb-0">Applied Jobs</p>
                      </div>
                    </div>
                  </div>

                  {/* Job Alerts */}
                  <div className="stat-box w-100">
                    <div className="stat-inner-box d-flex align-items-center border rounded p-3" style={{ backgroundColor: "#f8f8f8" }}>
                      <div className="icon-wrapper me-3">
                        <div className="bg-red-100 p-3 rounded-lg d-flex justify-content-center align-items-center" style={{ width: "60px", height: "60px" }}>
                          <i className="la la-file-invoice text-red-600 fs-3"></i>
                        </div>
                      </div>
                      <div>
                        <h3 className="fs-2 fw-bold">{unreadCount}</h3>
                        <p className="text-muted mb-0">Notifications</p>
                      </div>
                    </div>
                  </div>

                  {/* Favourite Jobs */}
                  <div className="stat-box w-100">
                    <div className="stat-inner-box d-flex align-items-center border rounded p-3" style={{ backgroundColor: "#f8f8f8" }}>
                      <div className="icon-wrapper me-3">
                        <div className="bg-green-100 p-3 rounded-lg d-flex justify-content-center align-items-center" style={{ width: "60px", height: "60px" }}>
                          <i className="la la-bookmark-o text-green-600 fs-3"></i>
                        </div>
                      </div>
                      <div>
                        <h3 className="fs-2 fw-bold">{favouriteJobs?.length || 0}</h3>
                        <p className="text-muted mb-0">Favourite Jobs</p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Refresh button */}
                <Button
                  variant="ghost"
                  onClick={() => {
                    handleRefreshJobs();
                    handleRefresh1stNotifications();
                    handleRefreshFavourites();
                  }}
                  disabled={isRefreshingJobs || isRefreshing1stNotifications || isRefreshingFavourites}
                  className="h-6 w-6 p-1 ml-2"
                  style={{ position: 'absolute', top: '8px', right: '8px' }}
                >
                  <RefreshCcw
                    className={`h-4 w-4 ${isRefreshingJobs || isRefreshing1stNotifications || isRefreshingFavourites
                      ? 'animate-spin'
                      : ''
                      }`}
                  />
                </Button>

              </div>
            </div>
          </div>

          <div className="row mt-4">
            <div className="col-lg-7">
              {/* Graph widget */}
              <div className="graph-widget ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4>Your Application Activity</h4>
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
                    {loadingJobs || isRefreshingChart ? (
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
                            dataKey="applications"
                            name="Applications"
                            stroke="#1967d2"
                            activeDot={{ r: 8 }}
                            strokeWidth={2}
                            dot={(props) => {
                              const { cx, cy, payload } = props;
                              if (payload.applications > 0) {
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
                    onClick={handleRefresh2ndNotifications}
                    disabled={isRefreshing2ndNotifications}
                    className="h-6 w-6 p-1 ml-2"
                    style={{ position: 'absolute', top: '8px', right: '8px' }}
                  >
                    <RefreshCcw className={`h-4 w-4 ${isRefreshing2ndNotifications ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                <div className="widget-content">
                  {loading || isRefreshing2ndNotifications ? (
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

          <div className="row mt-4">
            <div className="col-lg-12">
              {/* Applied Jobs Widget */}
              <div className="applicants-widget ls-widget">
                <div className="widget-title">
                  <h4>Jobs Applied Recently</h4>
                  <Button
                    variant="ghost"
                    onClick={handleRefreshJobs}
                    disabled={isRefreshingJobs}
                    className="h-6 w-6 p-1 ml-2"
                    style={{ position: 'absolute', top: '8px', right: '8px' }}
                  >
                    <RefreshCcw className={`h-4 w-4 ${isRefreshingJobs ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                <div className="widget-content">
                  <div className="row">
                    {loadingJobs || isRefreshingJobs ? (
                      <div className="col-12 text-center py-4">
                        <p>Loading applied jobs...</p>
                      </div>
                    ) : jobError ? (
                      <div className="col-12 text-center py-4">
                        <p>{jobError}</p>
                      </div>
                    ) : appliedJobs.length > 0 ? (
                      // Only show the first 4 jobs with slice(0, 4)
                      appliedJobs.slice(0, 4).map((job) => (
                        <div key={job.jobID} className="job-block col-lg-6 col-md-12 col-sm-12">
                          <div className="inner-box">
                            <div className="content">
                              <span className="company-logo">
                                <img
                                  src={job.companyAvatar || "https://via.placeholder.com/80"}
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
                              {/* <button className="bookmark-btn" style={{ right: 70 }}>
                                <Button
                                  variant="outline"
                                  className="text-blue-600 border-blue-200 hover:bg-blue-100 hover:text-blue-700 flex items-center gap-2 cursor-default"
                                >
                                  <Heart className="h-4 w-4 text-blue-500" />
                                  <span className="hidden sm:inline text-blue-500">
                                    Save
                                  </span>
                                </Button>
                              </button> */}
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

                  {/* Add "View All" button when there are more than 4 jobs */}
                  {appliedJobs.length > 4 && (
                    <div className="row mt-1" style={{ paddingBottom: 20 }}>
                      <div className="col-12 text-center">
                        <a href="/candidate/applied-jobs" className="theme-btn btn-style-one">
                          View All Applications
                        </a>
                      </div>
                    </div>
                  )}
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
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  getUserDashboard,
  getJobCategoryDashboard,
  getJobStatusDashboard,
  getJobLocationDashboard,
  getSubscriptionRevenueDashboard,
  getApplicationCountDashboard,
  getCountDashboard, // Add this import
} from "../../services/dashboardServices";

const AdminDashboardCharts = () => {
  const [userData, setUserData] = useState([]);
  const [jobData, setJobData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [engagementData, setEngagementData] = useState([]);
  const [countData, setCountData] = useState([]); // Add new state for count data
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // Fetch count dashboard data
        const countResponse = await getCountDashboard();
        setCountData(countResponse);

        // Fetch user data
        const userResponse = await getUserDashboard();
        setUserData(userResponse);

        // Rest of the existing code...
        const jobStatusResponse = await getJobStatusDashboard();
        setJobData(jobStatusResponse);

        // Fetch revenue data
        const revenueResponse = await getSubscriptionRevenueDashboard();
        // More flexible approach - dynamically extract subscription plans
        const formattedRevenueData = revenueResponse.map((item) => {
          // Start with month and total
          const dataPoint = {
            month: item.Month,
            total: item.Total,
          };

          // Dynamically add all subscription plans (except Month and Total)
          Object.entries(item).forEach(([key, value]) => {
            if (key !== "Month" && key !== "Total") {
              // Convert to camelCase and add to data point
              const planKey =
                key.replace(/\s+/g, "").charAt(0).toLowerCase() +
                key.replace(/\s+/g, "").slice(1);
              dataPoint[planKey] = value || 0;
            }
          });

          return dataPoint;
        });
        setRevenueData(formattedRevenueData);

        // Fetch job category data
        const categoryResponse = await getJobCategoryDashboard();
        // Transform category data to match pie chart requirements
        const formattedCategoryData = categoryResponse.map((item, index) => ({
          id: index + 1,
          label: item.category,
          value: item.percentage,
        }));
        setCategoryData(formattedCategoryData);

        // Fetch location data
        const locationResponse = await getJobLocationDashboard();
        setLocationData(locationResponse);

        // Fetch application data
        const applicationResponse = await getApplicationCountDashboard();

        // Create properly formatted engagement data
        const formattedEngagementData = applicationResponse.map((item) => {
          // Convert day names to shorter format
          const shortDay = item.day.substring(0, 3);
          return {
            day: shortDay,
            applications: item.applications,
          };
        });
        setEngagementData(formattedEngagementData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Define icons for count cards
  const getIconForTitle = (title) => {
    switch (title.toLowerCase()) {
      case "posted jobs":
        return "flaticon-briefcase";
      case "users":
        return "flaticon-user";
      case "messages":
        return "flaticon-chat";
      case "revenue":
        return "flaticon-money";
      default:
        return "flaticon-dashboard";
    }
  };

  // Define color for count cards
  const getColorForTitle = (title) => {
    switch (title.toLowerCase()) {
      case "posted jobs":
        return "#0088FE";
      case "users":
        return "#00C49F";
      case "messages":
        return "#FFBB28";
      case "revenue":
        return "#FF8042";
      default:
        return "#8884d8";
    }
  };

  // Format count values based on title
  const formatCountValue = (title, count) => {
    if (title.toLowerCase() === "revenue") {
      return `${count.toLocaleString()}`;
    }
    return count.toLocaleString();
  };

  // Colors
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#FF6384",
  ];

  if (loading) {
    return (
      <div className="admin-dashboard-charts text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-charts">
      {/* Count Statistics Cards */}
      <div className="row mb-4">
        {countData.map((item, index) => (
          <div key={index} className="col-xl-3 col-lg-6 col-md-6 mb-4">
            <div className="card h-100 dashboard-stat-card">
              <div
                className="card-body d-flex align-items-center p-4"
                style={{
                  borderLeft: `4px solid ${getColorForTitle(item.title)}`,
                }}
              >
                <div
                  className="stat-icon me-4"
                  style={{
                    backgroundColor: `${getColorForTitle(item.title)}20`,
                    padding: "15px",
                    borderRadius: "12px",
                  }}
                >
                  <i
                    className={getIconForTitle(item.title)}
                    style={{
                      fontSize: "24px",
                      color: getColorForTitle(item.title),
                    }}
                  />
                </div>
                <div className="stat-content">
                  <h3
                    className="stat-count mb-1"
                    style={{ fontSize: "1.75rem", fontWeight: "700" }}
                  >
                    {formatCountValue(item.title, item.count)}
                  </h3>
                  <p className="stat-title mb-0 text-secondary">{item.title}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Existing Charts */}
      <div className="row mb-4">
        <div className="col-xl-6 col-lg-12 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title">User Overview</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={userData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="jobSeekers"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                    name="Job Seekers"
                  />
                  <Area
                    type="monotone"
                    dataKey="employers"
                    stackId="1"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    name="Employers "
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Rest of the existing code... */}
        <div className="col-xl-6 col-lg-12 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title">Job Categories</h5>
            </div>
            <div className="card-body">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="label"
                      label={({ label, percent }) =>
                        `${label}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-5">
                  No category data available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rest of your charts... */}
      <div className="row mb-4">
        <div className="col-xl-6 col-lg-12 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title">
                Job Status by Month
              </h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={jobData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="posted"
                    fill="#8884d8"
                    name="Posted"
                  />
                  <Bar
                    dataKey="filled"
                    fill="#82ca9d"
                    name="Filled"
                  />
                  <Bar
                    dataKey="expired"
                    fill="#ffc658"
                    name="Expired"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-xl-6 col-lg-12 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title">
                Revenue by Subscription
              </h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Legend />
                  {/* Dynamically render lines for each subscription plan */}
                  {revenueData.length > 0 &&
                    Object.keys(revenueData[0])
                      .filter((key) => key !== "month" && key !== "total")
                      .map((key, index) => (
                        <Line
                          key={key}
                          type="monotone"
                          dataKey={key}
                          stroke={COLORS[index % COLORS.length]}
                          name={
                            key.charAt(0).toUpperCase() +
                            key.slice(1).replace(/([A-Z])/g, " $1")
                          }
                        />
                      ))}
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#ff7300"
                    strokeWidth={2}
                    name="Total Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-xl-5 col-lg-12 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title">
                Geographic Distribution 
              </h5>
            </div>
            <div className="card-body">
              {locationData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={locationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {locationData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-5">
                  No location data available
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-xl-7 col-lg-12 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title">
                Daily Engagement
              </h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="applications"
                    stroke="#82ca9d"
                    name="Applications"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardCharts;

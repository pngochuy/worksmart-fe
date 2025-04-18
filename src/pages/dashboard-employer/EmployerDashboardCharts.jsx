import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { getUserLoginData } from "@/helpers/decodeJwt";
import { fetchCandidatesForJob, fetchJobsByUserId } from "@/services/jobServices";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || "/api";

const EmployerDashboardCharts = ({ onUpdateStats }) => {
  const [timeFrame, setTimeFrame] = useState("6");
  const [applicationsData, setApplicationsData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  // Colors for charts
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

  // Fetch job category data
  const fetchJobCategoryData = async (userId) => {
    try {
      // API call to get job category data
      const response = await axios.get(`${BACKEND_API_URL}/api/Job/job-category-dashboard`);
      console.log("Job category response:", response.data);
      
      if (response.data && Array.isArray(response.data)) {
        // Check for different possible data structures and filter by userId
        let filteredData = [];
        
        // Try direct userId property first
        if (response.data[0] && response.data[0].userId !== undefined) {
          filteredData = response.data.filter(item => item.userId === userId);
        } 
        // Try job.userId nested structure
        else if (response.data[0] && response.data[0].job && response.data[0].job.userId !== undefined) {
          filteredData = response.data.filter(item => item.job && item.job.userId === userId);
        }
        // Try createdBy property (common in job listings)
        else if (response.data[0] && response.data[0].createdBy !== undefined) {
          filteredData = response.data.filter(item => item.createdBy === userId);
        }
        // If filtering didn't work, log it
        else {
          console.warn("Could not identify userId field in category data, displaying all data");
          filteredData = response.data;
        }
        
        console.log("Filtered job category data by userId:", filteredData);
        
        // Format data for chart display
        const formattedData = filteredData.length > 0 
          ? filteredData.map((item) => ({
              name: item.category || "Unknown", // Ensure there's always a value
              value: item.percentage || 0
            }))
          : [];
          
        setCategoryData(formattedData);
        console.log("Formatted job category data:", formattedData);
      } else {
        throw new Error("Invalid job category data format");
      }
      
      return response.data;
    } catch (error) {
      console.error("Error fetching job category data:", error);
      setCategoryData([]);
      return [];
    }
  };

  // Fetch applications data - IMPROVED VERSION
  const fetchApplicationsData = async (userId) => {
    try {
      console.log("Fetching applications data for userId:", userId);
      
      // First get all jobs for this user
      const userJobs = await fetchJobsByUserId(userId);
      console.log("User jobs:", userJobs);
      
      if (!userJobs || !Array.isArray(userJobs) || userJobs.length === 0) {
        console.warn("No jobs found for user:", userId);
        setApplicationsData([]);
        return [];
      }
      
      // Now fetch all candidates/applications for each job
      const allApplications = [];
      
      for (const job of userJobs) {
        try {
          const jobCandidates = await fetchCandidatesForJob(job.jobID);
          
          if (jobCandidates && Array.isArray(jobCandidates) && jobCandidates.length > 0) {
            // Add job info to each candidate/application
            const enrichedCandidates = jobCandidates.map(candidate => ({
              ...candidate,
              jobInfo: {
                jobID: job.jobID,
                title: job.title,
                company: job.companyName
              }
            }));
            
            allApplications.push(...enrichedCandidates);
          }
        } catch (error) {
          console.error(`Error fetching candidates for job ${job.jobID}:`, error);
        }
      }
      
      console.log("All applications fetched:", allApplications);
      
      // Group applications by month for chart visualization
      const applicationsCountByMonth = groupApplicationsByMonth(allApplications, parseInt(timeFrame));
      
      console.log("Grouped applications by month:", applicationsCountByMonth);
      setApplicationsData(applicationsCountByMonth);
      
      return applicationsCountByMonth;
    } catch (error) {
      console.error("Error fetching applications data:", error);
      setApplicationsData([]);
      return [];
    }
  };

  // Helper function to group applications by month
  const groupApplicationsByMonth = (applications, monthsLimit = 6) => {
    if (!applications || applications.length === 0) return [];
    
    // Create month abbreviations map
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Get the current date
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Initialize results array with last X months (empty counts)
    const results = [];
    for (let i = 0; i < monthsLimit; i++) {
      // Calculate month index (going backward from current month)
      const monthIndex = (currentMonth - i + 12) % 12;
      
      // Calculate year (in case we cross year boundary)
      const yearOffset = Math.floor((currentMonth - i) / 12);
      const year = currentYear + yearOffset;
      
      results.unshift({
        month: monthNames[monthIndex],
        year: year,
        applications: 0,
        // Add full date for proper sorting
        fullDate: new Date(year, monthIndex, 1)
      });
    }
    
    // Count applications for each month
    applications.forEach(application => {
      if (!application.createdAt) return;
      
      const appDate = new Date(application.createdAt);
      const appMonth = appDate.getMonth();
      const appYear = appDate.getFullYear();
      
      // Find matching month in results
      const matchingMonthIndex = results.findIndex(item => 
        item.month === monthNames[appMonth] && item.year === appYear
      );
      
      if (matchingMonthIndex !== -1) {
        results[matchingMonthIndex].applications++;
      }
    });
    
    // Sort by date
    results.sort((a, b) => a.fullDate - b.fullDate);
    
    // Remove full date property before returning (not needed for chart)
    return results.map(({ month, applications }) => ({ month, applications }));
  };

  // Fetch all dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const user = getUserLoginData();
      
      if (!user || !user.userID) {
        throw new Error("User ID not found");
      }
      
      setUserId(user.userID);
      
      // Fetch job categories data with userId
      await fetchJobCategoryData(user.userID);
      
      // Fetch application data with userId - using the improved function
      const applications = await fetchApplicationsData(user.userID);
      
      // Calculate total applications for updating stats if needed
      const totalApplications = applications.reduce((sum, item) => sum + item.applications, 0);
      
      // Pass total applications to parent component if needed
      if (onUpdateStats) {
        onUpdateStats('applications', totalApplications);
      }
      
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Call API when component mounts and when timeFrame changes
  useEffect(() => {
    loadDashboardData();
  }, [timeFrame]);

  // Handle time frame change
  const handleTimeFrameChange = (e) => {
    setTimeFrame(e.target.value);
  };

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

  return (
    <div className="employer-dashboard-charts">
      {/* Applications Chart Only */}
      <div className="row">
        <div className="col-xl-12 col-lg-12">
          <div className="graph-widget ls-widget">
            <div className="tabs-box">
              <div className="widget-title">
                <h4>Applications Received</h4>
                <div className="chosen-outer">
                  <select 
                    className="chosen-select"
                    value={timeFrame}
                    onChange={handleTimeFrameChange}
                  >
                    <option value="6">Last 6 Months</option>
                    <option value="12">Last 12 Months</option>
                    <option value="16">Last 16 Months</option>
                    <option value="24">Last 24 Months</option>
                    <option value="60">Last 5 Years</option>
                  </select>
                </div>
              </div>
              <div className="widget-content">
                {applicationsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart
                      data={applicationsData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="applications"
                        stroke="#82ca9d"
                        fill="#82ca9d"
                        name="Applications"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-5">
                    <p>No application data available for the selected time period</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Job Categories Chart Only */}
      <div className="row mt-4">
        <div className="col-xl-12 col-lg-12">
          <div className="graph-widget ls-widget">
            <div className="tabs-box">
              <div className="widget-title">
                <h4>Job Categories</h4>
              </div>
              <div className="widget-content">
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
                        nameKey="name"
                        label={({ name, percent }) => 
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {categoryData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-5">
                    <p>No category data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboardCharts;
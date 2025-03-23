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

const AdminDashboardCharts = () => {
  // Mock data - in real application, this data will be fetched from API
  // Dữ liệu mẫu - trong ứng dụng thực tế, dữ liệu này sẽ được lấy từ API
  const [userData, setUserData] = useState([
    { month: "Jan", employers: 45, jobSeekers: 120, total: 165 },
    { month: "Feb", employers: 50, jobSeekers: 140, total: 190 },
    { month: "Mar", employers: 60, jobSeekers: 160, total: 220 },
    { month: "Apr", employers: 70, jobSeekers: 190, total: 260 },
    { month: "May", employers: 80, jobSeekers: 220, total: 300 },
    { month: "Jun", employers: 90, jobSeekers: 240, total: 330 },
    { month: "Jul", employers: 0, jobSeekers: 0, total: 0 },
  ]);

  const [jobData, setJobData] = useState([
    { month: "Jan", posted: 80, filled: 45, expired: 15 },
    { month: "Feb", posted: 95, filled: 60, expired: 20 },
    { month: "Mar", posted: 110, filled: 70, expired: 25 },
    { month: "Apr", posted: 120, filled: 80, expired: 15 },
    { month: "May", posted: 140, filled: 90, expired: 30 },
    { month: "Jun", posted: 160, filled: 100, expired: 35 },
    { month: "Jul", posted: 0, filled: 0, expired: 0 },
  ]);

  const [revenueData, setRevenueData] = useState([
    { month: "Jan", premium: 4500, standard: 3200, basic: 1800, total: 9500 },
    { month: "Feb", premium: 5200, standard: 3800, basic: 2100, total: 11100 },
    { month: "Mar", premium: 6100, standard: 4200, basic: 2400, total: 12700 },
    { month: "Apr", premium: 7000, standard: 4600, basic: 2700, total: 14300 },
    { month: "May", premium: 7800, standard: 5100, basic: 3000, total: 15900 },
    { month: "Jun", premium: 8500, standard: 5600, basic: 3300, total: 17400 },
    { month: "Jul", premium: 0, standard: 0, basic: 0, total: 0 },
  ]);

  // Using the provided categories system data
  // Sử dụng dữ liệu categories từ hệ thống của bạn
  const [categoryData, setCategoryData] = useState([
    { id: 1, label: "Information Technology", value: 35 },
    { id: 2, label: "Design", value: 15 },
    { id: 3, label: "Marketing", value: 20 },
    { id: 4, label: "Finance", value: 7 },
    { id: 5, label: "Sales", value: 10 },
    { id: 6, label: "Customer Service", value: 8 },
    { id: 7, label: "Education", value: 5 },
    
  ]);

  const [locationData, setLocationData] = useState([
    { name: "Ho Chi Minh City", value: 40 },
    { name: "Hanoi", value: 30 },
    { name: "Da Nang", value: 15 },
    { name: "Others", value: 15 },
  ]);

  const [engagementData, setEngagementData] = useState([
    { day: "Mon", applications: 120, views: 450 },
    { day: "Tue", applications: 140, views: 520 },
    { day: "Wed", applications: 160, views: 580 },
    { day: "Thu", applications: 180, views: 620 },
    { day: "Fri", applications: 200, views: 700 },
    { day: "Sat", applications: 150, views: 500 },
    { day: "Sun", applications: 100, views: 400 },
  ]);

  // Colors
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
    "#ffc658",
  ];

  return (
    <div className="admin-dashboard-charts">
      <div className="row mb-4">
        <div className="col-xl-6 col-lg-12 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title">
                User Overview (Tổng quan người dùng)
              </h5>
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
                    name="Job Seekers (Người tìm việc)"
                  />
                  <Area
                    type="monotone"
                    dataKey="employers"
                    stackId="1"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    name="Employers (Nhà tuyển dụng)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-xl-6 col-lg-12 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title">
                Job Categories (Phân loại công việc)
              </h5>
            </div>
            <div className="card-body">
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
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-xl-6 col-lg-12 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title">
                Job Status by Month (Tình trạng công việc theo tháng)
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
                    name="Posted (Đã đăng)"
                  />
                  <Bar
                    dataKey="filled"
                    fill="#82ca9d"
                    name="Filled (Đã tuyển)"
                  />
                  <Bar
                    dataKey="expired"
                    fill="#ffc658"
                    name="Expired (Hết hạn)"
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
                Revenue by Subscription (Doanh thu theo gói dịch vụ)
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
                  <Line
                    type="monotone"
                    dataKey="premium"
                    stroke="#8884d8"
                    name="Premium Plan (Gói cao cấp)"
                  />
                  <Line
                    type="monotone"
                    dataKey="standard"
                    stroke="#82ca9d"
                    name="Standard Plan (Gói tiêu chuẩn)"
                  />
                  <Line
                    type="monotone"
                    dataKey="basic"
                    stroke="#ffc658"
                    name="Basic Plan (Gói cơ bản)"
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#ff7300"
                    strokeWidth={2}
                    name="Total Revenue (Tổng doanh thu)"
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
                Geographic Distribution (Phân bố địa lý)
              </h5>
            </div>
            <div className="card-body">
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
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-xl-7 col-lg-12 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title">
                Daily Engagement (Mức độ tương tác theo ngày)
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
                    dataKey="views"
                    stroke="#8884d8"
                    name="Job Views (Lượt xem)"
                  />
                  <Line
                    type="monotone"
                    dataKey="applications"
                    stroke="#82ca9d"
                    name="Applications (Lượt ứng tuyển)"
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

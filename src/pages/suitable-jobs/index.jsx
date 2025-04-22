/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Thêm import này
import { MatchingJobs } from "./MatchingJobs";
import { getCVsByUserId } from "../../services/cvServices";
import {
  fetchJobRecommendations,
  fetchAppliedJobs,
} from "../../services/jobServices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PieChart,
  BarChart,
  Activity,
  Calendar,
  Clock,
  Briefcase,
  BookOpen,
  ChevronRight,
  LineChart,
  TrendingUp,
  Bell,
  BadgeCheck,
  CheckCircle2,
  XCircle,
  ClockIcon,
} from "lucide-react";

// Modify MatchingJobs component to fetch and display recommended jobs
const ModifiedMatchingJobs = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [error, setError] = useState(null);

  // Get user ID from localStorage
  const getUserId = () => {
    try {
      const userStr = localStorage.getItem("userLoginData");
      console.log("userStr", userStr);
      if (!userStr) return null;

      const user = JSON.parse(userStr);
      return user?.userID;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return null;
    }
  };

  // Function to convert API score to display percentage
  const convertScoreToPercentage = (score) => {
    if (score >= 0.93) return 98;
    if (score >= 0.9) return 96;
    if (score >= 0.87) return 94;
    if (score >= 0.83) return 91;
    if (score >= 0.8) return 88;
    if (score >= 0.77) return 85;
    if (score >= 0.74) return 82;
    if (score >= 0.7) return 79;
    if (score >= 0.66) return 75;
    if (score >= 0.62) return 71;
    if (score >= 0.58) return 67;
    if (score >= 0.55) return 63;
    if (score >= 0.52) return 59;
    if (score >= 0.5) return 56;
    return 52; // fallback thấp nhất
  };

  // Define color functions
  const getMatchColor = (percentage) => {
    if (percentage >= 85) return "from-green-400 to-green-600";
    if (percentage >= 70) return "from-blue-400 to-blue-600";
    return "from-amber-400 to-amber-600";
  };

  const getMatchBadgeColor = (percentage) => {
    if (percentage >= 85) return "bg-green-50 text-green-700";
    if (percentage >= 70) return "bg-blue-50 text-blue-700";
    return "bg-amber-50 text-amber-700";
  };

  useEffect(() => {
    const fetchRecommendedJobs = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get user ID
        const userId = getUserId();
        if (!userId) {
          throw new Error("User ID not found. Please log in again.");
        }

        // Get user's CVs
        const cvs = await getCVsByUserId(userId);

        if (!cvs || cvs.length === 0) {
          throw new Error("No CVs found. Please create a CV first.");
        }

        // Find featured CV or use the first one
        const featuredCV = cvs.find((cv) => cv.isFeatured) || cvs[0];

        // Fetch job recommendations based on CV
        const recommendations = await fetchJobRecommendations(featuredCV.cvid);

        if (!recommendations || recommendations.length === 0) {
          throw new Error("No job recommendations found for your CV.");
        }

        // Transform recommendations data để xử lý định dạng mới
        const formattedJobs = recommendations.map((item) => {
          // Tính toán phần trăm phù hợp dựa trên score
          const matchPercentage = convertScoreToPercentage(item.score);

          return {
            ...item.job,
            matchPercentage,
            // Sử dụng trường dữ liệu mới từ API
            company: item.job.companyName,
            avatar: item.job.avatar,
            industry: item.job.industry,
            companySize: item.job.companySize,
            companyWebsite: item.job.companyWebsite,
            companyDescription: item.job.companyDescription,
            email: item.job.email,
            phoneNumber: item.job.phoneNumber,
            address: item.job.address,
            workLocation: item.job.workLocation,
            tags: item.job.tags || [],
            jobDetailTags: item.job.jobDetailTags || [],
            // Lưu lại điểm gốc để debug nếu cần
            originalScore: item.score,
          };
        });

        setRecommendedJobs(formattedJobs);
      } catch (error) {
        console.error("Error fetching job recommendations:", error);
        setError(error.message || "Failed to load job recommendations");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendedJobs();
  }, []);

  // If there's an error, show error message
  if (error && !isLoading) {
    return (
      <Card className="border border-red-200 bg-red-50">
        <CardContent className="p-6">
          <p className="text-red-600">{error}</p>
          <p className="mt-2 text-sm text-gray-600">
            Please check your profile settings or try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <MatchingJobs
      jobs={recommendedJobs}
      isLoading={isLoading}
      hideViewAllButton={true} // Thêm prop này để ẩn nút View All
      renderMatchIndicator={(job) => (
        <div
          className={`rounded-md absolute top-0 left-0 h-1 bg-gradient-to-r ${getMatchColor(
            job.matchPercentage
          )}`}
          style={{ width: `${job.matchPercentage}%` }}
        ></div>
      )}
      renderMatchBadge={(job) => (
        <div
          className={`flex items-center ${getMatchBadgeColor(
            job.matchPercentage
          )} px-3 py-1 rounded-md text-sm font-medium`}
        >
          <BadgeCheck className="h-4 w-4 mr-1" />
          {job.matchPercentage}% Match
        </div>
      )}
    />
  );
};

// Application Tracker component to fetch real application data
const ApplicationTracker = () => {
  const navigate = useNavigate(); // Thêm hook navigate
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState(null);

  // Get user ID from localStorage
  const getUserId = () => {
    try {
      const userStr = localStorage.getItem("userLoginData");
      if (!userStr) return null;
      const user = JSON.parse(userStr);
      return user?.userID;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchApplications = async () => {
      setIsLoading(true);
      try {
        const userId = getUserId();
        if (!userId) {
          throw new Error("User ID not found. Please log in again.");
        }

        const data = await fetchAppliedJobs(userId);
        setApplications(data || []);
      } catch (error) {
        console.error("Error fetching applications:", error);
        setError(error.message || "Failed to load application data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Count applications by status
  const applicationStats = {
    total: applications.length,
    pending: applications.filter((app) => app.applicationStatus === "Pending")
      .length,
    approved: applications.filter((app) => app.applicationStatus === "Approved")
      .length,
    rejected: applications.filter((app) => app.applicationStatus === "Rejected")
      .length,
  };

  if (isLoading) {
    return (
      <Card className="border border-gray-200">
        <CardContent className="p-6 flex justify-center items-center">
          <div className="animate-pulse">Loading application data...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border border-red-200 bg-red-50">
        <CardContent className="p-6">
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // Hàm xử lý khi người dùng nhấp vào nút View All
  const handleViewAllApplications = () => {
    navigate("/candidate/applied-jobs");
  };

  return (
    <Card className="border border-gray-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <Activity className="h-5 w-5 mr-2 text-blue-600" />
          Application Tracking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span>Total Applications</span>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {applicationStats.total}
            </Badge>
          </div>
          <Progress
            value={applicationStats.total > 0 ? 100 : 0}
            className="rounded-md h-2 bg-gray-100"
          />

          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="border rounded-md p-3 bg-gray-50">
              <div className="text-sm text-gray-500 flex items-center">
                <ClockIcon className="h-4 w-4 mr-1 text-amber-500" />
                Pending
              </div>
              <div className="text-xl font-semibold mt-1 text-amber-600">
                {applicationStats.pending}
              </div>
            </div>
            <div className="border rounded-md p-3 bg-gray-50">
              <div className="text-sm text-gray-500 flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
                Approved
              </div>
              <div className="text-xl font-semibold mt-1 text-green-600">
                {applicationStats.approved}
              </div>
            </div>
            <div className="border rounded-md p-3 bg-gray-50">
              <div className="text-sm text-gray-500 flex items-center">
                <XCircle className="h-4 w-4 mr-1 text-red-500" />
                Rejected
              </div>
              <div className="text-xl font-semibold mt-1 text-red-600">
                {applicationStats.rejected}
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full mt-3 text-blue-600 border-blue-200 hover:bg-blue-50"
            onClick={handleViewAllApplications}
          >
            View All Applications
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const Index = () => {
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);

  // Simulate fetching upcoming interviews
  useEffect(() => {
    // Mock data for demonstration
    const interviews = [
      {
        id: 1,
        companyName: "Tech Solutions Inc.",
        position: "Senior Frontend Developer",
        date: "April 18, 2025",
        time: "10:30 AM",
        type: "Video Interview",
        logo: "https://via.placeholder.com/40",
      },
      {
        id: 2,
        companyName: "Digital Innovations",
        position: "UX Designer",
        date: "April 20, 2025",
        time: "2:00 PM",
        type: "Technical Assessment",
        logo: "https://via.placeholder.com/40",
      },
    ];

    setUpcomingInterviews(interviews);
  }, []);

  return (
    <>
      <section
        className="bg-white py-12 pb-0"
        style={{ marginTop: "111px", marginBottom: "20px" }}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Matching Jobs (2/3 width on large screens) */}
            <div className="lg:col-span-2">
              <ModifiedMatchingJobs />
            </div>

            {/* Right Column - Business Features (1/3 width on large screens) */}
            <div className="space-y-6">
              {/* Application Tracking - Updated to use real data */}
              <ApplicationTracker />

              {/* Premium Feature Promotion */}
              <Card className="border-0 bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Bell className="h-5 w-5" />
                    <h3 className="font-semibold">Premium Job Alerts</h3>
                  </div>
                  <p className="text-sm mb-4 text-blue-100">
                    Get notified immediately when high-match jobs are posted.
                    Stand out with priority application status.
                  </p>
                  <Button
                    variant="secondary"
                    className="w-full bg-white text-blue-600 hover:bg-blue-50"
                  >
                    Upgrade to Premium
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

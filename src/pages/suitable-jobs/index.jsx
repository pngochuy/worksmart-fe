/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { MatchingJobs } from "./MatchingJobs";
import { getCVsByUserId } from "../../services/cvServices";
import { fetchJobRecommendations } from "../../services/jobServices";
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
    // Base conversion (score to percentage)
    let percentage = Math.round(score * 100);

    // Apply tiered bonus based on score ranges
    if (score >= 0.591 && score <= 0.79) {
      // Add 20% bonus for high matches
      percentage += 20;
    } else if (score >= 0.55 && score <= 0.59) {
      // Add 10% bonus for medium matches
      percentage += 10;
    } else if (score >= 0.491) {
      // Add 5% bonus for low matches
      percentage += 5;
    }

    // Cap at 100%
    return Math.min(percentage, 100);
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

// Application tracking data (mock)
const applicationStats = {
  applied: 12,
  inReview: 5,
  interviews: 3,
  offers: 1,
  rejected: 2,
};

// Career insights data (mock)
const careerInsights = {
  profileViews: 34,
  searchAppearances: 142,
  skillsInDemand: ["React.js", "JavaScript", "UI/UX Design", "Node.js"],
  recommendedSkills: ["TypeScript", "AWS", "GraphQL"],
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
              {/* Application Tracking */}
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
                      <span>Applied</span>
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700"
                      >
                        {applicationStats.applied}
                      </Badge>
                    </div>
                    <Progress
                      value={(applicationStats.applied / 20) * 100}
                      className="rounded-md h-2 bg-gray-100"
                    />

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="border rounded-md p-3 bg-gray-50">
                        <div className="text-sm text-gray-500">In Review</div>
                        <div className="text-xl font-semibold mt-1">
                          {applicationStats.inReview}
                        </div>
                      </div>
                      <div className="border rounded-md p-3 bg-gray-50">
                        <div className="text-sm text-gray-500">Interviews</div>
                        <div className="text-xl font-semibold mt-1">
                          {applicationStats.interviews}
                        </div>
                      </div>
                      <div className="border rounded-md p-3 bg-gray-50">
                        <div className="text-sm text-gray-500">Offers</div>
                        <div className="text-xl font-semibold text-green-600 mt-1">
                          {applicationStats.offers}
                        </div>
                      </div>
                      <div className="border rounded-md p-3 bg-gray-50">
                        <div className="text-sm text-gray-500">Rejected</div>
                        <div className="text-xl font-semibold text-gray-600 mt-1">
                          {applicationStats.rejected}
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full mt-3 text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      View All Applications
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Interviews */}
              {/* {upcomingInterviews.length > 0 && (
                <Card className="border border-gray-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                      Upcoming Interviews
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {upcomingInterviews.map((interview) => (
                        <div
                          key={interview.id}
                          className="border rounded-md p-3 flex items-start gap-3"
                        >
                          <Avatar className="h-10 w-10 rounded-md border">
                            <AvatarImage
                              src={interview.logo}
                              alt={interview.companyName}
                            />
                            <AvatarFallback className="bg-blue-50 text-blue-600 rounded-md">
                              {interview.companyName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-medium">
                              {interview.position}
                            </div>
                            <div className="text-sm text-gray-600">
                              {interview.companyName}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {interview.date}
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {interview.time}
                              </div>
                            </div>
                            <Badge className="rounded-md mt-2 bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-50">
                              {interview.type}
                            </Badge>
                          </div>
                        </div>
                      ))}

                      <Button
                        variant="outline"
                        className="w-full mt-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        Prepare for Interviews
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )} */}

              {/* Career Insights */}
              <Card className="border border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center">
                    <LineChart className="h-5 w-5 mr-2 text-blue-600" />
                    Career Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="profile">Profile Stats</TabsTrigger>
                      <TabsTrigger value="skills">Skills Analysis</TabsTrigger>
                    </TabsList>
                    <TabsContent value="profile" className="pt-4">
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="border rounded-md p-3 bg-gray-50">
                          <div className="text-sm text-gray-500">
                            Profile Views
                          </div>
                          <div className="text-xl font-semibold flex items-center mt-1">
                            {careerInsights.profileViews}
                            <TrendingUp className="h-4 w-4 ml-1 text-green-600" />
                          </div>
                        </div>
                        <div className="border rounded-md p-3 bg-gray-50">
                          <div className="text-sm text-gray-500">
                            Search Appearances
                          </div>
                          <div className="text-xl font-semibold flex items-center mt-1">
                            {careerInsights.searchAppearances}
                            <TrendingUp className="h-4 w-4 ml-1 text-green-600" />
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        Enhance Profile Visibility
                      </Button>
                    </TabsContent>
                    <TabsContent value="skills" className="pt-4">
                      <div className="mb-3">
                        <div className="text-sm font-medium mb-2">
                          Skills in Demand
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {careerInsights.skillsInDemand.map((skill) => (
                            <Badge
                              key={skill}
                              variant="outline"
                              className="rounded-md bg-green-50 text-green-700 border-green-100"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="text-sm font-medium mb-2">
                          Recommended Skills
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {careerInsights.recommendedSkills.map((skill) => (
                            <Badge
                              key={skill}
                              variant="outline"
                              className="rounded-md bg-amber-50 text-amber-700 border-amber-100"
                            >
                              + {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <BookOpen className="h-4 w-4 mr-1" />
                        Explore Learning Resources
                      </Button>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

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

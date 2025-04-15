/* eslint-disable react/prop-types */
import { MatchingJobs } from "./MatchingJobs";
import { useState, useEffect } from "react";
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

// Modify MatchingJobs component to accept a colorScheme prop
const ModifiedMatchingJobs = ({ userId }) => {
  // Import the original MatchingJobs component and enhance it

  // Define a function to determine color based on match percentage
  const getMatchColor = (percentage) => {
    if (percentage >= 90) return "from-green-400 to-green-600";
    if (percentage >= 80) return "from-blue-400 to-blue-600";
    return "from-amber-400 to-amber-600";
  };

  // Define a function to determine badge color based on match percentage
  const getMatchBadgeColor = (percentage) => {
    if (percentage >= 90) return "bg-green-50 text-green-700";
    if (percentage >= 80) return "bg-blue-50 text-blue-700";
    return "bg-amber-50 text-amber-700";
  };

  // This would be imported from the original component
  // I'm showing a wrapper that modifies the rendering to use new color scheme
  return (
    <MatchingJobs
      userId={userId}
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
              <ModifiedMatchingJobs userId={1} />
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

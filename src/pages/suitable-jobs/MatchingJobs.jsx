/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import {
  Building2,
  MapPin,
  Calendar,
  BadgeCheck,
  Briefcase,
  Heart,
  ChevronRight,
  Sparkles,
  Clock,
  CalendarDays,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import EnhancedPagination from "../job-list/EnhancedPagination";

export const MatchingJobs = ({
  userId,
  renderMatchIndicator,
  renderMatchBadge,
}) => {
  const [matchingJobs, setMatchingJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams, setSearchParams] = useState({
    PageIndex: 1,
    PageSize: 5,
  });

  // Simulate fetching matching jobs
  useEffect(() => {
    const fetchMatchingJobs = async () => {
      setIsLoading(true);
      // In real implementation, this would be an API call
      // fetchMatchingJobsForUser(userId, searchParams)

      // Simulated data for demonstration
      const mockData = {
        jobs: [
          {
            id: 1,
            title: "Senior Frontend Developer",
            company: "NAL Solutions",
            companyLogo: "https://via.placeholder.com/50",
            location: "Ha Noi",
            salary: "1,500,000 - 2,500,000",
            matchPercentage: 94,
            postedDate: new Date(2025, 3, 10),
            workType: "Full-time",
            priority: true,
          },
          {
            id: 2,
            title: "Business Analyst (N2)",
            company: "FPT Software",
            companyLogo: "https://via.placeholder.com/50",
            location: "Ha Noi & 2 others",
            salary: "1,200,000 - 2,000,000",
            matchPercentage: 86,
            postedDate: new Date(2025, 3, 5),
            workType: "Full-time",
            priority: false,
          },
          {
            id: 3,
            title: "Business Analyst (N2 Up)",
            company: "FPT Software",
            companyLogo: "https://via.placeholder.com/50",
            location: "Ha Noi & 2 others",
            salary: "1,300,000 - 2,200,000",
            matchPercentage: 82,
            postedDate: new Date(2025, 3, 8),
            workType: "Full-time",
            priority: false,
          },
          {
            id: 4,
            title: "Business Analyst",
            company: "Thanh Vinh Holdings",
            companyLogo: "https://via.placeholder.com/50",
            location: "Ho Chi Minh City",
            salary: "1,500,000 - 2,400,000",
            matchPercentage: 74,
            postedDate: new Date(2025, 3, 1),
            workType: "Full-time",
            priority: true,
          },
        ],
        totalPage: 3,
        totalJobs: 12,
      };

      setTimeout(() => {
        setMatchingJobs(mockData.jobs);
        setTotalPages(mockData.totalPage);
        setIsLoading(false);
      }, 800);
    };

    fetchMatchingJobs();
  }, [userId, searchParams]);

  // Helper function to format time ago
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  // Handle saving job to favorites
  const handleSaveJob = (jobId) => {
    console.log(`Saving job ${jobId} to favorites`);
  };

  // Handle applying for a job
  const handleApplyJob = (jobId) => {
    console.log(`Applying for job ${jobId}`);
    window.location.href = `/job-list/${jobId}`;
  };

  return (
    <section className="py-6 ">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Matching Jobs</h2>
            <p className="text-gray-600 mt-1">
              Jobs that best match your skills and experience
            </p>
          </div>
          <Button
            variant="outline"
            className="mt-2 md:mt-0 flex items-center text-blue-600 hover:text-blue-700"
            onClick={() => (window.location.href = "/matching-jobs")}
          >
            View all matching jobs
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-md"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                      <div className="flex flex-wrap gap-2">
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                        <div className="h-6 bg-gray-200 rounded w-24"></div>
                        <div className="h-6 bg-gray-200 rounded w-32"></div>
                      </div>
                    </div>
                    <div className="hidden md:block w-20 h-8 bg-gray-200 rounded-md"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {matchingJobs.map((job) => (
                <Card
                  key={job.id}
                  className="overflow-hidden border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                >
                  <CardContent className="p-0">
                    <div className="relative">
                      {/* Match percentage indicator */}
                      {renderMatchIndicator ? (
                        renderMatchIndicator(job)
                      ) : (
                        <div
                          className="rounded-md absolute top-0 left-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600"
                          style={{ width: `${job.matchPercentage}%` }}
                        ></div>
                      )}

                      <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-start gap-4">
                        {/* Company logo */}
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-md border border-gray-200 overflow-hidden">
                            <img
                              src={job.companyLogo}
                              alt={`${job.company} logo`}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        </div>

                        {/* Job details */}
                        <div className="flex-1">
                          <div className="flex flex-wrap justify-between">
                            <div className="mb-2">
                              <div className="flex items-center gap-2">
                                <h3
                                  className="font-semibold text-blue-600 hover:text-blue-800 text-lg cursor-pointer"
                                  onClick={() => handleApplyJob(job.id)}
                                >
                                  {job.title}
                                </h3>
                                {job.priority && (
                                  <Badge className="rounded-md bg-amber-100 text-amber-800 border-amber-200 flex items-center gap-1">
                                    <Sparkles className="h-3 w-3" />
                                    Top
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center text-gray-600 mt-1">
                                <Building2 className="h-4 w-4 mr-1" />
                                <span>{job.company}</span>
                              </div>
                            </div>

                            <div className="flex items-center mb-2">
                              {renderMatchBadge ? (
                                renderMatchBadge(job)
                              ) : (
                                <div className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-sm font-medium">
                                  <BadgeCheck className="h-4 w-4 mr-1" />
                                  {job.matchPercentage}% Match
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge
                              variant="outline"
                              className="rounded-md bg-blue-50 text-blue-700 border-blue-100 flex items-center gap-1"
                            >
                              <Briefcase className="h-3 w-3" />
                              {job.workType}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="rounded-md bg-green-50 text-green-700 border-green-100 flex items-center gap-1"
                            >
                              <MapPin className="h-3 w-3" />
                              {job.location}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="rounded-md bg-amber-50 text-amber-700 border-amber-100"
                            >
                              {job.salary}
                            </Badge>
                            <div className="text-gray-500 text-sm flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTimeAgo(job.postedDate)}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto mt-3 sm:mt-0">
                          <Button
                            variant="default"
                            className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleApplyJob(job.id)}
                          >
                            Apply Now
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 sm:flex-initial text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={() => handleSaveJob(job.id)}
                          >
                            <Heart className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <EnhancedPagination
                currentPage={searchParams.PageIndex}
                totalPage={totalPages}
                setSearchParams={setSearchParams}
              />
            )}
          </>
        )}
      </div>
    </section>
  );
};

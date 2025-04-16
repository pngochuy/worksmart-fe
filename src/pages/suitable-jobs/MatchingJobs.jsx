/* eslint-disable react/prop-types */
import { useState } from "react";
import {
  Building2,
  MapPin,
  BadgeCheck,
  Briefcase,
  Heart,
  ChevronRight,
  Sparkles,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import EnhancedPagination from "../job-list/EnhancedPagination";

// Function to convert API score to display percentage
const convertScoreToPercentage = (score) => {
  // Base conversion (score to percentage)
  let percentage = Math.round(score * 100);

  // Apply tiered bonus based on score ranges
  if (score >= 0.6 && score <= 0.79) {
    // Add 20% bonus for high matches
    percentage += 20;
  } else if (score >= 0.5 && score <= 0.59) {
    // Add 10% bonus for medium matches
    percentage += 10;
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

export const MatchingJobs = ({
  jobs = [],
  isLoading = false,
  renderMatchIndicator,
  renderMatchBadge,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams, setSearchParams] = useState({
    PageIndex: 1,
    PageSize: 5,
  });

  // Calculate pagination
  const itemsPerPage = searchParams.PageSize;
  const totalPages = Math.ceil(jobs.length / itemsPerPage);
  const startIndex = (searchParams.PageIndex - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentJobs = jobs.slice(startIndex, endIndex);

  // Helper function to format time ago
  const formatTimeAgo = (date) => {
    const now = new Date();
    const jobDate = new Date(date);
    const diffInDays = Math.floor((now - jobDate) / (1000 * 60 * 60 * 24));

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
    <section className="py-6">
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
        ) : jobs.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-600">
              No matching jobs found for your profile.
            </p>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              {currentJobs.map((job) => (
                <Card
                  key={job.jobID}
                  className="overflow-hidden border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                >
                  <CardContent className="p-0">
                    <div className="relative">
                      {/* Match percentage indicator */}
                      {renderMatchIndicator ? (
                        renderMatchIndicator(job)
                      ) : (
                        <div
                          className="rounded-md absolute top-0 left-0 h-1 bg-gradient-to-r"
                          style={{
                            width: `${job.matchPercentage}%`,
                            backgroundImage: `linear-gradient(to right, ${getMatchColor(
                              job.matchPercentage
                            )})`,
                          }}
                        ></div>
                      )}

                      <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-start gap-4">
                        {/* Company logo */}
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-md border border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
                            {job.avatar ? (
                              <img
                                src={job.avatar}
                                alt={job.company || "Company Logo"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xl font-semibold text-gray-500">
                                {job.company ? job.company.charAt(0) : "C"}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Job details */}
                        <div className="flex-1">
                          <div className="flex flex-wrap justify-between">
                            <div className="mb-2">
                              <div className="flex items-center gap-2">
                                <h3
                                  className="font-semibold text-blue-600 hover:text-blue-800 text-lg cursor-pointer"
                                  onClick={() => handleApplyJob(job.jobID)}
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
                                <span>{job.company || "Company"}</span>
                                {job.industry && (
                                  <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded ml-2">
                                    {job.industry}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center mb-2">
                              {renderMatchBadge ? (
                                renderMatchBadge(job)
                              ) : (
                                <div
                                  className={`flex items-center px-3 py-1 rounded-md text-sm font-medium ${getMatchBadgeColor(
                                    job.matchPercentage
                                  )}`}
                                >
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
                              {formatTimeAgo(job.createdAt)}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto mt-3 sm:mt-0">
                          <Button
                            variant="default"
                            className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleApplyJob(job.jobID)}
                          >
                            Apply Now
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 sm:flex-initial text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={() => handleSaveJob(job.jobID)}
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
              <div className="mt-6">
                <EnhancedPagination
                  currentPage={searchParams.PageIndex}
                  totalPage={totalPages}
                  setSearchParams={setSearchParams}
                />
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

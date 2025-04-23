/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EnhancedPagination from "../job-list/EnhancedPagination";
import { toast } from "react-toastify";
import LoadingButton from "@/components/LoadingButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  toggleFavoriteJob,
  isJobFavorited,
  deleteFavoriteJob,
} from "@/services/favoriteJobService";

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
  hideViewAllButton = false,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams, setSearchParams] = useState({
    PageIndex: 1,
    PageSize: 5,
  });

  const [favoriteStatus, setFavoriteStatus] = useState({});
  const [savingFavorite, setSavingFavorite] = useState(null);
  const [showSaveConfirmDialog, setShowSaveConfirmDialog] = useState(false);
  const [showUnsaveConfirmDialog, setShowUnsaveConfirmDialog] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  const user = JSON.parse(localStorage.getItem("userLoginData"));
  const userID = user?.userID || null;
  const userRole = user?.role || null;

  const itemsPerPage = searchParams.PageSize;
  const totalPages = Math.ceil(jobs.length / itemsPerPage);
  const startIndex = (searchParams.PageIndex - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentJobs = jobs.slice(startIndex, endIndex);

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

  useEffect(() => {
    if (userID && currentJobs.length > 0) {
      checkFavoriteStatuses();
    }
  }, [userID, currentJobs]);

  const checkFavoriteStatuses = async () => {
    if (!userID) return;

    try {
      const statusPromises = currentJobs.map((job) =>
        isJobFavorited(userID, job.jobID).then((isFavorite) => ({
          jobId: job.jobID,
          isFavorite,
        }))
      );

      const statuses = await Promise.all(statusPromises);
      const statusMap = {};

      statuses.forEach(({ jobId, isFavorite }) => {
        statusMap[jobId] = isFavorite;
      });

      setFavoriteStatus(statusMap);
    } catch (error) {
      console.error("Error checking favorite statuses:", error);
    }
  };

  const handleSaveJob = (job) => {
    if (!userID) {
      toast.warning("Please login to save this job.");
      return;
    }

    setSelectedJob(job);
    setSelectedJobId(job.jobID);

    if (favoriteStatus[job.jobID]) {
      setShowUnsaveConfirmDialog(true);
    } else {
      setShowSaveConfirmDialog(true);
    }
  };

  const handleToggleFavorite = async () => {
    if (!userID || !selectedJobId) return;

    setSavingFavorite(selectedJobId);
    try {
      const result = await toggleFavoriteJob(userID, selectedJobId);

      setFavoriteStatus((prev) => ({
        ...prev,
        [selectedJobId]: result.isFavorite,
      }));

      toast.success(
        result.isFavorite
          ? "Job saved to favorites successfully!"
          : "Job removed from favorites."
      );
    } catch (error) {
      console.error("Error toggling favorite status:", error);
      toast.error("Failed to update favorites. Please try again.");
    } finally {
      setSavingFavorite(null);
      setShowSaveConfirmDialog(false);
    }
  };

  const handleUnsaveJob = async () => {
    if (!userID || !selectedJobId) return;

    setSavingFavorite(selectedJobId);
    try {
      await deleteFavoriteJob(userID, selectedJobId);

      setFavoriteStatus((prev) => ({
        ...prev,
        [selectedJobId]: false,
      }));

      toast.success("Job removed from favorites.");
    } catch (error) {
      console.error("Error removing job from favorites:", error);
      toast.error("Failed to remove job from favorites. Please try again.");
    } finally {
      setSavingFavorite(null);
      setShowUnsaveConfirmDialog(false);
    }
  };

  const handleApplyJob = (jobId) => {
    console.log(`Applying for job ${jobId}`);
    window.location.href = `/job-list/${jobId}`;
  };

  return (
    <>
      <Dialog
        open={showSaveConfirmDialog}
        onOpenChange={setShowSaveConfirmDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Job</DialogTitle>
            <DialogDescription>
              Do you want to save <b>{selectedJob?.title}</b> at{" "}
              <b>{selectedJob?.company}</b> to your favorites? You can view all
              saved jobs in your profile.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setShowSaveConfirmDialog(false)}
              disabled={savingFavorite === selectedJobId}
            >
              Cancel
            </Button>
            <LoadingButton
              variant="default"
              onClick={handleToggleFavorite}
              loading={savingFavorite === selectedJobId}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save Job
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showUnsaveConfirmDialog}
        onOpenChange={setShowUnsaveConfirmDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove from Saved Jobs</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <b>{selectedJob?.title}</b> at{" "}
              <b>{selectedJob?.company}</b> from your saved jobs?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setShowUnsaveConfirmDialog(false)}
              disabled={savingFavorite === selectedJobId}
            >
              Cancel
            </Button>
            <LoadingButton
              variant="destructive"
              onClick={handleUnsaveJob}
              loading={savingFavorite === selectedJobId}
            >
              Remove
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="border border-gray-200">
        <CardHeader className="pb-0">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-medium flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
              Matching Jobs
            </CardTitle>

            {!hideViewAllButton && (
              <Button variant="link" className="text-sm text-blue-600 p-0">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </CardHeader>

        <section className="py-6">
          <div className="container mx-auto px-4">
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
                                className={`flex-1 sm:flex-initial border hover:bg-blue-100 flex items-center gap-2 justify-center ${
                                  favoriteStatus[job.jobID]
                                    ? "text-blue-600 border-blue-200 bg-blue-50"
                                    : "text-gray-500 border-gray-200 hover:text-blue-600"
                                }`}
                                onClick={() => handleSaveJob(job)}
                                disabled={savingFavorite === job.jobID}
                              >
                                <Heart
                                  className={`h-4 w-4 ${
                                    favoriteStatus[job.jobID]
                                      ? "text-blue-500 fill-blue-500"
                                      : "text-gray-500"
                                  }`}
                                />
                                {favoriteStatus[job.jobID] ? "Saved" : "Save"}
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
      </Card>
    </>
  );
};

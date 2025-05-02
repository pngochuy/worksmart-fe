import LoadingButton from "@/components/LoadingButton";
import {
  formatDateTimeNotIncludeTime,
  getTimeAgo,
} from "@/helpers/formatDateTime";
import { getCVsByUserId } from "@/services/cvServices";
import {
  applyToJob,
  checkApplyStatus,
  fetchJobDetails,
  fetchApplicationDetails,
  checkReapply,
  withdrawJobApplication,
} from "@/services/jobServices";
import {
  toggleFavoriteJob,
  isJobFavorited,
  deleteFavoriteJob,
} from "@/services/favoriteJobService"; // Import favorite job service
import { Clock, FileEdit, Heart, MoveUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import EmptySimilarJobs from "./EmptySimilarJobs";
import ReportJobButton from "./ReportJobButton";
import ApplicationStatus from "./ApplicationStatus";
import JobNotificationPopupModal from "../../job-alert/JobNotificationPopup/JobNotificationPopupModal";

export const Index = () => {
  const [loading, setLoading] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);
  const [job, setJob] = useState({});
  const [similarJobs, setSimilarJobs] = useState([]);
  const [userCVs, setUserCVs] = useState([]);
  const [featuredCV, setFeaturedCV] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSaveConfirmDialog, setShowSaveConfirmDialog] = useState(false);
  const [showUnsaveConfirmDialog, setShowUnsaveConfirmDialog] = useState(false); // Thêm state mới cho dialog unsave
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false); // Track if job is saved as favorite
  const [showJobNotificationModal, setShowJobNotificationModal] =
    useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  // Thêm state mới để lưu trữ toàn bộ application details
  const [applicationDetails, setApplicationDetails] = useState(null);
  const [canReApply, setCanReApply] = useState(false);

  const user = JSON.parse(localStorage.getItem("userLoginData"));
  const userID = user?.userID || null;
  const userRole = user?.role || null;
  const { jobId } = useParams(); // Lấy jobId từ URL

  // Check if job is in user's favorites
  const checkFavoriteStatus = async () => {
    if (!userID || !jobId) return;

    try {
      // Sử dụng API endpoint mới
      const isFav = await isJobFavorited(userID, jobId);
      setIsFavorite(isFav);
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };

  // Tạo hàm fetchApplicationInfo để tái sử dụng
  const fetchApplicationInfo = async () => {
    if (!userID || !jobId) return;

    try {
      // Lấy thông tin chi tiết về application
      const appDetails = await fetchApplicationDetails(userID, jobId);
      console.log("Application details fetched:", appDetails);

      // Lưu trữ toàn bộ application details
      setApplicationDetails(appDetails);

      if (appDetails) {
        setApplicationStatus(appDetails.applicationStatus);

        // Nếu status là Rejected, lấy thêm rejection reason và kiểm tra có thể apply lại không
        if (appDetails.applicationStatus === "Rejected") {
          if (appDetails.rejectionReason) {
            setRejectionReason(appDetails.rejectionReason);
          }

          // Kiểm tra có thể reapply không
          const canReApply = await checkReapply(userID, jobId);
          setCanReApply(canReApply);
        }
      } else {
        // Reset states nếu không có application
        setApplicationStatus(null);
        setRejectionReason("");
      }
    } catch (error) {
      console.error("Error fetching application details:", error);
      setApplicationStatus(null);
      setApplicationDetails(null);
    }
  };

  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        const data = await fetchJobDetails(jobId);
        console.log("Job details fetched:", data);
        if (data) {
          // Check if job deadline has passed
          if (data.job && data.job.deadline) {
            const deadlineDate = new Date(data.job.deadline);
            const currentDate = new Date();

            if (deadlineDate < currentDate) {
              console.log(
                "Job deadline has passed. Redirecting to job list..."
              );
              // Redirect to job list page
              window.location.href = "/job-list";
              return; // Exit early
            }
          }

          setJob(data.job);
          if (data.similarJobs) {
            setSimilarJobs(data.similarJobs);
          }
        }

        // Check application status for Candidates
        if (userRole === "Candidate" && userID) {
          // Sử dụng hàm fetchApplicationInfo thay vì code trực tiếp
          await fetchApplicationInfo();

          // Get user CVs
          const cvData = await getCVsByUserId(userID);
          if (cvData && cvData.length > 0) {
            setUserCVs(cvData);
            const featured = cvData.find((cv) => cv.isFeatured === true);
            if (featured) {
              setFeaturedCV(featured);
            }
          }

          // Check if job is saved as favorite
          checkFavoriteStatus();
        }
      } catch (error) {
        console.error("Error fetching job details:", error);
      }
    };

    fetchJobDetail();
  }, [userID, jobId, userRole]);

  const handleClickApply = async () => {
    if (!userID || !jobId) {
      toast.warning("Please login to apply for this job.");
      return;
    }

    setLoading(true);
    try {
      // Sử dụng application details đã lưu
      if (applicationDetails) {
        // Nếu status là Rejected, kiểm tra xem có thể apply lại không
        if (applicationDetails.applicationStatus === "Rejected") {
          // Nếu đã check rồi và không thể apply lại
          if (!canReApply.canApply) {
            toast.info(canReApply.message);
            setLoading(false);
            return;
          }
        }
        // Nếu status là Pending hoặc Approved, không cho phép apply nữa
        else if (
          applicationDetails.applicationStatus === "Pending" ||
          applicationDetails.applicationStatus === "Approved" ||
          applicationDetails.applicationStatus === "Accepted"
        ) {
          toast.info(
            `Your application status is currently: ${applicationDetails.applicationStatus}`
          );
          setLoading(false);
          return;
        }
      }

      // Không có application details hoặc có thể apply
      if (featuredCV) {
        setShowConfirmDialog(true);
      } else if (userCVs.length > 0) {
        toast.info(
          "You haven't set a featured CV. Please choose a featured CV before applying."
        );
      } else {
        toast.warning(
          "You don't have any CVs yet. Please create a CV before applying for this job."
        );
      }
    } catch (error) {
      console.error("Error processing application:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitApplication = async () => {
    setLoading(true);
    try {
      console.log("Submitting application...", applicationDetails);
      // Kiểm tra applicationDetails
      if (applicationDetails) {
        // Xử lý logic kiểm tra hiện tại...
        if (applicationDetails.applicationStatus === "Rejected") {
          if (!canReApply.canApply) {
            toast.info(
              "You've reached the maximum number of applications for this job."
            );
            setShowConfirmDialog(false);
            return;
          }
        } else if (
          applicationDetails.applicationStatus === "Pending" ||
          applicationDetails.applicationStatus === "Approved" ||
          applicationDetails.applicationStatus === "Accepted"
        ) {
          toast.info(
            `Your application status is currently: ${applicationDetails.applicationStatus}`
          );
          setShowConfirmDialog(false);
          return;
        }
      }

      // Submit application
      await applyToJob(userID, jobId);
      toast.success("Application submitted successfully!");

      // Fetch lại dữ liệu mới thay vì set cứng state
      await fetchApplicationInfo();

      setShowConfirmDialog(false);
    } catch (error) {
      console.error("Error applying to job:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý rút lại đơn ứng tuyển
  const handleWithdraw = async () => {
    if (!userID || !jobId) {
      toast.error("Cannot identify user or job");
      return;
    }

    setWithdrawLoading(true);
    try {
      // Thực hiện withdraw
      await withdrawJobApplication(userID, jobId);
      toast.success("Application withdrawn successfully!");

      // Thay vì set cứng application status, fetch lại dữ liệu mới từ server
      await fetchApplicationInfo();

      // Đóng dialog
      setShowWithdrawDialog(false);
    } catch (error) {
      toast.error("Failed to withdraw application. Please try again later.");
      console.error("Error withdrawing application:", error);
    } finally {
      setWithdrawLoading(false);
    }
  };

  // Handle save job button click
  const handleSaveJobClick = () => {
    if (!userID) {
      toast.warning("Please login to save this job.");
      return;
    }

    // Nếu job đã được lưu, hiện dialog xác nhận bỏ lưu
    if (isFavorite) {
      setShowUnsaveConfirmDialog(true);
      return;
    }

    // Nếu chưa lưu, hiện dialog xác nhận lưu
    setShowSaveConfirmDialog(true);
  };

  // Toggle favorite status of job
  const handleToggleFavorite = async () => {
    if (!userID || !jobId) return;

    setSavingFavorite(true);
    try {
      const result = await toggleFavoriteJob(userID, jobId);

      if (result.isFavorite) {
        setIsFavorite(true);
        toast.success("Job saved to favorites successfully!");
      } else {
        setIsFavorite(false);
        toast.success("Job removed from favorites.");
      }
    } catch (error) {
      console.error("Error toggling favorite status:", error);
      toast.error("Failed to update favorites. Please try again.");
    } finally {
      setSavingFavorite(false);
      setShowSaveConfirmDialog(false);
    }
  };

  // Hàm xử lý bỏ lưu job
  const handleUnsaveJob = async () => {
    if (!userID || !jobId) return;

    setSavingFavorite(true);
    try {
      // Gọi API mới để xóa job khỏi favorites
      await deleteFavoriteJob(userID, jobId);

      // Cập nhật trạng thái
      setIsFavorite(false);
      toast.success("Job removed from favorites.");
    } catch (error) {
      console.error("Error removing job from favorites:", error);
      toast.error("Failed to remove job from favorites. Please try again.");
    } finally {
      setSavingFavorite(false);
      setShowUnsaveConfirmDialog(false);
    }
  };

  return (
    <>
      {/* Application Confirm Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Application</DialogTitle>
            <DialogDescription>
              You have set <b>{featuredCV?.title || featuredCV?.fileName}</b> as
              your featured CV. The system will use this CV to apply for{" "}
              <b>{job.title}</b>.
            </DialogDescription>
          </DialogHeader>
          {featuredCV && (
            <div className="py-4">
              <div className="flex justify-between items-center p-3 border rounded-md mb-4 bg-gray-50">
                <div>
                  <h4 className="font-medium">
                    {featuredCV?.title || featuredCV?.fileName}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {featuredCV.jobPosition}
                  </p>
                </div>
                <a
                  href={
                    featuredCV.fileName
                      ? featuredCV.filePath
                      : `/candidate/my-cv/edit?cvId=${featuredCV.cvid}`
                  }
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                  target="_blank"
                >
                  <FileEdit className="w-4 h-4" />
                  View CV
                </a>
              </div>

              <div className="flex items-center justify-center">
                <a
                  href="/candidate/my-cv"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  <FileEdit className="w-4 h-4" />
                  Change featured CV
                </a>
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <LoadingButton
              variant="default"
              onClick={submitApplication}
              loading={loading}
            >
              Confirm Application
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Job Confirm Dialog */}
      <Dialog
        open={showSaveConfirmDialog}
        onOpenChange={setShowSaveConfirmDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Job</DialogTitle>
            <DialogDescription>
              Do you want to save <b>{job.title}</b> at <b>{job.companyName}</b>{" "}
              to your favorites? You can view all saved jobs in your profile.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setShowSaveConfirmDialog(false)}
              disabled={savingFavorite}
            >
              Cancel
            </Button>
            <LoadingButton
              variant="default"
              onClick={handleToggleFavorite}
              loading={savingFavorite}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save Job
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unsave Job Confirm Dialog */}
      <Dialog
        open={showUnsaveConfirmDialog}
        onOpenChange={setShowUnsaveConfirmDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove from Saved Jobs</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <b>{job.title}</b> at{" "}
              <b>{job.companyName}</b> from your saved jobs?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setShowUnsaveConfirmDialog(false)}
              disabled={savingFavorite}
            >
              Cancel
            </Button>
            <LoadingButton
              variant="destructive"
              onClick={handleUnsaveJob}
              loading={savingFavorite}
            >
              Remove
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Application Dialog */}
      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Withdraw Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to withdraw your application? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setShowWithdrawDialog(false)}
              disabled={withdrawLoading}
            >
              Cancel
            </Button>
            <LoadingButton
              variant="destructive"
              onClick={handleWithdraw}
              loading={withdrawLoading}
            >
              Withdraw Application
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Job Detail Section */}
      <section className="job-detail-section " style={{ marginTop: "111px" }}>
        <div className="job-detail-outer">
          <div className="auto-container">
            <div className="row">
              <div className="content-column col-lg-8 col-md-12 col-sm-12">
                <div className="job-block-outer">
                  {/* Job Block */}
                  <div className="job-block-seven style-two at-jsv6">
                    <div className="tags d-flex align-items-center gap-2">
                      {userRole === "Candidate" && (
                        <Button
                          variant="outline"
                          className={`border hover:bg-blue-100 flex items-center gap-2 ${
                            isFavorite
                              ? "text-blue-600 border-blue-200 bg-blue-50"
                              : "text-gray-500 border-gray-200 hover:text-blue-600"
                          }`}
                          onClick={handleSaveJobClick}
                          disabled={savingFavorite}
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              isFavorite
                                ? "text-blue-500 fill-blue-500"
                                : "text-gray-500"
                            }`}
                          />
                          <span className="hidden sm:inline">
                            {isFavorite ? "Saved" : "Save"}
                          </span>
                        </Button>
                      )}
                      {userRole === "Candidate" && (
                        <ReportJobButton
                          className="theme-btn btn-style-one"
                          jobId={jobId}
                          userId={userID}
                        />
                      )}
                    </div>
                    <div className="inner-box">
                      <div className="content">
                        <div className="d-md-flex align-items-center">
                          <figure className="image">
                            <img
                              className="rounded-circle w70"
                              src={job.avatar}
                              alt={job.companyName}
                            />
                          </figure>
                          <div className="ms-0 ms-md-3">
                            <h4 className="fz22 mb-0">
                              <a href="#">{job.title}</a>
                            </h4>
                            <p>
                              by{" "}
                              <span className="fw500 text">
                                {job.companyName}
                              </span>{" "}
                              {/* in Design & Creative */}
                            </p>
                          </div>
                        </div>
                        <ul className="job-other-info at-jsv6 mt20">
                          <li className="time">{job.workType}</li>
                          <li className="time2">{job.location}</li>
                          <li className="time2">{getTimeAgo(job.createdAt)}</li>
                          <li className="time2">{job.salary}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="job-overview-two at-jsv6 border-0 p-0 mb-0">
                  <h4 className="fz30 fw500">Job role insights</h4>
                  <ul>
                    <li>
                      <i className="icon fa-light fa-calendar-days"></i>
                      <div className="ml15">
                        <h5>Date Posted</h5>
                        <span>Posted {getTimeAgo(job.createdAt)}</span>
                      </div>
                    </li>
                    <li>
                      <i className="icon flaticon-map-locator"></i>
                      <div className="ml15">
                        <h5>Hiring location</h5>
                        <span>{job.location}</span>
                      </div>
                    </li>
                    <li>
                      <i className="icon fal fa-circle-dollar"></i>
                      <div className="ml15">
                        <h5>Offered Salary</h5>
                        <span>{job.salary}</span>
                      </div>
                    </li>
                    <li>
                      <i className="icon flaticon-title"></i>
                      <div className="ml15">
                        <h5>Qualification</h5>
                        <span>{job.education} Degree</span>
                      </div>
                    </li>
                    <li>
                      <i className="icon fal fa-hourglass-end"></i>
                      <div className="ml15">
                        <h5>Expiration date</h5>
                        <span>
                          {formatDateTimeNotIncludeTime(job.deadline)}
                        </span>
                      </div>
                    </li>
                    <li>
                      <i className="icon flaticon-man"></i>
                      <div className="ml15">
                        <h5>Experience</h5>
                        <span>
                          {job.exp > 1 ? `${job.exp} Years` : `${job.exp} Year`}
                        </span>
                      </div>
                    </li>
                    <li>
                      <i className="icon far fa-mars"></i>
                      <div className="ml15">
                        <h5>Gender</h5>
                        <span>Both</span>
                      </div>
                    </li>
                    <li>
                      <i className="icon flaticon-profit"></i>
                      <div className="ml15">
                        <h5>Career Level</h5>
                        <span>Officer</span>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="job-detail mt-3 mb-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <h4 className="fz30">Description</h4>
                    <Button
                      variant="outline"
                      onClick={() => setShowJobNotificationModal(true)}
                      className="ml-3"
                    >
                      Send me similar jobs
                    </Button>
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: job.description }} />
                </div>
                <JobNotificationPopupModal
                  isOpen={showJobNotificationModal}
                  onClose={() => setShowJobNotificationModal(false)}
                  defaultKeyword={job.title}
                />

                {/* Application Ends */}
                {userRole === "Candidate" && (
                  <div className="application-end-widget">
                    <div className="d-sm-flex justify-content-sm-between">
                      <div className="titles mb-3 mb-sm-0">
                        <h4 className="fz20 fw500">
                          Application ends {applicationStatus}
                        </h4>
                        <p className="text">
                          {formatDateTimeNotIncludeTime(job.deadline)}
                        </p>
                      </div>
                      <div className="btn-box mb-0 d-flex flex-column gap-2 min-w-[250px]">
                        {applicationDetails ? (
                          <>
                            <ApplicationStatus
                              status={applicationStatus}
                              rejectionReason={rejectionReason}
                            />

                            {/* Trường hợp 1: Đơn đang chờ xét duyệt - hiển thị nút Withdraw */}
                            {applicationStatus === "Pending" && (
                              <Button
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50 w-full mt-2"
                                onClick={() => setShowWithdrawDialog(true)}
                              >
                                Withdraw Application
                              </Button>
                            )}

                            {/* Trường hợp 2: Đơn bị từ chối và có thể apply lại - hiển thị nút Apply Again */}
                            {applicationDetails.applicationStatus ===
                              "Rejected" &&
                              canReApply.canApply && (
                                <Button
                                  variant="outline"
                                  className="text-blue-600 border-blue-200 hover:bg-blue-50 w-full mt-2"
                                  onClick={handleClickApply}
                                >
                                  Apply Again
                                </Button>
                              )}

                            {/* Trường hợp 3: Đơn được chấp nhận - không hiển thị nút */}
                          </>
                        ) : (
                          // Trường hợp 4: Chưa từng apply - hiển thị nút Apply For Job
                          <LoadingButton
                            className="theme-btn btn-style-one"
                            type="button"
                            onClick={handleClickApply}
                            loading={loading}
                          >
                            <MoveUpRight className="size-4" />
                            Apply For Job
                          </LoadingButton>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Other Options */}
                <div className="other-options">
                  <div className="social-share">
                    <h5>Share this job</h5>
                    <a href="#" className="facebook">
                      <i className="fab fa-facebook-f"></i> Facebook
                    </a>
                    <a href="#" className="twitter">
                      <i className="fab fa-twitter"></i> Twitter
                    </a>
                    <a href="#" className="google">
                      <i className="fab fa-google"></i> Google+
                    </a>
                  </div>
                </div>

                {/* Related Jobs */}
                <div className="related-jobs">
                  <div className="title-box d-flex justify-content-between">
                    <h3>Similar jobs</h3>
                    <a href="/job-list" className="text ud-btn2">
                      View All Jobs <i className="fal fa-long-arrow-right"></i>
                    </a>
                  </div>

                  {/* Job Block */}
                  {similarJobs && similarJobs.length > 0 ? (
                    similarJobs.map((job) => (
                      <div key={job.jobID} className="job-block at-jsv6">
                        <div className="inner-box">
                          <div className="tags d-flex align-items-center">
                            <a className="flaticon-bookmark" href=""></a>
                          </div>
                          <div className="content ps-0">
                            <div className="d-sm-flex align-items-center">
                              <figure className="image mb-sm-0">
                                <img
                                  className="rounded-circle w60"
                                  src={job.avatar}
                                  alt={job.companyName}
                                />
                              </figure>
                              <div className="ms-0 ms-sm-3">
                                <h4 className="fz20 mb-0">
                                  <a href={`/job-list/${job.jobID}`}>
                                    {job.title}
                                  </a>
                                </h4>
                                <p>
                                  by{" "}
                                  <span className="fw500 text">
                                    {job.companyName}
                                  </span>
                                </p>
                              </div>
                            </div>
                            <ul className="job-other-info d-sm-flex ms-0 at-jsv6 mt30">
                              <li className="time">{job.workType}</li>
                              <li className="time2">{job.location}</li>
                              <li className="time2">
                                {getTimeAgo(job.createdAt)}
                              </li>
                              <li className="time2">{job.salary}</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptySimilarJobs />
                  )}
                </div>
              </div>

              <div className="sidebar-column col-lg-4 col-md-12 col-sm-12">
                <aside className="sidebar">
                  <div className="sidebar-widget at-jsv6 text-center">
                    <h4 className="fz20 fw500 mb10">Application ends</h4>
                    <p className="text mb15 flex items-center justify-center">
                      <Clock className="h-5 w-5 mr-1" />
                      {formatDateTimeNotIncludeTime(job.deadline)}
                    </p>
                    {userRole === "Candidate" && (
                      <div className="mb-3">
                        {applicationDetails ? (
                          <>
                            <ApplicationStatus
                              status={applicationStatus}
                              rejectionReason={rejectionReason}
                            />

                            {applicationDetails.applicationStatus ===
                              "Pending" && (
                              <Button
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50 w-full mt-2"
                                onClick={() => setShowWithdrawDialog(true)}
                              >
                                Withdraw Application
                              </Button>
                            )}

                            {applicationDetails.applicationStatus ===
                              "Rejected" &&
                              canReApply.canApply && (
                                <Button
                                  variant="outline"
                                  className="text-blue-600 border-blue-200 hover:bg-blue-50 w-full mt-2"
                                  onClick={handleClickApply}
                                >
                                  Apply Again
                                </Button>
                              )}
                          </>
                        ) : (
                          <div className="btn-box mb-3 d-flex flex-column gap-2">
                            <LoadingButton
                              className="theme-btn btn-style-one"
                              type="button"
                              onClick={handleClickApply}
                              loading={loading}
                            >
                              <MoveUpRight className="size-4" />
                              Apply For Job
                            </LoadingButton>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Save Job Button in Sidebar */}
                    {userRole === "Candidate" && (
                      <div className="btn-box mb-3">
                        <Button
                          variant="outline"
                          className={`w-full border hover:bg-blue-100 flex items-center justify-center gap-2 ${
                            isFavorite
                              ? "text-blue-600 border-blue-200 bg-blue-50"
                              : "text-gray-500 border-gray-200 hover:text-blue-600"
                          }`}
                          onClick={handleSaveJobClick}
                          disabled={savingFavorite}
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              isFavorite
                                ? "text-blue-500 fill-blue-500"
                                : "text-gray-500"
                            }`}
                          />
                          <span>
                            {isFavorite ? "Saved to Favorites" : "Save Job"}
                          </span>
                        </Button>
                      </div>
                    )}

                    {/* Featured CV Information (if exists) */}
                    {userRole === "Candidate" && featuredCV && (
                      <div className="mt-4 text-left p-3 border rounded bg-gray-50">
                        <h5 className="text-sm font-medium mb-2">
                          Featured CV
                        </h5>
                        <p className="text-xs mb-2">
                          {featuredCV?.title || featuredCV?.fileName}
                        </p>
                        <div className="flex justify-between items-center">
                          <a
                            href={
                              featuredCV.fileName
                                ? featuredCV.filePath
                                : `/candidate/my-cv/edit?cvId=${featuredCV.cvid}`
                            }
                            className="text-xs text-blue-600 hover:underline"
                            target="_blank"
                          >
                            View CV
                          </a>
                          <a
                            href="/candidate/my-cv"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Change CV
                          </a>
                        </div>
                      </div>
                    )}

                    {/* No Featured CV Warning */}
                    {userRole === "Candidate" &&
                      userCVs.length > 0 &&
                      !featuredCV && (
                        <div className="mt-4 text-left p-3 border rounded bg-yellow-50">
                          <p className="text-sm text-amber-800 mb-2">
                            You haven&apos;t set a featured CV yet!
                          </p>
                          <a
                            href="/candidate/my-cv"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Set a featured CV here
                          </a>
                        </div>
                      )}
                  </div>

                  <div className="sidebar-widget company-widget at-jsv6">
                    <div className="widget-content">
                      <div className="company-title">
                        <div className="company-logo">
                          <img src={job.avatar} alt={job.companyName} />
                        </div>
                        <h5 className="company-name">{job.companyName}</h5>
                        <a
                          href={`/company-list/${job.companyName}`}
                          className="profile-link"
                        >
                          View company profile
                        </a>
                      </div>
                      <ul className="company-info">
                        <li>
                          Primary industry: <span>{job.industry}</span>
                        </li>
                        <li>
                          Company size: <span>{job.companySize}</span>
                        </li>
                        {/* <li>
                          Founded in: <span>2011</span>
                        </li> */}
                        <li>
                          Phone: <span>{job.phoneNumber}</span>
                        </li>
                        <li>
                          Email: <span>{job.email}</span>
                        </li>
                        <li>
                          Location: <span>{job.address}</span>
                        </li>
                      </ul>
                      <div className="btn-box mb-2">
                        <a
                          href={job.companyWebsite}
                          className="theme-btn btn-style-three"
                        >
                          {job.companyWebsite}
                        </a>
                      </div>

                      <div className="text-center">
                        <div className="social-link-style1">
                          <a className="me-3" href="#">
                            <i className="fab fa-facebook-f"></i>
                          </a>
                          <a className="me-3" href="#">
                            <i className="fab fa-twitter"></i>
                          </a>
                          <a className="me-3" href="#">
                            <i className="fab fa-instagram"></i>
                          </a>
                          <a href="#">
                            <i className="fab fa-linkedin-in"></i>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="sidebar-widget bg-white p-0">
                    {/* Job Skills */}
                    <h4 className="widget-title mb-0">Job Skills</h4>
                    <div className="widget-content">
                      <ul className="job-skills at-jsv6">
                        {job?.jobDetailTags?.map((tag) => (
                          <li key={tag.tagID}>
                            <a
                              href="#"
                              className=""
                              style={{ backgroundColor: "#f1f1f1" }}
                            >
                              {tag.tagName}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <h4 className="widget-title mb-0">Job Locations</h4>
                    <div className="widget-content">
                      <ul className="job-skills at-jsv6">
                        {job?.location?.split(",").map((location, index) => (
                          <li key={index}>
                            <a href="#" style={{ backgroundColor: "#f1f1f1" }}>
                              {location.trim()}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

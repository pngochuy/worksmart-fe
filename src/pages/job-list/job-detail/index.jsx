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
} from "@/services/jobServices";
import {
  toggleFavoriteJob,
  checkJobIsFavorite,
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

export const Index = () => {
  const [loading, setLoading] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);
  const [job, setJob] = useState({});
  const [similarJobs, setSimilarJobs] = useState([]);
  const [userCVs, setUserCVs] = useState([]);
  const [featuredCV, setFeaturedCV] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSaveConfirmDialog, setShowSaveConfirmDialog] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false); // Track if job is saved as favorite

  const user = JSON.parse(localStorage.getItem("userLoginData"));
  const userID = user?.userID || null;
  const userRole = user?.role || null;
  const { jobId } = useParams(); // Lấy jobId từ URL

  // Check if job is in user's favorites
  const checkFavoriteStatus = async () => {
    if (!userID || !jobId) return;

    try {
      const isFav = await checkJobIsFavorite(userID, jobId);
      setIsFavorite(isFav);
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };

  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        const data = await fetchJobDetails(jobId);
        console.log("Job data:", data); // Log the fetched job data
        if (data) {
          setJob(data.job);
          if (data.similarJobs) {
            setSimilarJobs(data.similarJobs);
          }
        }

        // Check application status for Candidates
        if (userRole === "Candidate" && userID) {
          try {
            const status = await checkApplyStatus(userID, jobId);
            if (status !== "None") {
              setApplicationStatus(status);
            }
          } catch (error) {
            console.error("Error checking application status:", error);
          }

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
    try {
      // Check if already applied
      const status = await checkApplyStatus(userID, jobId);

      if (status !== "None") {
        toast.info(`You have already applied to this job. Status: ${status}`);
        setApplicationStatus(status);
        return;
      }

      // Not applied yet, continue with application flow
      if (featuredCV) {
        setShowConfirmDialog(true);
      } else if (userCVs.length > 0) {
        toast.info(
          "You haven't set a featured CV. Please choose a featured CV before applying."
        );
      } else if (userCVs.length === 0) {
        toast.warning(
          "You don't have any CVs yet. Please create a CV before applying for this job."
        );
      }
    } catch (error) {
      console.error("Error checking application status:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const submitApplication = async () => {
    setLoading(true);
    try {
      // Double-check status before submitting
      const status = await checkApplyStatus(userID, jobId);

      if (status !== "None") {
        toast.info(`You have already applied to this job. Status: ${status}`);
        setApplicationStatus(status);
        setShowConfirmDialog(false);
        return;
      }

      // Submit application
      await applyToJob(userID, jobId);
      toast.success("Application submitted successfully!");
      setApplicationStatus("Pending");
    } catch (error) {
      console.error("Error applying to job:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
    }
  };

  // Handle save job button click
  const handleSaveJobClick = () => {
    if (!userID) {
      toast.warning("Please login to save this job.");
      return;
    }

    // If job is already favorited, remove it directly
    if (isFavorite) {
      handleToggleFavorite();
      return;
    }

    // If not favorited yet, show confirmation dialog
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
                  <h4 className="fz30">Description</h4>
                  <div dangerouslySetInnerHTML={{ __html: job.description }} />
                </div>

                {/* Application Ends */}
                {userRole === "Candidate" && (
                  <div className="application-end-widget">
                    <div className="d-sm-flex justify-content-sm-between">
                      <div className="titles mb-3 mb-sm-0">
                        <h4 className="fz20 fw500">Application ends</h4>
                        <p className="text">
                          {formatDateTimeNotIncludeTime(job.deadline)}
                        </p>
                      </div>
                      <div className="btn-box mb-0 d-flex flex-column gap-2 min-w-[250px]">
                        {applicationStatus ? (
                          <ApplicationStatus status={applicationStatus} />
                        ) : (
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
                        {applicationStatus ? (
                          <>
                            <ApplicationStatus status={applicationStatus} />
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

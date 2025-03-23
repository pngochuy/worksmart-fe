import LoadingButton from "@/components/LoadingButton";
import {
  formatDateTimeNotIncludeTime,
  getTimeAgo,
} from "@/helpers/formatDateTime";
import { getCVsByUserId } from "@/services/cvServices";
import { applyToJob, fetchJobDetails } from "@/services/jobServices";
import { FileEdit, MoveUpRight } from "lucide-react";
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

export const Index = () => {
  const [loading, setLoading] = useState(false);
  const [job, setJob] = useState({});
  const [similarJobs, setSimilarJobs] = useState([]);
  const [userCVs, setUserCVs] = useState([]);
  const [featuredCV, setFeaturedCV] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const user = JSON.parse(localStorage.getItem("userLoginData"));
  const userID = user?.userID || null;
  const userRole = user?.role || null;
  const { jobId } = useParams(); // Lấy jobId từ URL

  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        const data = await fetchJobDetails(jobId);

        if (data) {
          setJob(data.job);
          // Giả sử API cũng trả về similarJobs
          if (data.similarJobs) {
            setSimilarJobs(data.similarJobs);
          }
        }

        // Chỉ lấy thông tin CV nếu user là Candidate
        if (userRole === "Candidate" && userID) {
          const cvData = await getCVsByUserId(userID);

          if (cvData && cvData.length > 0) {
            setUserCVs(cvData);

            // Tìm CV có isFeatured = true
            const featured = cvData.find((cv) => cv.isFeatured === true);
            if (featured) {
              setFeaturedCV(featured);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching job details:", error);
      }
    };

    fetchJobDetail(); // Call the fetch function
  }, [userID, jobId, userRole]);

  const handleClickApply = () => {
    // Kiểm tra xem có CV đại diện không
    if (featuredCV) {
      // Hiển thị dialog xác nhận
      setShowConfirmDialog(true);
    } else if (userCVs.length > 0) {
      // Không có CV đại diện nhưng có CV, thông báo người dùng nên chọn CV đại diện
      toast.info(
        "You haven't set a featured CV. Please choose a featured CV before applying."
      );
    } else if (userCVs.length == 0) {
      // Không có CV nào, thông báo người dùng tạo CV
      toast.warning(
        "You don't have any CVs yet. Please create a CV before applying for this job."
      );
    } else {
      submitApplication();
    }
  };

  const submitApplication = async () => {
    setLoading(true);
    try {
      // Gọi hàm từ service để gửi yêu cầu đến API
      await applyToJob(userID, jobId);

      // Thông báo thành công
      toast.success("Application submitted successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setShowConfirmDialog(false); // Đóng dialog nếu đang mở
    }
  };

  return (
    <>
      {/* Confirm Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Application</DialogTitle>
            <DialogDescription>
              You have set <b>{featuredCV?.title}</b> as your featured CV. The
              system will use this CV to apply for <b>{job.title}</b>.
            </DialogDescription>
          </DialogHeader>
          {featuredCV && (
            <div className="py-4">
              <div className="flex justify-between items-center p-3 border rounded-md mb-4 bg-gray-50">
                <div>
                  <h4 className="font-medium">{featuredCV.title}</h4>
                  <p className="text-sm text-gray-500">
                    {featuredCV.jobPosition || "No position specified"}
                  </p>
                </div>
                <a
                  href={`/candidate/my-cv/edit?cvId=${featuredCV.cvid}`}
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
            >
              Cancel
            </Button>
            <Button onClick={submitApplication} disabled={loading}>
              {loading ? "Submitting..." : "Confirm Application"}
            </Button>
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
                    <div className="tags d-flex align-items-center">
                      <a className="flaticon-bookmark" href=""></a>
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
                        <span>Posted 1 hours ago</span>
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
                      <div className="btn-box mb-0">
                        <LoadingButton
                          className="theme-btn btn-style-one"
                          type="button"
                          onClick={handleClickApply}
                          loading={loading}
                        >
                          <MoveUpRight className="size-4 " />
                          Apply For Job
                        </LoadingButton>
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
                  {similarJobs.map((job) => (
                    <>
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
                                  src="images/resource/company-logo/3-1.png"
                                  alt={job.companyName}
                                />
                              </figure>
                              <div className="ms-0 ms-sm-3">
                                <h4 className="fz20 mb-0">
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
                    </>
                  ))}
                </div>
              </div>

              <div className="sidebar-column col-lg-4 col-md-12 col-sm-12">
                <aside className="sidebar">
                  <div className="sidebar-widget at-jsv6 text-center">
                    <h4 className="fz20 fw500 mb10">Application ends</h4>
                    <p className="text mb15">
                      {formatDateTimeNotIncludeTime(job.deadline)}
                    </p>
                    {userRole === "Candidate" && (
                      <div className="btn-box mb-0">
                        <LoadingButton
                          className="theme-btn btn-style-one"
                          type="button"
                          onClick={handleClickApply}
                          loading={loading}
                        >
                          <MoveUpRight className="size-4 " />
                          Apply For Job
                        </LoadingButton>
                      </div>
                    )}

                    {/* Featured CV Information (if exists) */}
                    {userRole === "Candidate" && featuredCV && (
                      <div className="mt-4 text-left p-3 border rounded bg-gray-50">
                        <h5 className="text-sm font-medium mb-2">
                          Featured CV
                        </h5>
                        <p className="text-xs mb-2">{featuredCV.title}</p>
                        <div className="flex justify-between items-center">
                          <a
                            href={`/candidate/my-cv/edit?cvId=${featuredCV.cvid}`}
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
                          <p className="text-xs text-amber-800 mb-2">
                            You haven&apos;t set a featured CV yet
                          </p>
                          <a
                            href="/candidate/my-cv"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Set a featured CV
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
                    <h4 className="widget-title">Job Skills</h4>
                    <div className="widget-content">
                      <ul className="job-skills at-jsv6">
                        {job?.jobDetailTags?.map((tag) => (
                          <>
                            <li key={tag.tagID}>
                              <a href="#">{tag.tagName}</a>
                            </li>
                          </>
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
      {/* End Job Detail Section */}
    </>
  );
};

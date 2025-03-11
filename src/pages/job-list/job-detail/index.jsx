import LoadingButton from "@/components/LoadingButton";
import { applyToJob } from "@/services/jobServices";
import { MoveUpRight } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

export const Index = () => {
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("userLoginData"));
  const userID = user?.userID || null;
  const { jobId } = useParams(); // Lấy jobId từ URL

  const handleClick = async () => {
    setLoading(true); // Đặt trạng thái loading thành true

    try {
      // Gọi hàm từ service để gửi yêu cầu đến API
      await applyToJob(userID, jobId);

      // Thông báo thành công
      toast.success("Application submitted successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false); // Đặt trạng thái loading thành false sau khi hoàn thành
    }
  };

  return (
    <>
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
                              src="images/resource/company-logo/3-1.png"
                              alt=""
                            />
                          </figure>
                          <div className="ms-0 ms-md-3">
                            <h4 className="fz22 mb-0">
                              <a href="#">Business Analyst (N2 Up)</a>
                            </h4>
                            <p>
                              by <span className="fw500 text">HuyPN</span> in
                              Design & Creative
                            </p>
                          </div>
                        </div>
                        <ul className="job-other-info at-jsv6 mt20">
                          <li className="time">Full Time</li>
                          <li className="time2">Da Nang, Viet Nam</li>
                          <li className="time2">11 hours ago</li>
                          <li className="time2">450 - $900/month</li>
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
                        <span>Da Nang, Viet Nam</span>
                      </div>
                    </li>
                    <li>
                      <i className="icon fal fa-circle-dollar"></i>
                      <div className="ml15">
                        <h5>Offered Salary</h5>
                        <span>$150 - $180 / week</span>
                      </div>
                    </li>
                    <li>
                      <i className="icon flaticon-title"></i>
                      <div className="ml15">
                        <h5>Qualification</h5>
                        <span>Bachelor Degree</span>
                      </div>
                    </li>
                    <li>
                      <i className="icon fal fa-hourglass-end"></i>
                      <div className="ml15">
                        <h5>Expiration date</h5>
                        <span>April 06, 2021</span>
                      </div>
                    </li>
                    <li>
                      <i className="icon flaticon-man"></i>
                      <div className="ml15">
                        <h5>Experience</h5>
                        <span>2 Years</span>
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
                <hr className="opacity-100 mt-0" />
                <div className="job-detail">
                  <h4 className="fz30">Description</h4>
                  <p className="text">
                    As a Product Designer, you will work within a Product
                    Delivery Team fused with UX, engineering, product and data
                    talent. You will help the team design beautiful interfaces
                    that solve business challenges for our clients. We work with
                    a number of Tier 1 banks on building web-based applications
                    for AML, KYC and Sanctions List management workflows. This
                    role is ideal if you are looking to segue your career into
                    the FinTech or Big Data arenas.
                  </p>
                  <h4>Key Responsibilities</h4>
                  <ul className="list-style-three">
                    <li className="dark-color">
                      Be involved in every step of the product design cycle from
                      discovery to developer handoff and user acceptance
                      testing.
                    </li>
                    <li className="dark-color">
                      Work with BAs, product managers and tech teams to lead the
                      Product Design
                    </li>
                    <li className="dark-color">
                      Maintain quality of the design process and ensure that
                      when designs are translated into code they accurately
                      reflect the design specifications.
                    </li>
                    <li className="dark-color">
                      Accurately estimate design tickets during planning
                      sessions.
                    </li>
                    <li className="dark-color">
                      Contribute to sketching sessions involving
                      non-designersCreate, iterate and maintain UI deliverables
                      including sketch files, style guides, high fidelity
                      prototypes, micro interaction specifications and pattern
                      libraries.
                    </li>
                    <li className="dark-color">
                      Ensure design choices are data led by identifying
                      assumptions to test each sprint, and work with the
                      analysts in your team to plan moderated usability test
                      sessions.
                    </li>
                    <li className="dark-color">
                      Design pixel perfect responsive UI’s and understand that
                      adopting common interface patterns is better for UX than
                      reinventing the wheel
                    </li>
                    <li className="dark-color">
                      Present your work to the wider business at Show & Tell
                      sessions.
                    </li>
                  </ul>
                  <h4>Skill & Experience</h4>
                  <ul className="list-style-three">
                    <li className="dark-color">
                      You have at least 3 years’ experience working as a Product
                      Designer.
                    </li>
                    <li className="dark-color">
                      You have experience using Sketch and InVision or Framer X
                    </li>
                    <li className="dark-color">
                      You have some previous experience working in an agile
                      environment – Think two-week sprints.
                    </li>
                    <li className="dark-color">
                      You are familiar using Jira and Confluence in your
                      workflow
                    </li>
                  </ul>
                </div>
                <hr className="opacity-100" />

                {/* Application Ends */}
                <div className="application-end-widget">
                  <div className="d-sm-flex justify-content-sm-between">
                    <div className="titles mb-3 mb-sm-0">
                      <h4 className="fz20 fw500">Application ends</h4>
                      <p className="text">May 18, 2026</p>
                    </div>
                    <div className="btn-box mb-0">
                      <a href="#" className="theme-btn btn-style-one">
                        Apply For Job{" "}
                        <i className="fal fa-long-arrow-right ms-3"></i>
                      </a>
                    </div>
                  </div>
                </div>

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
                    <a href="" className="text ud-btn2">
                      View All Jobs <i className="fal fa-long-arrow-right"></i>
                    </a>
                  </div>

                  {/* Job Block */}
                  <div className="job-block at-jsv6">
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
                              alt=""
                            />
                          </figure>
                          <div className="ms-0 ms-sm-3">
                            <h4 className="fz20 mb-0">
                              <a href="#">Business Analyst (N2 Up)</a>
                            </h4>
                            <p>
                              by <span className="fw500 text">HuyPN</span> in
                              Design & Creative
                            </p>
                          </div>
                        </div>
                        <ul className="job-other-info d-sm-flex ms-0 at-jsv6 mt30">
                          <li className="time">Full Time</li>
                          <li className="time2">Da Nang, Viet Nam</li>
                          <li className="time2">11 hours ago</li>
                          <li className="time2">450 - $900/month</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Job Block */}
                  <div className="job-block at-jsv6">
                    <div className="inner-box">
                      <div className="tags d-flex align-items-center">
                        <a className="flaticon-bookmark" href=""></a>
                      </div>
                      <div className="content ps-0">
                        <div className="d-sm-flex align-items-center">
                          <figure className="image mb-sm-0">
                            <img
                              className="rounded-circle w60"
                              src="images/resource/company-logo/3-2.png"
                              alt=""
                            />
                          </figure>
                          <div className="ms-0 ms-sm-3">
                            <h4 className="fz20 mb-0">
                              <a href="#">Business Analyst (N2 Up)</a>
                            </h4>
                            <p>
                              by <span className="fw500 text">HuyPN</span> in
                              Design & Creative
                            </p>
                          </div>
                        </div>
                        <ul className="job-other-info d-sm-flex ms-0 at-jsv6 mt30">
                          <li className="time">Full Time</li>
                          <li className="time2">Da Nang, Viet Nam</li>
                          <li className="time2">11 hours ago</li>
                          <li className="time2">450 - $900/month</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Job Block */}
                  <div className="job-block at-jsv6">
                    <div className="inner-box">
                      <div className="tags d-flex align-items-center">
                        <a className="flaticon-bookmark" href=""></a>
                      </div>
                      <div className="content ps-0">
                        <div className="d-sm-flex align-items-center">
                          <figure className="image mb-sm-0">
                            <img
                              className="rounded-circle w60"
                              src="images/resource/company-logo/3-4.png"
                              alt=""
                            />
                          </figure>
                          <div className="ms-0 ms-sm-3">
                            <h4 className="fz20 mb-0">
                              <a href="#">Business Analyst (N2 Up)</a>
                            </h4>
                            <p>
                              by <span className="fw500 text">HuyPN</span> in
                              Design & Creative
                            </p>
                          </div>
                        </div>
                        <ul className="job-other-info d-sm-flex ms-0 at-jsv6 mt30">
                          <li className="time">Full Time</li>
                          <li className="time2">Da Nang, Viet Nam</li>
                          <li className="time2">11 hours ago</li>
                          <li className="time2">450 - $900/month</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sidebar-column col-lg-4 col-md-12 col-sm-12">
                <aside className="sidebar">
                  <div className="sidebar-widget at-jsv6 text-center">
                    <h4 className="fz20 fw500 mb10">Application ends</h4>
                    <p className="text mb15">May 18, 2026</p>
                    <div className="btn-box mb-0">
                      {/* <a href="#" className="theme-btn btn-style-one">
                        Apply For Job{" "}
                        <i className="fal fa-long-arrow-right ms-3"></i>
                      </a> */}
                      <LoadingButton
                        className="theme-btn btn-style-one"
                        type="button"
                        onClick={handleClick}
                        loading={loading}
                      >
                        <MoveUpRight className="size-4 " />
                        Apply For Job
                      </LoadingButton>
                    </div>
                  </div>
                  <div className="sidebar-widget company-widget at-jsv6">
                    <div className="widget-content">
                      <div className="company-title">
                        <div className="company-logo">
                          <img src="images/resource/company-7.png" alt="" />
                        </div>
                        <h5 className="company-name">InVision</h5>
                        <a href="#" className="profile-link">
                          View company profile
                        </a>
                      </div>
                      <ul className="company-info">
                        <li>
                          Primary industry: <span>Software</span>
                        </li>
                        <li>
                          Company size: <span>501-1,000</span>
                        </li>
                        <li>
                          Founded in: <span>2011</span>
                        </li>
                        <li>
                          Phone: <span>123 456 7890</span>
                        </li>
                        <li>
                          Email: <span>info@joio.com</span>
                        </li>
                        <li>
                          Location: <span>Da Nang, Viet Nam</span>
                        </li>
                      </ul>
                      <div className="btn-box">
                        <a href="#" className="theme-btn btn-style-three">
                          www.invisionapp.com
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
                        <li>
                          <a href="#">Marketing Jobs</a>
                        </li>
                        <li>
                          <a href="#">Designer</a>
                        </li>
                        <li>
                          <a href="#">Engineering</a>
                        </li>
                        <li>
                          <a href="#">Developer</a>
                        </li>
                        <li>
                          <a href="#">Security Jobs</a>
                        </li>
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

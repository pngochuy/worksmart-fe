import LocationMap from "@/components/LocationMap";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchCompanyDetails } from "@/services/employerServices";

export const Index = () => {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [companyJobs, setCompanyJobs] = useState([]);
  const { companyName } = useParams(); // Lấy companyName từ URL

  useEffect(() => {
    const fetchCompanyDetail = async () => {
      setLoading(true);
      try {
        // Sử dụng companyName từ URL nếu có, nếu không thì dùng "Tech Corp" hoặc giá trị mặc định
        const name = companyName || "Tech Corp";
        const data = await fetchCompanyDetails(name);

        if (data) {
          console.log("Company data fetched:", data);
          setCompany(data);

          // Nếu API trả về danh sách jobs
          if (data.postedJobs) {
            // Lọc chỉ lấy các job có status là 3 (ACTIVE)
            const activeJobs = data.postedJobs.filter(
              (job) => job.status === 3
            );
            setCompanyJobs(activeJobs);
          }
        }
      } catch (error) {
        console.error("Error fetching company details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyDetail();
  }, [companyName]);

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner"></div>
        <p>Loading company information...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div
        className="error-message"
        style={{ marginTop: "100px", textAlign: "center" }}
      >
        <h3>Company Not Found</h3>
        <p>Sorry, we couldn&apos;t find information for this company.</p>
      </div>
    );
  }

  return (
    <>
      {/* Job Detail Section */}
      <section className="job-detail-section" style={{ marginTop: "100px" }}>
        {/* Upper Box */}
        <div className="upper-box">
          <div className="auto-container">
            {/* Job Block */}
            <div className="job-block-seven">
              <div className="inner-box">
                <div className="content">
                  <span className="company-logo">
                    <img
                      src={company.avatar || "https://via.placeholder.com/150"}
                      alt={company.companyName}
                      style={{ maxWidth: "100px", maxHeight: "100px" }}
                    />
                  </span>
                  <h4>
                    <a href="#">{company.companyName}</a>
                  </h4>
                  <ul className="job-info">
                    <li>
                      <span className="icon flaticon-map-locator"></span>{" "}
                      {company.address || "No address provided"}
                    </li>
                    <li>
                      <span className="icon flaticon-briefcase"></span>{" "}
                      {company.industry || "Industry not specified"}
                    </li>
                    <li>
                      <span className="icon flaticon-telephone-1"></span>{" "}
                      {company.phoneNumber || "No phone provided"}
                    </li>
                    <li>
                      <span className="icon flaticon-mail"></span>{" "}
                      {company.email || "No email provided"}
                    </li>
                  </ul>
                  <ul className="job-other-info">
                    <li className="time">Open Jobs – {companyJobs.length}</li>
                  </ul>
                </div>

                <div className="btn-box">
                  {company.companyWebsite && (
                    <a
                      href={company.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="theme-btn btn-style-one"
                    >
                      Visit Website
                    </a>
                  )}
                  <button className="bookmark-btn">
                    <i className="flaticon-bookmark"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="job-detail-outer">
          <div className="auto-container">
            <div className="row">
              <div className="content-column col-lg-8 col-md-12 col-sm-12">
                <div className="job-detail">
                  <h4>About Company</h4>
                  {company.companyDescription ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: company.companyDescription,
                      }}
                    />
                  ) : (
                    <>
                      <p>
                        {company.companyName} is a company in the{" "}
                        {company.industry || "technology"} industry.
                      </p>
                      <p>
                        For more information, please visit their website or
                        contact them directly.
                      </p>
                    </>
                  )}

                  {/* Company Images Section - If you have company images */}
                  {/* <div className="row images-outer">
                    <div className="col-lg-3 col-md-3 col-sm-6">
                      <figure className="image">
                        <a
                          href="images/resource/employers-single-1.png"
                          className="lightbox-image"
                          data-fancybox="gallery"
                        >
                          <img
                            src="images/resource/employers-single-1.png"
                            alt="Company office"
                          />
                        </a>
                      </figure>
                    </div>
                    <div className="col-lg-3 col-md-3 col-sm-6">
                      <figure className="image">
                        <a
                          href="images/resource/employers-single-2.png"
                          className="lightbox-image"
                          data-fancybox="gallery"
                        >
                          <img
                            src="images/resource/employers-single-2.png"
                            alt="Company workspace"
                          />
                        </a>
                      </figure>
                    </div>
                    <div className="col-lg-3 col-md-3 col-sm-6">
                      <figure className="image">
                        <a
                          href="images/resource/employers-single-3.png"
                          className="lightbox-image"
                          data-fancybox="gallery"
                        >
                          <img
                            src="images/resource/employers-single-3.png"
                            alt="Company meeting"
                          />
                        </a>
                      </figure>
                    </div>
                    <div className="col-lg-3 col-md-3 col-sm-6">
                      <figure className="image">
                        <a
                          href="images/resource/employers-single-4.png"
                          className="lightbox-image"
                          data-fancybox="gallery"
                        >
                          <img
                            src="images/resource/employers-single-4.png"
                            alt="Company team"
                          />
                        </a>
                      </figure>
                    </div>
                  </div> */}
                </div>

                {/* Related Jobs */}
                {companyJobs.length > 0 && (
                  <div className="related-jobs">
                    <div className="title-box">
                      <h3>
                        {companyJobs.length} jobs at {company.companyName}
                      </h3>
                      <div className="text">
                        Apply now to work at {company.companyName}
                      </div>
                    </div>

                    {/* Job Blocks */}
                    {companyJobs.map((job) => (
                      <div className="job-block" key={job.jobID}>
                        <div className="inner-box">
                          <div className="content">
                            <span className="company-logo">
                              <img
                                src={
                                  company.avatar ||
                                  "https://via.placeholder.com/150"
                                }
                                alt={company.companyName}
                              />
                            </span>
                            <h4>
                              <a href={`/jobs/${job.jobID}`}>{job.title}</a>
                            </h4>
                            <ul className="job-info">
                              <li>
                                <span className="icon flaticon-briefcase"></span>{" "}
                                {company.companyName}
                              </li>
                              <li>
                                <span className="icon flaticon-map-locator"></span>{" "}
                                {job.location}
                              </li>
                              <li>
                                <span className="icon flaticon-clock-3"></span>{" "}
                                {new Date(job.createdAt).toLocaleDateString()}
                              </li>
                              <li>
                                <span className="icon flaticon-money"></span>{" "}
                                {job.salary}
                              </li>
                            </ul>
                            <ul className="job-other-info">
                              <li className="time">{job.workType}</li>
                              {job.priority && (
                                <li className="required">Featured</li>
                              )}
                            </ul>
                            <button className="bookmark-btn">
                              <span className="flaticon-bookmark"></span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="sidebar-column col-lg-4 col-md-12 col-sm-12">
                <aside className="sidebar">
                  <div className="sidebar-widget company-widget">
                    <div className="widget-content">
                      <ul className="company-info mt-0">
                        <li>
                          Primary industry:{" "}
                          <span>{company.industry || "Not specified"}</span>
                        </li>
                        <li>
                          Company size:{" "}
                          <span>{company.companySize || "Not specified"}</span>
                        </li>
                        <li>
                          Founded in:{" "}
                          <span>{company.foundedYear || "Not specified"}</span>
                        </li>
                        <li>
                          Phone:{" "}
                          <span>{company.phoneNumber || "Not provided"}</span>
                        </li>
                        <li>
                          Email: <span>{company.email || "Not provided"}</span>
                        </li>
                        <li>
                          Location:{" "}
                          <span>
                            {company.workLocation ||
                              company.address ||
                              "Not specified"}
                          </span>
                        </li>
                        <li>
                          Social media:
                          <div className="social-links">
                            <a href="#">
                              <i className="fab fa-facebook-f"></i>
                            </a>
                            <a href="#">
                              <i className="fab fa-twitter"></i>
                            </a>
                            <a href="#">
                              <i className="fab fa-instagram"></i>
                            </a>
                            <a href="#">
                              <i className="fab fa-linkedin-in"></i>
                            </a>
                          </div>
                        </li>
                      </ul>

                      {company.companyWebsite && (
                        <div className="btn-box">
                          <a
                            href={company.companyWebsite}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="theme-btn btn-style-three"
                          >
                            {company.companyWebsite}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  <LocationMap
                    address={
                      company.address ||
                      company.workLocation ||
                      "Ha Noi, Vietnam"
                    }
                    companyName={company.companyName}
                  />
                </aside>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Loading and Error Styles */}
      <style>{`
        .loading-overlay {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 60vh;
          margin-top: 100px;
        }

        .loading-spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border-left-color: #09f;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .error-message {
          background-color: #fff3cd;
          border: 1px solid #ffeeba;
          padding: 20px;
          border-radius: 5px;
          max-width: 500px;
          margin: 100px auto 0;
        }

        .error-message h3 {
          color: #856404;
          margin-bottom: 10px;
        }
      `}</style>
    </>
  );
};

export default Index;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllJobs } from "@/services/jobServices";

const hoverStyles = {
  transition: 'all 0.3s ease',
};

export const JobSection = () => {
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      try {
        const jobs = await getAllJobs();
        // Lọc jobs có priority = true và chỉ lấy 2 job
        const priorityJobs = jobs
          .filter(job => job.priority)
          .slice(0, 2);
        setFeaturedJobs(priorityJobs);
        console.log("Featured jobs:", priorityJobs);
      } catch (error) {
        console.error("Error fetching featured jobs:", error);
      }
    };

    fetchFeaturedJobs();
  }, []);

  return (
    <section className="job-section pt-0">
      <div className="auto-container">
        <div className="sec-title text-center wow fadeInUp">
          <h2>Featured Jobs</h2>
          <div className="text">
            Know your worth and find the job that qualify your life
          </div>

        </div>
        <div className="row wow fadeInUp justify-content-center">
          {featuredJobs.map((job) => (
            <div
              key={job.jobID}
              className="job-block at-jlv16 col-sm-6"
              onClick={() => navigate(`/job-list/${job.jobID}`)}
              style={{ cursor: 'pointer' }}
            >
              <div
                className="inner-box"
                style={{
                  ...hoverStyles,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="content ps-0">
                  <div className="d-xl-flex align-items-center">
                    <span className="company-logo position-relative">
                      <img src={job.avatar} alt={job.title} />
                    </span>
                    <div className="ms-0 ms-xl-3 mt-3 mt-xl-0">
                      <h4 className="fz20 mb-2 mb-lg-0">
                        <a>{job.title}</a>
                      </h4>
                    </div>
                  </div>
                  <ul className="job-other-info at-jsv6 at-jsv17 mt20 ms-0">
                    <li className="time">{job.workType}</li>
                    <li className="time2">{job.location}</li>
                    <li className="time2">{job.education}</li>
                    <li className="time2">Posted: {new Date(job.createdAt).toLocaleDateString()}</li>
                    <li className="time2">Salary: {job.salary}</li>
                    <li className="time2">Category: {job.categoryID}</li>
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* <a href="" className="text ud-btn2">
          View All Job <i className="fal fa-long-arrow-right"></i>
        </a> */}
      </div>
    </section>
  );
};

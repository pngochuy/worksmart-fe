import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchJobDetails } from '../../../services/jobService';
import FavoriteButton from './FavoriteButton';

const JobDetail = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getJobDetails = async () => {
      if (!jobId) return;
      
      try {
        setIsLoading(true);
        const jobData = await fetchJobDetails(jobId);
        setJob(jobData);
        setError(null);
      } catch (err) {
        console.error("Error fetching job details:", err);
        setError("Could not load job details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    getJobDetails();
  }, [jobId]);

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  if (!job) {
    return (
      <div className="alert alert-warning" role="alert">
        Job not found
      </div>
    );
  }

  return (
    <div className="job-detail-wrapper">
      <div className="auto-container">
        <div className="job-block-seven">
          <div className="inner-box">
            <div className="content">
              <span className="company-logo">
                <img src={job.logo || "images/resource/company-logo/1-1.png"} alt={job.companyName} />
              </span>
              <h4>{job.title}</h4>
              
              <ul className="job-info">
                <li>
                  <span className="icon flaticon-briefcase"></span>
                  {job.companyName}
                </li>
                <li>
                  <span className="icon flaticon-map-locator"></span>
                  {job.location}
                </li>
                <li>
                  <span className="icon flaticon-clock-3"></span>
                  {job.jobType}
                </li>
                <li>
                  <span className="icon flaticon-money"></span>
                  {job.salary}
                </li>
              </ul>
              
              <ul className="job-other-info">
                <li className={job.status === 'Active' ? 'green' : 'red'}>{job.status}</li>
                <li className="time">{job.jobType}</li>
              </ul>
            </div>

            <div className="btn-box">
              {/* Thêm nút Favorite */}
              <FavoriteButton jobId={job.id} />
              
              <a href="#" className="theme-btn btn-style-one">Apply For Job</a>
            </div>
          </div>
        </div>
      </div>

      <div className="job-detail-section">
        <div className="auto-container">
          <div className="row">
            <div className="content-column col-lg-8 col-md-12 col-sm-12">
              <div className="job-detail">
                <h4>Job Description</h4>
                <p>{job.description}</p>

                {job.responsibilities && job.responsibilities.length > 0 && (
                  <>
                    <h4>Key Responsibilities</h4>
                    <ul className="list-style-three">
                      {job.responsibilities.map((responsibility, index) => (
                        <li key={index}>{responsibility}</li>
                      ))}
                    </ul>
                  </>
                )}

                {job.requirements && job.requirements.length > 0 && (
                  <>
                    <h4>Requirements</h4>
                    <ul className="list-style-three">
                      {job.requirements.map((requirement, index) => (
                        <li key={index}>{requirement}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              <div className="other-options">
                <div className="social-share">
                  <h5>Share this job</h5>
                  <a href="#" className="facebook"><i className="fab fa-facebook-f"></i> Facebook</a>
                  <a href="#" className="twitter"><i className="fab fa-twitter"></i> Twitter</a>
                  <a href="#" className="linkedin"><i className="fab fa-linkedin-in"></i> Linkedin</a>
                </div>
              </div>
            </div>

            <div className="sidebar-column col-lg-4 col-md-12 col-sm-12">
              <div className="sidebar">
                <div className="sidebar-widget company-widget">
                  <div className="widget-content">
                    <div className="company-title">
                      <div className="company-logo">
                        <img src={job.logo || "images/resource/company-logo/1-1.png"} alt="" />
                      </div>
                      <h5 className="company-name">{job.companyName}</h5>
                      <a href="#" className="profile-link">View company profile</a>
                    </div>

                    <div className="company-info">
                      <ul>
                        <li>Industry: <span>{job.industry || 'N/A'}</span></li>
                        <li>Company size: <span>{job.companySize || 'N/A'}</span></li>
                        <li>Founded in: <span>{job.foundedYear || 'N/A'}</span></li>
                        <li>Location: <span>{job.location || 'N/A'}</span></li>
                        {job.website && <li>Website: <a href={job.website}>{job.website}</a></li>}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
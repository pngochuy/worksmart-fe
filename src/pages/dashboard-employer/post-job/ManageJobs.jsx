import React, { useState, useEffect } from "react";
import { createJob, getAllJobs, deleteJob } from "../../../services/jobServices";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const JobForm = () => {
  const navigate = useNavigate();

  // State for form input
  const [jobData, setJobData] = useState({
    title: "",
    description: "",
    location: "",
    salary: "",
  });

  // State for job list
  const [jobs, setJobs] = useState([]);

  // Fetch jobs from API
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const data = await getAllJobs();
      setJobs(data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    setJobData({ ...jobData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createJob(jobData);
      toast.success("Job posted successfully!");
      setJobData({ title: "", description: "", location: "", salary: "" });
      fetchJobs(); // Refresh job list
    } catch (error) {
      console.error("Error posting job:", error);
      toast.error("Failed to post job.");
    }
  };

  // Handle delete job
  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await deleteJob(jobId);
      toast.success("Job deleted successfully!");
      fetchJobs(); // Refresh job list
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Failed to delete job.");
    }
  };

  // Handle navigate to job detail
  const handleJobClick = (jobId) => {
    navigate(`/job-list/${jobId}`);
  };

  return (
    <section className="user-dashboard">
      <div className="dashboard-outer">
        {/* Post Job Form */}
        <h3>Post a New Job!</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Job Title</label>
            <input
              type="text"
              name="title"
              value={jobData.title}
              onChange={handleChange}
              placeholder="Title"
              required
            />
          </div>
          <div className="form-group">
            <label>Job Description</label>
            <textarea
              name="description"
              value={jobData.description}
              onChange={handleChange}
              placeholder="Description"
              required
            ></textarea>
          </div>
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={jobData.location}
              onChange={handleChange}
              placeholder="Location"
              required
            />
          </div>
          <div className="form-group">
            <label>Salary</label>
            <input
              type="number"
              name="salary"
              value={jobData.salary}
              onChange={handleChange}
              placeholder="Salary"
              required
            />
          </div>

          <button type="submit" className="theme-btn btn-style-one">
            Post Job
          </button>
        </form>

        {/* Job Listings Table */}
        <div className="job-list mt-5">
          <h3>Job Listings</h3>
          {jobs.length === 0 ? (
            <p>No jobs available.</p>
          ) : (
            <table className="default-table manage-job-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Location</th>
                  <th>Salary</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.jobID}>
                    <td onClick={() => handleJobClick(job.jobID)}>
                      <strong>{job.title}</strong>
                    </td>
                    <td>{job.description.substring(0, 50)}...</td>
                    <td>{job.location}</td>
                    <td>${job.salary}</td>
                    <td>
                    <button className="edit-btn" onClick={() => navigate(`/employer/manage-jobs/edit/${job.jobID}`)}>
                        ✏️ Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(job.jobID)}
                      >
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
};

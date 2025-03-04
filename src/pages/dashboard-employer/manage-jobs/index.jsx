import React, { useEffect, useState } from "react";
import { getAllJobs, deleteJob } from "../../../services/jobServices";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function ManageJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const data = await getAllJobs();
      setJobs(data);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      toast.error("Failed to fetch jobs.");
    } finally {
      setLoading(false);
    }
  };

  // Xóa công việc
  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await deleteJob(jobId);
      toast.success("Job deleted successfully!");
      fetchJobs(); // Cập nhật lại danh sách công việc
    } catch (error) {
      console.error("Failed to delete job:", error);
      toast.error("Failed to delete job.");
    }
  };

  // Chỉnh sửa công việc
  const handleEdit = (jobId) => {
    navigate(`/employer/manage-jobs/edit/${jobId}`);
  };

  if (loading) {
    return <p>Loading jobs...</p>;
  }

  return (
    <section className="user-dashboard">
      <div className="dashboard-outer">
        <div className="upper-title-box">
          <h3>Manage Jobs</h3>
          <div className="text">Here are your job postings</div>
        </div>

        <div className="row">
          <div className="col-lg-12">
            <div className="ls-widget">
              <div className="tabs-box">
                <div className="widget-title">
                  <h4>Job Listings</h4>
                </div>

                <div className="widget-content">
                  <div className="table-outer">
                    <table className="default-table manage-job-table">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Location</th>
                          <th>Salary</th>
                          <th>Status</th>
                          <th>Created At</th>
                          <th>Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {jobs.length > 0 ? (
                          jobs.map((job) => (
                            <tr key={job.jobID}>
                              <td>{job.title}</td>
                              <td>{job.location}</td>
                              <td>${job.salary ? job.salary.toLocaleString() : "Negotiable"}</td>
                              <td>
                                {job.status === 1 ? (
                                  <span className="badge badge-success">Active</span>
                                ) : (
                                  <span className="badge badge-warning">Inactive</span>
                                )}
                              </td>
                              <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                              <td>
                                <button className="edit-btn" onClick={() => handleEdit(job.jobID)}>✏️ Edit</button>
                                <button className="delete-btn" onClick={() => handleDelete(job.jobID)}>🗑️ Delete</button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6">No jobs found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { useEffect, useState } from "react";
import {
  deleteJob,
  fetchJobs,
  fetchCandidatesForJob,
} from "../../../services/jobServices";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Pagination from "./Pagination";
import "../../../assets/styles/SearchJob/ManageJobsPage.css";

export default function ManageJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [totalPage, setTotalPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [candidateCounts, setCandidateCounts] = useState({});
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    PageIndex: 1,
    PageSize: 3,
    title: "",
  });

  useEffect(() => {
    getJobs();
  }, [searchParams.PageSize, searchParams.PageIndex, searchParams.title]);

  // Định dạng ngày tháng theo format DD/MM/YYYY HH:MM
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const getJobs = async () => {
    try {
      console.log("searchParams", searchParams);
      const data = await fetchJobs(searchParams); // Fetch jobs from the API
      setJobs(data.jobs); // Update jobs list
      setTotalPage(data.totalPage); // Update total pages for pagination

      // Fetch candidate counts for each job
      const counts = {};
      for (const job of data.jobs) {
        try {
          const candidates = await fetchCandidatesForJob(job.jobID);
          counts[job.jobID] = candidates.length;
        } catch (error) {
          console.error(
            `Failed to fetch candidates for job ${job.jobID}:`,
            error
          );
          counts[job.jobID] = 0;
        }
      }
      setCandidateCounts(counts);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      setLoading(false);
    }
  };

  // Xóa công việc
  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await deleteJob(jobId);
      toast.success("Job deleted successfully!");
      getJobs();
    } catch (error) {
      console.error("Failed to delete job:", error);
      toast.error("Failed to delete job.");
    }
  };

  const handleEdit = (jobId) => {
    navigate(`/employer/manage-jobs/edit/${jobId}`);
  };

  const handleViewCandidates = (jobId) => {
    navigate(`/employer/manage-jobs/applied-candidates/${jobId}`);
  };

  // Function to get the appropriate button text based on candidate count
  const getCandidateButtonText = (jobId) => {
    const count = candidateCounts[jobId] || 0;
    return count <= 1 ? "View Candidate" : "View Candidates";
  };

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
                <div className="widget-title d-flex justify-content-between align-items-center">
                  <h4>Job Listings</h4>

                  {/* Improved search input positioned on the right */}
                  <div className="search-box-container">
                    <div className="search-input-wrapper">
                      <input
                        type="text"
                        className="form-control search-input"
                        placeholder="Search by job title"
                        value={searchParams.title}
                        onChange={(e) =>
                          setSearchParams({
                            ...searchParams,
                            title: e.target.value,
                          })
                        }
                      />
                      <span className="search-icon">🔍</span>
                    </div>
                  </div>
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
                          <th>WorkType</th>
                          <th>Priority</th>
                          <th>Created At</th>
                          <th>Expired At</th>
                          <th>Number Of Recruitment</th>
                          <th>Actions</th>
                          <th>Candidates</th>
                        </tr>
                      </thead>

                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan="11">Loading...</td>
                          </tr>
                        ) : jobs.length > 0 ? (
                          jobs.map((job) => (
                            <tr key={job.jobID}>
                              {/* These cells will trigger edit when clicked */}
                              <td
                                onClick={() => handleEdit(job.jobID)}
                                className="clickable-cell"
                              >
                                {job.title}
                              </td>
                              <td
                                onClick={() => handleEdit(job.jobID)}
                                className="clickable-cell"
                              >
                                {job.location}
                              </td>
                              <td
                                onClick={() => handleEdit(job.jobID)}
                                className="clickable-cell"
                              >
                                $
                                {job.salary
                                  ? job.salary.toLocaleString()
                                  : "Negotiable"}
                              </td>
                              <td
                                onClick={() => handleEdit(job.jobID)}
                                className="clickable-cell"
                              >
                                {job.status === 1 ? "Active" : "Inactive"}
                              </td>
                              <td
                                onClick={() => handleEdit(job.jobID)}
                                className="clickable-cell"
                              >
                                {job.workType}
                              </td>
                              <td
                                onClick={() => handleEdit(job.jobID)}
                                className="clickable-cell"
                              >
                                {job.priority ? "High" : "Low"}
                              </td>
                              <td
                                onClick={() => handleEdit(job.jobID)}
                                className="clickable-cell"
                              >
                                {formatDateTime(job.createdAt)}
                              </td>
                              <td
                                onClick={() => handleEdit(job.jobID)}
                                className="clickable-cell"
                              >
                                {formatDateTime(job.deadline)}
                              </td>
                              <td
                                onClick={() => handleEdit(job.jobID)}
                                className="clickable-cell"
                              >
                                {job.numberOfRecruitment}
                              </td>

                              {/* These cells will NOT trigger edit when clicked */}
                              <td>
                                <button
                                  className="edit-btn"
                                  onClick={() => handleEdit(job.jobID)}
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  className="delete-btn"
                                  onClick={() => handleDelete(job.jobID)}
                                >
                                  🗑️ Delete
                                </button>
                              </td>
                              <td>
                                <button
                                  className="view-candidates-btn"
                                  onClick={() =>
                                    handleViewCandidates(job.jobID)
                                  }
                                >
                                  {getCandidateButtonText(job.jobID)}
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="11">No jobs found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>

                    {/* Pagination */}
                    <Pagination
                      currentPage={searchParams.PageIndex}
                      totalPage={totalPage}
                      setSearchParams={setSearchParams}
                    />
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

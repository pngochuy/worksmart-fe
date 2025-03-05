import React, { useEffect, useState } from "react";
import { deleteJob, fetchJobs } from "../../../services/jobServices";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Pagination from "./Pagination";

export default function ManageJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [totalPage, setTotalPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    PageIndex: 1,
    PageSize: 3,
    title: "",  // Tìm kiếm theo tên công việc // Tìm kiếm theo vị trí công việc
  });

  useEffect(() => {
    getJobs();
  }, [searchParams.PageSize, searchParams.PageIndex, searchParams.title, searchParams.location]);  // Thêm title và location vào dependencies

  const getJobs = async () => {
    try {
      console.log("searchParams", searchParams);
      const data = await fetchJobs(searchParams);  // Truyền tham số tìm kiếm vào API
      console.log("data", data);
      setJobs(data.jobs);  // Cập nhật danh sách công việc
      setTotalPage(data.totalPage);  // Cập nhật tổng số trang cho phân trang
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    }
  };

  // Xóa công việc
  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await deleteJob(jobId);
      toast.success("Job deleted successfully!");
      getJobs(); // Cập nhật lại danh sách công việc
    } catch (error) {
      console.error("Failed to delete job:", error);
      toast.error("Failed to delete job.");
    }
  };

  // Chỉnh sửa công việc
  const handleEdit = (jobId) => {
    navigate(`/employer/manage-jobs/edit/${jobId}`);
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
                <div className="widget-title">
                  <h4>Job Listings</h4>
                </div>
                  <div className="search-box col-lg-12 col-md-12">
                    <input
                      type="text"
                      placeholder="Search by job title"
                      value={searchParams.title}
                      onChange={(e) => setSearchParams({ ...searchParams, title: e.target.value })}

                    />
                    {/* <input
                    type="text"
                    placeholder="Search by location"
                    value={searchParams.location}
                    onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
                  /> */}
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
                          <th>Number Of Recruitment </th>
                          <th>Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {jobs.length > 0 ? (
                          jobs.map((job) => (
                            <tr key={job.jobID}
                              className="clickable-row"
                              onClick={() => navigate(`/employer/manage-jobs/edit/${job.jobID}`)}
                              style={{ cursor: "pointer" }}
                            >
                              <td>{job.title}</td>
                              <td>{job.location}</td>
                              <td>${job.salary ? job.salary.toLocaleString() : "Negotiable"}</td>
                              <td style={{ color: job.status === 1 ? "green" : "orange", fontWeight: "bold" }}>
                                {job.status === 1 ? "Active" : "Inactive"}
                              </td>
                              <td>{job.workType}</td>
                              <td>
                                {job.priority ? (
                                  <span style={{ color: "green", fontWeight: "bold" }}>High</span>
                                ) : (
                                  <span style={{ color: "orange", fontWeight: "bold" }}>Low</span>
                                )}
                              </td>
                              <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                              <td>{new Date(job.deadline).toLocaleDateString()}</td>
                              <td>{job.numberOfRecruitment}</td>
                              <td>
                                <button className="edit-btn" onClick={() => handleEdit(job.jobID)}>✏️ Edit</button>
                                <button className="delete-btn" onClick={() => handleDelete(job.jobID)}>🗑️ Delete</button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="9">No jobs found</td>
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

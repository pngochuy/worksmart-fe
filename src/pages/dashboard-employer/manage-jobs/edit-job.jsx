import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJobById, updateJob } from "../../../services/jobServices";
import { toast } from "react-toastify";

const EditJobPage = () => {
  const { jobId } = useParams(); // Lấy jobId từ URL
  const navigate = useNavigate();
  const [jobData, setJobData] = useState({
    title: "",
    description: "",
    level: "",
    education: "",
    numberOfRecruitment: 1,
    workType: "",
    location: "",
    salary: "",
    exp: "",
    priority: false,
    deadline: "",
  });

  // Fetch job data by ID
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const data = await getJobById(jobId);
        // Ensure the deadline is in correct format for the input type="date"
        const formattedDeadline = data.deadline
          ? new Date(data.deadline).toLocaleDateString("en-CA") // "en-CA" cho định dạng YYYY-MM-DD
          : "";

        setJobData((prevState) => ({
          ...prevState,
          ...data, // Spread other job data
          deadline: formattedDeadline, // Set formatted deadline
        }));
        console.log("Job data:", data.deadline);
      } catch (error) {
        console.error("Error fetching job:", error);
        toast.error("Failed to fetch job details.");
      }
    };

    fetchJob();
  }, [jobId]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setJobData({
      ...jobData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateJob(jobId, jobData);
      toast.success("Job updated successfully!");
      navigate("/employer/manage-jobs"); // Điều hướng về trang danh sách job
    } catch (error) {
      console.error("Error updating job:", error);
      toast.error("Failed to update job.");
    }
  };

  return (
    <section className="user-dashboard">
      <div className="dashboard-outer">
        <div className="upper-title-box">
          <h3>Edit Job</h3>
          <div className="text">Update in the job details below</div>
        </div>

        <div className="row">
          <div className="col-lg-12">
            {/*  */}
            {/* Ls widget */}
            <div className="ls-widget">
              <div className="tabs-box">
                <div className="widget-title">
                  <h4>Post Job</h4>
                </div>
                <div className="widget-content">
                  <form onSubmit={handleSubmit} className="default-form">
                    <div className="row">
                      <div className="form-group col-lg-12 col-md-12">
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

                      <div className="form-group col-lg-12 col-md-12">
                        <label>Job Description</label>
                        <textarea
                          name="description"
                          value={jobData.description}
                          onChange={handleChange}
                          placeholder="Description"
                          required
                        />
                      </div>

                      <div className="form-group col-lg-6 col-md-12">
                        <label>Education</label>
                        <input
                          type="text"
                          name="education"
                          value={jobData.education}
                          onChange={handleChange}
                          placeholder="Education level"
                        />
                      </div>

                      <div className="form-group col-lg-6 col-md-12">
                        <label>Experience (years)</label>
                        <input
                          type="number"
                          name="exp"
                          value={jobData.exp}
                          onChange={handleChange}
                          min="0"
                          placeholder="Experience required"
                        />
                      </div>

                      <div className="form-group col-lg-6 col-md-12">
                        <label>Work Type</label>
                        <select
                          name="workType"
                          value={jobData.workType}
                          onChange={handleChange}
                        >
                          <option value="">Select</option>
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Freelance">Freelance</option>
                        </select>
                      </div>

                      <div className="form-group col-lg-6 col-md-12">
                        <label>Location</label>
                        <input
                          type="text"
                          name="location"
                          value={jobData.location}
                          onChange={handleChange}
                          placeholder="Location"
                        />
                      </div>

                      <div className="form-group col-lg-6 col-md-12">
                        <label>Salary ($)</label>
                        <input
                          type="number"
                          name="salary"
                          value={jobData.salary}
                          onChange={handleChange}
                          min="0"
                          placeholder="Salary"
                        />
                      </div>

                      <div className="form-group col-lg-6 col-md-12">
                        <label style={{ display: "block" }}>Deadline</label>
                        <input
                          type="date"
                          name="deadline"
                          value={jobData.deadline.split("T")[0]} // Lấy phần ngày, bỏ giờ ra
                          onChange={handleChange}
                          min={new Date().toISOString().split("T")[0]} // Giới hạn chỉ có thể chọn ngày hôm nay hoặc ngày trong tương lai
                        />
                      </div>

                      <div className="form-group form-group col-lg-12 col-md-12">
                        <label>
                          <input
                            type="checkbox"
                            name="priority"
                            checked={jobData.priority}
                            onChange={handleChange}
                          />
                          &nbsp; High Priority Job
                        </label>
                      </div>
                    </div>
                    <div className="form-group text-right">
                      <button type="submit" className="theme-btn btn-style-one">
                        Update Job
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EditJobPage;

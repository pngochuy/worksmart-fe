import React, { useState, useEffect } from "react";
import { createJob } from "../../../services/jobServices";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const JobForm = () => {
  const user = JSON.parse(localStorage.getItem("userLoginData"));
  const userID = user?.userID || null; 
  const [jobData, setJobData] = useState({
    userID: userID, 
    jobTagID: 1, 
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

  const navigate = useNavigate();

  // Update userID in state when component loads
  useEffect(() => {
    setJobData((prevState) => ({
      ...prevState,
      userID: userID,
    }));
  }, [userID]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setJobData({
      ...jobData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // if (!jobData.userID) {
      //   console.log(jobData.userID)
      //   toast.error("You are not logged in. Please log in before posting a job!");
      //   return;
      // }
      console.log(jobData)
      await createJob(jobData);
      toast.success("Job created successfully!");
      navigate("/employer/manage-jobs");
    } catch (error) {
      console.error("Error creating job:", error);
      toast.error("Failed to create job. Please try again!");
    }
  };

  return (
    <section className="user-dashboard">
      <div className="dashboard-outer">
        <div className="upper-title-box">
          <h3>Post a New Job</h3>
          <div className="text">Fill in the job details below:</div>
        </div>

        <form onSubmit={handleSubmit} className="default-form">
          <div className="row">
            <div className="form-group col-lg-12 col-md-12">
              <label>Job Title</label>
              <input
                type="text"
                name="title"
                value={jobData.title}
                onChange={handleChange}
                placeholder="Enter job title"
                required
              />
            </div>

            <div className="form-group col-lg-12 col-md-12">
              <label>Job Description</label>
              <textarea
                name="description"
                value={jobData.description}
                onChange={handleChange}
                placeholder="Enter job description"
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
                placeholder="Required education level"
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
                placeholder="Years of experience required"
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
                placeholder="Enter job location"
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
                placeholder="Enter salary"
              />
            </div>

            <div className="form-group col-lg-6 col-md-12">
              <label>Deadline</label>
              <input
                type="date"
                name="deadline"
                value={jobData.deadline}
                onChange={handleChange}
              />
            </div>

            <div className="form-group col-lg-12 col-md-12">
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

            <div className="form-group col-lg-12 col-md-12 text-right">
              <button type="submit" className="theme-btn btn-style-one">
                Create Job
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

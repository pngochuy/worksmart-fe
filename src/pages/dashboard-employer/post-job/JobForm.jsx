import React, { useState, useEffect } from "react";
import { createJob, checkLimitCreateJob } from "../../../services/jobServices";
import { toast } from "react-toastify";
import { fetchTags } from "../../../services/tagServices";
import { useNavigate } from "react-router-dom";
import { vietnamProvinces } from "../../../helpers/getLocationVN";
import TagDropdown from "./TagDropdown";
import LocationDropdown from "./LocationDropdown";
import CategoryDropdown from "./CategoryDropdown";
import { Editor } from "@tinymce/tinymce-react";

export const JobForm = () => {
  const API_TYNI_KEY = import.meta.env.VITE_TINY_API_KEY;
  const user = JSON.parse(localStorage.getItem("userLoginData"));
  const userID = user?.userID || null;
  
  const [jobData, setJobData] = useState({
    userID: userID,
    jobTagID: [],
    title: "",
    description: "",
    level: "",
    education: "",
    numberOfRecruitment: "",
    workType: "",
    location: [],
    salary: "",
    minSalary: "",
    exp: "",
    priority: false,
    deadline: "",
    jobPosition: "",
    categoryID: ""
  });

  // Add separate state for min-max salary
  const [salaryRange, setSalaryRange] = useState({
    minSalary: "",
    maxSalary: "",
  });

  const [tags, setTags] = useState([]);
  const [locations, setLocation] = useState([]);
  const [canCreateJob, setCanCreateJob] = useState(true);
  const [isCheckingLimit, setIsCheckingLimit] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // New state to prevent multiple submissions
  const navigate = useNavigate();

  // Check job creation limit and fetch tags - only run once on component mount
  useEffect(() => {
    const initialize = async () => {
      try {
        // Check job creation limit
        setIsCheckingLimit(true);
        if (userID) {
          const limitCheckResult = await checkLimitCreateJob(userID);
          setCanCreateJob(limitCheckResult);
        }

        // Fetch tags
        const tagsData = await fetchTags();
        setTags(tagsData);
        
        // Set locations
        setLocation(vietnamProvinces);
      } catch (error) {
        console.error("Error initializing form:", error);
        toast.error("An error occurred while loading data. Please try again later.");
      } finally {
        setIsCheckingLimit(false);
      }
    };

    initialize();
  }, [userID]); // Only depend on userID

  // Handle editor content change
  const handleEditorChange = (content) => {
    setJobData((prevData) => ({
      ...prevData,
      description: content,
    }));
  };

  // Update form information
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setJobData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setJobData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle salary range changes
  const handleSalaryChange = (e) => {
    const { name, value } = e.target;

    // Remove non-numeric characters
    const numericValue = value.replace(/[^\d]/g, "");

    setSalaryRange((prev) => ({
      ...prev,
      [name]: numericValue
        ? parseInt(numericValue, 10).toLocaleString("en-US")
        : "",
    }));

    // Update jobData.salary
    const updatedMinSalary =
      name === "minSalary"
        ? numericValue
        : salaryRange.minSalary.replace(/,/g, "");
    const updatedMaxSalary =
      name === "maxSalary"
        ? numericValue
        : salaryRange.maxSalary.replace(/,/g, "");

    if (updatedMinSalary && updatedMaxSalary) {
      setJobData((prev) => ({
        ...prev,
        salary: `${updatedMinSalary} - ${updatedMaxSalary}`,
      }));
    }
  };

  // Submit form with protection against multiple submissions
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent submission if already submitting or if user can't create jobs
    if (isSubmitting || !canCreateJob) {
      return;
    }

    // Validate salary data
    const minSalary = parseInt(salaryRange.minSalary.replace(/,/g, ""), 10);
    const maxSalary = parseInt(salaryRange.maxSalary.replace(/,/g, ""), 10);

    // Check if salary values are valid
    if (isNaN(minSalary) || isNaN(maxSalary)) {
      toast.error("Please enter valid salary values");
      return;
    }

    if (minSalary < 0 || maxSalary < 0) {
      toast.error("Salary cannot be negative");
      return;
    }

    if (minSalary > maxSalary) {
      toast.error("Minimum salary cannot be greater than maximum salary");
      return;
    }

    // Set submitting state to true to prevent multiple submissions
    setIsSubmitting(true);

    try {
      const updatedJobData = {
        ...jobData,
        salary: `${minSalary.toLocaleString(
          "en-US"
        )} - ${maxSalary.toLocaleString("en-US")}`
      };
      
      console.log("updatedJobData: ", updatedJobData);
      await createJob(updatedJobData);
      toast.success("Job created successfully!");
      navigate("/employer/manage-jobs");
    } catch (error) {
      console.error("Error creating job:", error);
      if (error.response && error.response.status === 403) {
        setCanCreateJob(false);
      } else {
        toast.error("Failed to create job. Please try again!");
      }
      // Reset submitting state to allow retry
      setIsSubmitting(false);
    }
  };

  // Display loading message while checking limit
  if (isCheckingLimit) {
    return (
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <h3>Post a New Job</h3>
            <div className="text">Checking job posting limit...</div>
          </div>
          <div className="row">
            <div className="col-lg-12 text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <p className="mt-3">Please wait a moment...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Display message when user has reached limit
  if (!canCreateJob) {
    return (
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <h3>Post a New Job</h3>
          </div>
          <div className="row">
            <div className="col-lg-12">
              <div className="ls-widget">
                <div className="widget-content">
                  <div className="alert alert-warning">
                    <h4 className="alert-heading">Job Posting Limit Reached!</h4>
                    <p>
                      You have reached the maximum number of jobs you can create today.
                      Please try again tomorrow or upgrade your subscription plan to post more jobs.
                    </p>
                    <hr />
                    <div className="d-flex justify-content-between">
                      <button 
                        className="btn btn-primary" 
                        onClick={() => navigate("/employer/manage-jobs")}
                      >
                        Back to Job Management
                      </button>
                      <button 
                        className="btn btn-success" 
                        onClick={() => navigate("/employer/subscription")}
                      >
                        Upgrade Subscription
                      </button>
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

  return (
    <section className="user-dashboard">
      <div className="dashboard-outer">
        <div className="upper-title-box">
          <h3>Post a New Job</h3>
          <div className="text">Fill in the job details below</div>
        </div>

        <div className="row">
          <div className="col-lg-12">
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
                          placeholder="Enter job title"
                          required
                        />
                      </div>

                      <div className="form-group col-lg-12 col-md-12">
                        <label>Job Description</label>
                        <Editor
                          apiKey={API_TYNI_KEY}
                          value={jobData.description}
                          init={{
                            height: 300,
                            menubar: false,
                            plugins: [
                              "advlist",
                              "autolink",
                              "lists",
                              "link",
                              "charmap",
                              "print",
                              "preview",
                              "anchor",
                              "searchreplace",
                              "visualblocks",
                              "code",
                              "fullscreen",
                              "insertdatetime",
                              "media",
                              "table",
                              "paste",
                              "help",
                              "wordcount",
                            ],
                            toolbar:
                              "undo redo | formatselect | bold italic backcolor | \
                              alignleft aligncenter alignright alignjustify | \
                              bullist numlist outdent indent | removeformat | help",
                          }}
                          onEditorChange={handleEditorChange}
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
                        <label>Number Of Recruitment</label>
                        <input
                          type="number"
                          name="numberOfRecruitment"
                          value={jobData.numberOfRecruitment}
                          onChange={handleChange}
                          placeholder="Required number of recruitment"
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
                          <option value="Full-Time">Full-Time</option>
                          <option value="Part-Time">Part-Time</option>
                          <option value="Contract">Contract</option>
                          <option value="Internship">Internship</option>
                          <option value="Remote">Remote</option>
                        </select>
                      </div>

                      <div className="form-group col-lg-6 col-md-12">
                        <label>Categories</label>
                        <CategoryDropdown setSearchParams={setJobData} />
                      </div>

                      <div className="form-group col-lg-6 col-md-12">
                        <label>Tags</label>
                        <TagDropdown
                          setSearchParams={setJobData}
                          searchParams={jobData}
                        />
                      </div>

                      <div className="form-group col-lg-6 col-md-12">
                        <label>Locations</label>
                        <LocationDropdown setSearchParams={setJobData} />
                      </div>

                      <div className="form-group col-lg-6 col-md-12">
                        <label>Salary Range (VND)</label>
                        <div className="d-flex">
                          <input
                            type="text"
                            name="minSalary"
                            value={salaryRange.minSalary}
                            onChange={handleSalaryChange}
                            placeholder="Min salary"
                            className="mr-2"
                            style={{ flex: 1, marginRight: "10px" }}
                          />
                          <input
                            type="text"
                            name="maxSalary"
                            value={salaryRange.maxSalary}
                            onChange={handleSalaryChange}
                            placeholder="Max salary"
                            style={{ flex: 1 }}
                          />
                        </div>
                        {parseInt(
                          salaryRange.minSalary.replace(/,/g, "") || 0
                        ) >
                          parseInt(
                            salaryRange.maxSalary.replace(/,/g, "") || 0
                          ) &&
                        salaryRange.minSalary &&
                        salaryRange.maxSalary ? (
                          <div
                            className="text-danger mt-1"
                            style={{ fontSize: "0.8rem" }}
                          >
                            Minimum salary cannot be greater than maximum salary
                          </div>
                        ) : null}
                      </div>
                      <div className="form-group col-lg-6 col-md-12">
                        <label style={{ display: "block" }}>Deadline</label>
                        <input
                          type="date"
                          name="deadline"
                          value={jobData.deadline}
                          onChange={handleChange}
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </div>

                      <div className="form-group col-lg-12 col-md-12 text-right">
                        <button
                          type="submit"
                          className="theme-btn btn-style-one"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Creating..." : "Create Job"}
                        </button>
                      </div>
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

export default JobForm;
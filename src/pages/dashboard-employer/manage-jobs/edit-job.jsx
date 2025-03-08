import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJobById, updateJob } from "../../../services/jobServices";
import { Editor } from "@tinymce/tinymce-react";
import { toast } from "react-toastify";
import TagDropdown from "../post-job/TagDropdown";
import { vietnamProvinces } from "../../../helpers/getLocationVN";

const API_TYNI_KEY = import.meta.env.VITE_TINY_API_KEY
const EditJobPage = () => {
  const { jobId } = useParams(); // Lấy jobId từ URL
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [jobData, setJobData] = useState({
    jobTagID: [],
    title: "",
    description: "",
    level: "",
    education: "",
    numberOfRecruitment: "",
    workType: "",
    location: "",
    salary: "",
    exp: "",
    priority: false,
    deadline: "",
  });

  // Khởi tạo danh sách locations
  useEffect(() => {
    setLocations(vietnamProvinces);
  }, []);

  // Fetch job data by ID
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setIsLoading(true);
        const data = await getJobById(jobId);
        // Ensure the deadline is in correct format for the input type="date"
        const formattedDeadline = data.deadline
          ? new Date(data.deadline).toLocaleDateString("en-CA") // "en-CA" cho định dạng YYYY-MM-DD
          : "";

        setJobData({
          ...data, // Spread other job data
          deadline: formattedDeadline, // Set formatted deadline
        });
        console.log("Job data:", data);
      } catch (error) {
        console.error("Error fetching job:", error);
        toast.error("Failed to fetch job details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setJobData(prevData => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Xử lý thay đổi nội dung editor một cách riêng biệt
  const handleEditorChange = (content) => {
    setJobData(prevData => ({
      ...prevData,
      description: content,
    }));
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

  if (isLoading) {
    return <div className="text-center p-5">Loading job data...</div>;
  }

  // Kiểm tra xem location đã chọn có trong danh sách không
  const isLocationValid = jobData.location && locations.some(loc => loc.name === jobData.location);

  return (
    <section className="user-dashboard">
      <div className="dashboard-outer">
        <div className="upper-title-box">
          <h3>Edit Job</h3>
          <div className="text">Update in the job details below</div>
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
                          placeholder="Title"
                          required
                        />
                      </div>

                      {/* TinyMCE Editor for Job Description */}
                      <div className="form-group col-lg-12 col-md-12">
                        <label>Job Description</label>
                        <Editor
                          apiKey={API_TYNI_KEY}
                          value={jobData.description}
                          init={{
                            height: 300,
                            menubar: false,
                            plugins: [
                              "advlist", "autolink", "lists", "link", "charmap", "print", "preview",
                              "anchor", "searchreplace", "visualblocks", "code", "fullscreen",
                              "insertdatetime", "media", "table", "paste", "help", "wordcount"
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
                          placeholder="Education level"
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
                        <label>Tags</label>
                        <TagDropdown
                          setSearchParams={setJobData}
                          initialTags={jobData.jobTagID}
                        />
                      </div>
                      <div className="form-group col-lg-6 col-md-12">
                        <label>Location</label>
                        <select
                          name="location"
                          value={jobData.location || ""}
                          onChange={handleChange}
                          className="form-control"
                        >
                          <option value="">Select a Location</option>
                          {locations.length > 0 ? (
                            locations.map((location) => (
                              <option key={location.name} value={location.name}>
                                {location.name}
                              </option>
                            ))
                          ) : (
                            <option>No Location available</option>
                          )}
                          {jobData.location && !isLocationValid && (
                            <option value={jobData.location}>{jobData.location} (Current)</option>
                          )}
                        </select>
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
                          value={jobData.deadline ? jobData.deadline.split("T")[0] : ""} // Đảm bảo không gây lỗi nếu deadline là null
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
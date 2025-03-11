import React, { useState, useEffect } from "react";
import { createJob } from "../../../services/jobServices";
import { toast } from "react-toastify";
import { fetchTags } from "../../../services/tagServices";
import { useNavigate } from "react-router-dom";
import { vietnamProvinces } from "../../../helpers/getLocationVN";
import TagDropdown from "./TagDropdown";
import { Editor } from "@tinymce/tinymce-react";
const API_TYNI_KEY = import.meta.env.VITE_TINY_API_KEY;

export const JobForm = () => {
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
    location: "",
    salary: "",
    exp: "",
    priority: false,
    deadline: "",
  });
  const [tags, setTags] = useState([]); // Mảng chứa danh sách tags từ API
  const [locations, setLocation] = useState([]);
  const navigate = useNavigate();

  // Lấy danh sách tags từ API
  useEffect(() => {
    const getTags = async () => {
      try {
        const data = await fetchTags(); // Gọi API để lấy tags
        setTags(data); // Cập nhật state tags với dữ liệu từ API
      } catch (error) {
        console.error("Error fetching tags:", error);
        toast.error("Failed to load tags.");
      }
    };
    getTags();
    setLocation(vietnamProvinces);
  }, []);

  // Xử lý thay đổi nội dung editor một cách riêng biệt
  const handleEditorChange = (content) => {
    setJobData((prevData) => ({
      ...prevData,
      description: content,
    }));
  };

  // Cập nhật thông tin trong form
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setJobData({
        ...jobData,
        [name]: checked,
      });
    } else if (name === "jobTagID") {
      // Cập nhật jobTagID khi người dùng chọn tag
      setJobData({
        ...jobData,
        jobTagID: value, // Lưu tagID duy nhất
      });
    } else {
      setJobData({
        ...jobData,
        [name]: value,
      });
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createJob(jobData);
      console.log(jobData); // Gửi thông tin công việc cùng với jobTagID đã chọn
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

                      {/* <div className="form-group col-lg-12 col-md-12">
                        <label>Job Description</label>
                        <textarea
                          name="description"
                          value={jobData.description}
                          onChange={handleChange}
                          placeholder="Enter job description"
                          required
                        />
                      </div> */}

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
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Freelance">Freelance</option>
                        </select>
                      </div>

                      {/* Thêm phần chọn tags */}
                      <div className="form-group col-lg-6 col-md-12">
                        <label>Tags</label>
                        {/* <select
                          name="jobTagID"  // Đảm bảo sử dụng jobTagID để lưu tag duy nhất
                          value={jobData.jobTagID}
                          onChange={handleChange}
                          className="form-control"
                        >
                          <option value="">Select a tag</option>
                          {tags.length > 0 ? (
                            tags.map((tag) => (
                              <option key={tag.tagID} value={tag.tagID}>
                                {tag.tagName}
                              </option>
                            ))
                          ) : (
                            <option>No tags available</option>
                          )}
                        </select> */}
                        <TagDropdown setSearchParams={setJobData} />
                      </div>

                      <div className="form-group col-lg-6 col-md-12">
                        <label>Location</label>
                        <select
                          name="location"
                          value={jobData.location}
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
                          placeholder="Enter salary"
                        />
                      </div>

                      <div className="form-group col-lg-6 col-md-12">
                        <label style={{ display: "block" }}>Deadline</label>
                        <input
                          type="date"
                          name="deadline"
                          value={jobData.deadline}
                          onChange={handleChange}
                          min={new Date().toISOString().split("T")[0]} // Giới hạn chỉ có thể chọn ngày hôm nay hoặc ngày trong tương lai
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
                        <button
                          type="submit"
                          className="theme-btn btn-style-one"
                        >
                          Create Job
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

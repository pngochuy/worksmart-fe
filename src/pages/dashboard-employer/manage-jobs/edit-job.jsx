import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJobById, updateJob } from "../../../services/jobServices";
import { Editor } from "@tinymce/tinymce-react";
import { toast } from "react-toastify";
import TagDropdown from "../post-job/TagDropdown";
import { vietnamProvinces } from "../../../helpers/getLocationVN";
import LocationDropdown from "../post-job/LocationDropdown";
const API_TYNI_KEY = import.meta.env.VITE_TINY_API_KEY
const EditJobPage = () => {
  const { jobId } = useParams(); // Lấy jobId từ URL
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' cho giảm dần, 'asc' cho tăng dần
  const [updateHistory, setUpdateHistory] = useState([]);
  const [jobData, setJobData] = useState({
    tags: [],
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
    jobPosition: "", // Thêm trường jobPosition
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
        const formattedDeadline = data.job.deadline
          ? new Date(data.job.deadline).toLocaleDateString("en-CA") // "en-CA" cho định dạng YYYY-MM-DD
          : "";

        // Nếu có lịch sử cập nhật, lưu vào state riêng
        if (data.job.updateHistory) {
          setUpdateHistory(data.job.updateHistory);
        }

        setJobData({
          ...data.job, // Spread other job data
          deadline: formattedDeadline, // Set formatted deadline
        });
        console.log("Job data:", data.job);
      } catch (error) {
        console.error("Error fetching job:", error);
        toast.error("Failed to fetch job details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  // Sắp xếp lịch sử cập nhật khi sortOrder thay đổi
  useEffect(() => {
    if (updateHistory.length > 0) {
      const sortedHistory = [...updateHistory].sort((a, b) => {
        if (sortOrder === 'desc') {
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        } else {
          return new Date(a.updatedAt) - new Date(b.updatedAt);
        }
      });
      setUpdateHistory(sortedHistory);
    }
  }, [sortOrder, updateHistory]);

  // Xử lý thay đổi cách sắp xếp
  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setJobData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Xử lý thay đổi nội dung editor một cách riêng biệt
  const handleEditorChange = (content) => {
    setJobData((prevData) => ({
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
  const isLocationValid =
    jobData.location && locations.some((loc) => loc.name === jobData.location);

  return (
    <section className="user-dashboard">
      <div className="dashboard-outer">
        <div className="upper-title-box d-flex justify-content-between align-items-center">
          <div>
            <h3>Edit Job</h3>
            <div className="text">Update in the job details below</div>
          </div>
          <div className="sort-options">
            <label className="mr-2">Sắp xếp theo thời gian cập nhật:</label>
            <select onChange={handleSortChange} value={sortOrder} className="form-control">
              <option value="desc">Mới nhất trước</option>
              <option value="asc">Cũ nhất trước</option>
            </select>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12">
            {updateHistory.length > 0 && (
              <div className="ls-widget mb-4">
                <div className="widget-title">
                  <h4>Lịch sử cập nhật</h4>
                </div>
                <div className="widget-content">
                  <div className="update-history">
                    {updateHistory.map((update, index) => (
                      <div key={index} className="update-item p-3 mb-2 border-bottom">
                        <div><strong>Ngày cập nhật:</strong> {new Date(update.updatedAt).toLocaleString()}</div>
                        {update.updatedBy && <div><strong>Người cập nhật:</strong> {update.updatedBy}</div>}
                        {update.changes && <div><strong>Thay đổi:</strong> {update.changes}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

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


                      <div className="form-group col-lg-6 col-md-12">
                        <label>Job Position</label>
                        <input
                          type="text"
                          name="jobPosition"
                          value={jobData.jobPosition || ""}
                          onChange={handleChange}
                          placeholder="Enter job position (e.g. Developer, Manager, etc.)"
                        />
                      </div>

                      <div className="form-group col-lg-6 col-md-12">
                        <label>Job Level</label>
                        <input
                          type="text"
                          name="level"
                          value={jobData.level || ""}
                          onChange={handleChange}
                          placeholder="Enter job level (e.g. Junior, Senior, etc.)"
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
                          // initialSelectedTags={jobData.jobTagID || [jobData.jobTagID]}
                          initialSelectedTags={jobData.tags}
                        />
                      </div>
                      <div className="form-group col-lg-6 col-md-12">
                        <label>Locations</label>
                        <LocationDropdown
                          setSearchParams={setJobData}
                          initialLocation={jobData.location || ""}
                        />
                      </div>
                      {/* <div className="form-group col-lg-6 col-md-12">
                        <label>Min Salary ($)</label>
                        <input
                          type="number"
                          name="minSalary"
                          value={jobData.minSalary}
                          onChange={handleChange}
                          min="0"
                          placeholder="Enter minimum salary"
                        />
                      </div> */}

                      <div className="form-group col-lg-6 col-md-12">
                        <label>Salary (VND)</label>
                        <input
                          type="text"
                          name="salary"
                          value={jobData.salary}
                          onChange={handleChange}
                          // min="0"
                          placeholder="Enter maximum salary"
                        />
                      </div>

                      <div className="form-group col-lg-6 col-md-12">
                        <label style={{ display: "block" }}>Deadline</label>
                        <input
                          type="date"
                          name="deadline"
                          value={
                            jobData.deadline
                              ? jobData.deadline.split("T")[0]
                              : ""
                          } // Đảm bảo không gây lỗi nếu deadline là null
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
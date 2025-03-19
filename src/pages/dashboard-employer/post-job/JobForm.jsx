import { useState, useEffect, useRef } from "react";
import { createJob } from "../../../services/jobServices";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import TagDropdown from "./TagDropdown";
import LocationDropdown from "./LocationDropdown"; // Import component mới
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
    jobPosition: "", // Thêm trường jobPosition
  });
  // Thêm state riêng cho min-max salary
  const [salaryRange, setSalaryRange] = useState({
    minSalary: "",
    maxSalary: "",
  });
  const navigate = useNavigate();
  // Thêm state để theo dõi vị trí con trỏ
  const [cursorPositions, setCursorPositions] = useState({
    minSalary: 0,
    maxSalary: 0,
  });
  // Refs để tham chiếu tới các input elements
  const minSalaryInputRef = useRef(null);
  const maxSalaryInputRef = useRef(null);

  // Cập nhật vị trí con trỏ sau mỗi lần render
  useEffect(() => {
    if (minSalaryInputRef.current) {
      minSalaryInputRef.current.selectionStart = cursorPositions.minSalary;
      minSalaryInputRef.current.selectionEnd = cursorPositions.minSalary;
    }
    if (maxSalaryInputRef.current) {
      maxSalaryInputRef.current.selectionStart = cursorPositions.maxSalary;
      maxSalaryInputRef.current.selectionEnd = cursorPositions.maxSalary;
    }
  }, [salaryRange, cursorPositions]);

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

  // Handler cho việc thay đổi lương với xử lý dấu phẩy và vị trí con trỏ
  const handleSalaryChange = (e) => {
    const { name, value } = e.target;
    const cursorPos = e.target.selectionStart;

    // Đếm số lượng dấu phẩy trước vị trí con trỏ
    const valueBeforeCursor = value.substring(0, cursorPos);
    const commasBeforeCursor = (valueBeforeCursor.match(/,/g) || []).length;

    // Xóa tất cả dấu phẩy và kí tự không phải số
    const numericValue = value.replace(/[^\d]/g, "");

    // Định dạng số với dấu phẩy
    let formattedValue = "";
    if (numericValue) {
      formattedValue = parseInt(numericValue, 10).toLocaleString("en-US");
    }

    // Tính toán vị trí con trỏ mới
    const digitsBeforeCursor = valueBeforeCursor.replace(/[^\d]/g, "").length;
    const newValueBeforeCursor = numericValue.substring(0, digitsBeforeCursor);
    const newFormattedValueBeforeCursor = parseInt(
      newValueBeforeCursor || "0",
      10
    ).toLocaleString("en-US");
    const newCommasBeforeCursor = (
      newFormattedValueBeforeCursor.match(/,/g) || []
    ).length;

    // Điều chỉnh vị trí con trỏ dựa trên sự thay đổi số lượng dấu phẩy
    const commasDiff = newCommasBeforeCursor - commasBeforeCursor;
    let newCursorPos = cursorPos + commasDiff;

    // Đảm bảo vị trí con trỏ không vượt quá độ dài chuỗi
    newCursorPos = Math.min(newCursorPos, formattedValue.length);
    newCursorPos = Math.max(newCursorPos, 0);

    // Cập nhật state
    setSalaryRange((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));

    // Lưu vị trí con trỏ mới
    setCursorPositions((prev) => ({
      ...prev,
      [name]: newCursorPos,
    }));

    // Cập nhật jobData với giá trị số không có dấu phẩy
    const updatedMinSalary =
      name === "minSalary"
        ? numericValue
        : salaryRange.minSalary
        ? salaryRange.minSalary.replace(/,/g, "")
        : "";

    const updatedMaxSalary =
      name === "maxSalary"
        ? numericValue
        : salaryRange.maxSalary
        ? salaryRange.maxSalary.replace(/,/g, "")
        : "";

    if (updatedMinSalary && updatedMaxSalary) {
      setJobData((prev) => ({
        ...prev,
        salary: `${updatedMinSalary} - ${updatedMaxSalary}`,
      }));
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convert formatted salary values to numbers by removing commas
    const minSalaryStr = salaryRange.minSalary
      ? salaryRange.minSalary.replace(/,/g, "")
      : "0";
    const maxSalaryStr = salaryRange.maxSalary
      ? salaryRange.maxSalary.replace(/,/g, "")
      : "0";

    const minSalary = parseInt(minSalaryStr, 10);
    const maxSalary = parseInt(maxSalaryStr, 10);

    // Kiểm tra xem giá trị lương có hợp lệ không
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

    try {
      // Tạo bản sao của jobData với salary đã định dạng để đảm bảo dữ liệu mới nhất được gửi đi
      const updatedJobData = {
        ...jobData,
        salary: `${minSalary.toLocaleString(
          "en-US"
        )} - ${maxSalary.toLocaleString("en-US")}`,
      };

      await createJob(updatedJobData);
      console.log(updatedJobData);
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
                      {/* Các trường dữ liệu khác giữ nguyên */}
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
                          <option value="Full-Time">Full-Time</option>
                          <option value="Part-Time">Part-Time</option>
                          <option value="Contract">Contract</option>
                          <option value="Internship">Internship</option>
                          <option value="Remote">Remote</option>
                        </select>
                      </div>

                      <div className="form-group col-lg-6 col-md-12">
                        <label>Tags</label>
                        <TagDropdown setSearchParams={setJobData} />
                      </div>

                      {/* Thay đổi select location thành LocationDropdown */}
                      <div className="form-group col-lg-6 col-md-12">
                        <label>Locations</label>
                        <LocationDropdown setSearchParams={setJobData} />
                      </div>

                      <div className="form-group col-lg-6 col-md-12">
                        <label>Salary Range (VND)</label>
                        <div className="d-flex">
                          <input
                            ref={minSalaryInputRef}
                            type="text"
                            name="minSalary"
                            value={salaryRange.minSalary}
                            onChange={handleSalaryChange}
                            placeholder="Min salary"
                            className="mr-2"
                            style={{ flex: 1, marginRight: "10px" }}
                          />
                          <input
                            ref={maxSalaryInputRef}
                            type="text"
                            name="maxSalary"
                            value={salaryRange.maxSalary}
                            onChange={handleSalaryChange}
                            placeholder="Max salary"
                            style={{ flex: 1 }}
                          />
                        </div>
                        {parseInt(
                          salaryRange.minSalary?.replace(/,/g, "") || 0
                        ) >
                          parseInt(
                            salaryRange.maxSalary?.replace(/,/g, "") || 0
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

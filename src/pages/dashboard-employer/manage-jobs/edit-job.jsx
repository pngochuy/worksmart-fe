import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJobById, updateJob } from "../../../services/jobServices";
import { Editor } from "@tinymce/tinymce-react";
import { toast } from "react-toastify";
import TagDropdown from "./TagDropdown";
import LocationDropdown from "../post-job/LocationDropdown";
import CategoryDropdown from "./CategoryDropdown";
const API_TYNI_KEY = import.meta.env.VITE_TINY_API_KEY;

const EditJobPage = () => {
  const { jobId } = useParams(); // Lấy jobId từ URL
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("desc"); // 'desc' cho giảm dần, 'asc' cho tăng dần
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
    jobPosition: "",
    categoryID: "",
  });
  const [salaryRange, setSalaryRange] = useState({
    minSalary: "",
    maxSalary: "",
  });
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

  // Fetch job data by ID
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setIsLoading(true);
        const data = await getJobById(jobId);
        console.log("Fetch job data:", data);
        // Format deadline
        const formattedDeadline = data.job.deadline
          ? new Date(data.job.deadline).toLocaleDateString("en-CA")
          : "";

        // Parse salary string (format: "minSalary - maxSalary")
        let minSalary = "";
        let maxSalary = "";
        if (data.job.salary) {
          const salaryParts = data.job.salary
            .split("-")
            .map((part) => part.trim());

          if (salaryParts.length === 2) {
            // Xử lý dữ liệu đầu vào - loại bỏ dấu phẩy nếu có
            const minClean = salaryParts[0].replace(/,/g, "");
            const maxClean = salaryParts[1].replace(/,/g, "");

            // Chuyển đổi về số và định dạng lại với dấu phẩy
            const minNum = parseInt(minClean, 10);
            const maxNum = parseInt(maxClean, 10);

            if (!isNaN(minNum)) {
              minSalary = minNum.toLocaleString("en-US");
            }

            if (!isNaN(maxNum)) {
              maxSalary = maxNum.toLocaleString("en-US");
            }
          }
        }

        // Set salary range
        setSalaryRange({
          minSalary,
          maxSalary,
        });

        // Update history if available
        if (data.job.updateHistory) {
          setUpdateHistory(data.job.updateHistory);
        }

        setJobData({
          ...data.job,
          deadline: formattedDeadline,
        });
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
        if (sortOrder === "desc") {
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        } else {
          return new Date(a.updatedAt) - new Date(b.updatedAt);
        }
      });
      setUpdateHistory(sortedHistory);
    }
  }, [sortOrder, updateHistory]);

  // Handler cho việc thay đổi lương
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
    // Vị trí con trỏ sẽ bị đẩy về phía trước khi thêm dấu phẩy
    let newCursorPos = cursorPos;

    // Đếm số lượng dấu phẩy trong giá trị mới trước vị trí con trỏ
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
    newCursorPos = cursorPos + commasDiff;

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

    // Update the main salary field in jobData
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
  // Handle form submit
  const handleSubmit = async (e) => {
    console.log("JOB", jobData);
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
      // Create updated job data with formatted salary including commas for display
      const updatedJobData = {
        ...jobData,
        salary: `${minSalary.toLocaleString(
          "en-US"
        )} - ${maxSalary.toLocaleString("en-US")}`,
      };

      await updateJob(jobId, updatedJobData);
      toast.success("Job updated successfully!");
      navigate("/employer/manage-jobs");
    } catch (error) {
      console.error("Error updating job:", error);
      toast.error("Failed to update job.");
    }
  };

  if (isLoading) {
    return <div className="text-center p-5">Loading job data...</div>;
  }

  return (
    <section className="user-dashboard">
      <div className="dashboard-outer">
        <div className="upper-title-box d-flex justify-content-between align-items-center">
          <div>
            <h3>Edit Job</h3>
            <div className="text">Update in the job details below</div>
          </div>
          {/* <div className="sort-options">
            <label className="mr-2">Sort Order by Updated Date:</label>
            <select
              onChange={handleSortChange}
              value={sortOrder}
              className="form-control"
            >
              <option value="desc">Lastest</option>
              <option value="asc">Oldest</option>
            </select>
          </div> */}
        </div>

        <div className="row">
          <div className="col-lg-12">
            {updateHistory.length > 0 && (
              <div className="ls-widget mb-4">
                <div className="widget-title">
                  <h4>Update History</h4>
                </div>
                <div className="widget-content">
                  <div className="update-history">
                    {updateHistory.map((update, index) => (
                      <div
                        key={index}
                        className="update-item p-3 mb-2 border-bottom"
                      >
                        <div>
                          <strong>Updated At:</strong>{" "}
                          {new Date(update.updatedAt).toLocaleString()}
                        </div>
                        {update.updatedBy && (
                          <div>
                            <strong>Updated By:</strong> {update.updatedBy}
                          </div>
                        )}
                        {update.changes && (
                          <div>
                            <strong>Changes:</strong> {update.changes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="ls-widget">
              <div className="tabs-box">
                <div className="widget-title">
                  <h4>Edit Job</h4>
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

                      {/* <div className="form-group col-lg-6 col-md-12">
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
                      </div> */}

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
                          <option value="Full-Time">Full-Time</option>
                          <option value="Part-Time">Part-Time</option>
                          <option value="Contract">Contract</option>
                          <option value="Internship">Internship</option>
                          <option value="Remote">Remote</option>
                        </select>
                      </div>
                      <div className="form-group col-lg-6 col-md-12">
                        <label>Categories</label>
                        <CategoryDropdown
                          setSearchParams={setJobData}
                          initialCategory={jobData.categoryID}
                        />
                      </div>
                      <div className="form-group col-lg-6 col-md-12">
                        <label>Tags</label>
                        <TagDropdown
                          setSearchParams={setJobData}
                          searchParams={jobData}
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
                          value={
                            jobData.deadline
                              ? jobData.deadline.split("T")[0]
                              : ""
                          } // Đảm bảo không gây lỗi nếu deadline là null
                          onChange={handleChange}
                          min={new Date().toISOString().split("T")[0]} // Giới hạn chỉ có thể chọn ngày hôm nay hoặc ngày trong tương lai
                        />
                      </div>

                      {/* <div className="form-group form-group col-lg-12 col-md-12">
                        <label>
                          <input
                            type="checkbox"
                            name="priority"
                            checked={jobData.priority}
                            onChange={handleChange}
                          />
                          &nbsp; High Priority Job
                        </label>
                      </div> */}
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

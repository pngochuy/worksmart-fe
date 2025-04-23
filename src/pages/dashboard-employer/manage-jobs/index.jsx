import { useEffect, useState } from "react";
import {
  fetchCandidatesForJob,
  hideJob,
  unhideJob,
  toggleJobPriority,
} from "../../../services/jobServices";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Pagination from "./Pagination";
import ConfirmDialog from "./ConfirmDialog";
import { fetchCompanyProfile } from "@/services/employerServices";
import { fetchJobsForManagement } from "../../../services/jobServices";
import { formatDateTimeNotIncludeTime } from "@/helpers/formatDateTime";
import { getUserLoginData } from "@/helpers/decodeJwt";
import "../manage-jobs/styleManageJob.css";
import { Filter, Search, X } from "lucide-react";

export default function ManageJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [totalPage, setTotalPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [candidateCounts, setCandidateCounts] = useState({});
  const [remainingHighPrioritySlots, setRemainingHighPrioritySlots] =
    useState(0);
  // State cho độ rộng cột và kéo thả
  const [sortOrder, setSortOrder] = useState("createdAt");
  const [columnWidths, setColumnWidths] = useState({
    title: 200,
    location: 150,
    salary: 150,
    status: 120,
    workType: 120,
    created: 150,
    expires: 150,
    openings: 100,
    actions: 200,
    candidates: 150,
  });


  // Trạng thái kéo cột
  const [resizingColumn, setResizingColumn] = useState(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const navigate = useNavigate();
  // Thêm các state cho tìm kiếm và bộ lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams, setSearchParams] = useState({
    PageIndex: 1,
    PageSize: 5,
    title: "",
    IncludeHidden: true,
    MostRecent: false,
    status: "", // Thêm lọc theo trạng thái
    location: "", // Thêm lọc theo địa điểm
    priority: "", // Thêm trường priority
  });
  const [verificationLevel, setVerificationLevel] = useState(null);
  const currentUser = getUserLoginData();
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);

  // Hàm xử lý tìm kiếm chung
  const handleSearchTermChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    setSearchParams({
      ...searchParams,
      title: term,
      PageIndex: 1,
    });
  };

  // Hàm xử lý xóa bộ lọc
  const handleClearFilters = () => {
    setSearchTerm("");
    setSearchParams({
      PageIndex: 1,
      PageSize: searchParams.PageSize,
      title: "",
      IncludeHidden: true,
      MostRecent: false,
      status: "",
      location: "",
    });
  };

  // Thêm useEffect để theo dõi trạng thái kéo cột
  useEffect(() => {
    if (resizingColumn) {
      document.body.classList.add("resizing");
    } else {
      document.body.classList.remove("resizing");
    }
  }, [resizingColumn]);

  useEffect(() => {
    // Thêm CSS cho resize columns vào trang
    const style = document.createElement("style");
    style.id = "resizable-columns-styles";
    style.innerHTML = `
      .column-resizer {
        position: absolute;
        top: 0;
        right: 0;
        width: 8px; /* Tăng độ rộng */
        height: 100%;
        background-color: transparent;
        cursor: col-resize;
        z-index: 10;
        transition: background-color 0.2s;
      }
      
      .column-resizer:hover {
        background-color: rgba(0, 112, 243, 0.3); /* Màu nhẹ hơn khi hover */
      }
      
      .column-resizer.active {
        background-color: rgba(0, 112, 243, 0.6); /* Màu đậm hơn khi active */
      }
      
      th {
        position: relative;
        padding-right: 15px !important; /* Thêm padding bên phải */
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      
      .th-content {
        padding-right: 10px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .manage-job-table td {
        max-width: 0;
        overflow: visible;  /* Changed from hidden to visible */
        text-overflow: initial;  /* Changed from ellipsis to initial */
        white-space: normal;  /* Changed from nowrap to normal */
      }
      
      /* Job title specifically to display fully */
      .job-title-text {
        overflow: visible;
        white-space: normal;
        word-break: break-word;
      }
      
      body.resizing {
        cursor: col-resize !important;
        user-select: none;
      }
      
      .manage-job-table {
        table-layout: fixed;
        width: 100%;
      }
      
      /* Thêm highlight cho cột đang kéo */
      .resizing-column {
        background-color: rgba(0, 112, 243, 0.05);
      }
    `;
    document.head.appendChild(style);

    // Cleanup khi component unmount
    return () => {
      const styleElement = document.getElementById("resizable-columns-styles");
      if (styleElement) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

  const handleResizeStart = (columnName, e) => {
    console.log("Starting resize for column:", columnName);
    e.preventDefault();
    e.stopPropagation(); // Ngăn sự kiện click vào cell
    setResizingColumn(columnName);
    setStartX(e.clientX);
    setStartWidth(columnWidths[columnName]);

    if (e.target.classList.contains("column-resizer")) {
      e.target.classList.add("active");
    }

    const headerCell = e.target.closest("th");
    if (headerCell) {
      headerCell.classList.add("resizing-column");
    }

    document.addEventListener("mousemove", handleResizeMove);
    document.addEventListener("mouseup", handleResizeEnd);
    document.body.style.cursor = "col-resize";
  };

  const handleResizeMove = (e) => {
    if (!resizingColumn) return;

    const diff = e.clientX - startX;
    const newWidth = Math.max(60, startWidth + diff);
    console.log("Resizing column:", resizingColumn, "to width:", newWidth);

    setColumnWidths((prev) => ({
      ...prev,
      [resizingColumn]: newWidth,
    }));
  };

  const handleResizeEnd = () => {
    console.log("End resizing column:", resizingColumn);

    // Xóa class active từ tất cả thanh resize
    document.querySelectorAll(".column-resizer.active").forEach((el) => {
      el.classList.remove("active");
    });

    document.querySelectorAll(".resizing-column").forEach((el) => {
      el.classList.remove("resizing-column");
    });

    setResizingColumn(null);
    document.removeEventListener("mousemove", handleResizeMove);
    document.removeEventListener("mouseup", handleResizeEnd);
    document.body.style.cursor = "default";
    document.body.classList.remove("resizing");
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = getUserLoginData();

        if (user.role === "Employer") {
          const companyData = await fetchCompanyProfile();

          setVerificationLevel(companyData.verificationLevel);
          setRemainingHighPrioritySlots(
            companyData.remainingHighPrioritySlots || 0
          );
          console.log("Verification Level:", companyData.verificationLevel);
          console.log(
            "Remaining High Priority Slots:",
            companyData.remainingHighPrioritySlots
          );
        }
      } catch (error) {
        console.error("Error loading verification data:", error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (verificationLevel !== null && verificationLevel < 3) {
      navigate("/employer/verification");
    }
  }, [verificationLevel, navigate]);

  useEffect(() => {
    getJobs();
  }, [
    searchParams.PageIndex,
    searchParams.PageSize,
    searchParams.title,
    searchParams.status,
    searchParams.location,
    searchParams.IncludeHidden,
    searchParams.MostRecent,
    searchParams.priority,
  ]);

  useEffect(() => {
    if (jobs.length > 0) {
      console.log("Job priority types:");
      jobs.forEach((job) => {
        console.log(
          `Job ID: ${job.jobID}, Title: ${job.title}, Priority: ${
            job.priority
          }, Type: ${typeof job.priority}`
        );
      });
    }
  }, [jobs]);

  const isJobExpired = (deadline) => {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    const today = new Date();
    return deadlineDate < today;
  };

  const getJobs = async () => {
    try {
      setLoading(true);

      const userInfo = getUserLoginData();

      if (!userInfo || !userInfo.userID) {
        console.log("Thông tin người dùng chưa có sẵn, bỏ qua việc tải job");
        setLoading(false);
        return;
      }

      const paramsToSend = {
        ...searchParams,
        IncludeHidden: true,
        PageIndex: 1,
        PageSize: 1000, // Lấy tất cả dữ liệu để xử lý client-side
      };

      const data = await fetchJobsForManagement(paramsToSend);
      console.log("Jobs từ API:", data);

      // Lọc ban đầu theo userID
      let filteredJobs = data.jobs.filter(
        (job) => job.userID == userInfo.userID
      );

      console.log("Jobs sau khi lọc theo userID:", filteredJobs);

      // Áp dụng bộ lọc title nếu có
      if (searchParams.title) {
        filteredJobs = filteredJobs.filter(
          (job) =>
            job.title &&
            job.title.toLowerCase().includes(searchParams.title.toLowerCase())
        );
        console.log("Jobs sau khi lọc title:", filteredJobs);
      }

      // Trước khi áp dụng các bộ lọc khác, xác định trước các job đã hết hạn
      filteredJobs = filteredJobs.map((job) => ({
        ...job,
        isExpired: isJobExpired(job.deadline),
      }));

      // Áp dụng bộ lọc status nếu có
      if (searchParams.status) {
        console.log("Đang lọc theo status:", searchParams.status);

        if (searchParams.status === "expired") {
          // Lọc chỉ hiển thị các job đã hết hạn
          filteredJobs = filteredJobs.filter((job) => job.isExpired);
        } else {
          // Lọc theo status và loại bỏ job đã hết hạn
          filteredJobs = filteredJobs.filter((job) => {
            console.log(
              `Job ID ${job.jobID}, title: ${job.title}, status: ${job.status}, expired: ${job.isExpired}`
            );
            return String(job.status) === searchParams.status && !job.isExpired;
          });
        }

        console.log("Jobs sau khi lọc status:", filteredJobs);
      }

      // Áp dụng bộ lọc location nếu có
      if (searchParams.location) {
        console.log("Đang lọc theo location:", searchParams.location);
        filteredJobs = filteredJobs.filter(
          (job) =>
            job.location &&
            job.location
              .toLowerCase()
              .includes(searchParams.location.toLowerCase())
        );
        console.log("Jobs sau khi lọc location:", filteredJobs);
      }

      // Lọc theo priority
      if (searchParams.priority !== undefined && searchParams.priority !== "") {
        console.log("Đang lọc theo priority:", searchParams.priority);
        const priorityValue = searchParams.priority === "true";
        filteredJobs = filteredJobs.filter((job) => {
          console.log(
            `Job ID ${job.jobID}, title: ${job.title}, priority: ${
              job.priority
            } (${typeof job.priority})`
          );
          return Boolean(job.priority) === priorityValue;
        });
        console.log("Jobs sau khi lọc priority:", filteredJobs);
      }

      // Sắp xếp dữ liệu theo sortOrder
      console.log("Đang sắp xếp theo:", sortOrder);
      switch (sortOrder) {
        case "createdAt":
          filteredJobs.sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );
          break;
        case "newest":
          filteredJobs.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          break;
        case "deadline":
          filteredJobs.sort((a, b) => {
            const dateA = a.deadline ? new Date(a.deadline) : new Date(0);
            const dateB = b.deadline ? new Date(b.deadline) : new Date(0);
            return dateA - dateB;
          });
          break;
        default:
          filteredJobs.sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );
      }

      console.log(
        "Jobs sau khi sắp xếp:",
        filteredJobs.map((job) => ({
          id: job.jobID,
          title: job.title,
          created: job.createdAt,
          deadline: job.deadline,
        }))
      );

      const totalItems = filteredJobs.length;
      const calculatedTotalPages = Math.max(
        1,
        Math.ceil(totalItems / searchParams.PageSize)
      );

      const startIndex = (searchParams.PageIndex - 1) * searchParams.PageSize;
      if (startIndex >= totalItems && totalItems > 0) {
        setSearchParams((prev) => ({
          ...prev,
          PageIndex: 1,
        }));
        return;
      }

      const endIndex = Math.min(startIndex + searchParams.PageSize, totalItems);
      const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

      const processedJobs = paginatedJobs.map((job) => ({
        ...job,
        priority: Boolean(job.priority),
      }));

      console.log("Jobs cuối cùng hiển thị:", processedJobs);
      setJobs(processedJobs);
      setTotalPage(calculatedTotalPages);

      // Tiếp tục với code lấy candidateCounts như cũ
    } catch (error) {
      console.error("Không thể tải danh sách job:", error);
      toast.error("Không thể tải danh sách job. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Handle sort order change
  const handleSortOrderChange = (e) => {
    const newSortOrder = e.target.value;
    console.log("Changing sort order to:", newSortOrder);
    setSortOrder(newSortOrder);

    // Gọi lại getJobs ngay lập tức để áp dụng sắp xếp mới
    setTimeout(() => {
      getJobs();
    }, 0);
  };

  // Mở dialog nâng cấp gói
  const handlePriorityLimitReached = () => {
    toast.info(
      "You need to upgrade your subscription to set more jobs to High Priority."
    );
    setUpgradeDialogOpen(true);
  };

  // Xử lý đồng ý nâng cấp
  const handleConfirmUpgrade = () => {
    setUpgradeDialogOpen(false);
    navigate("/employer/package-list");
  };

  // Đóng dialog nâng cấp
  const handleCancelUpgrade = () => {
    setUpgradeDialogOpen(false);
  };

  const handleTogglePriority = async (jobId) => {
    try {
      const job = jobs.find((j) => j.jobID === jobId);

      // Chặn việc set Low Priority nếu job đang là High Priority
      if (job && job.priority) {
        toast.error(
          "High priority status cannot be changed until your subscription duration expires."
        );
        return;
      }

      if (
        job &&
        (isJobExpired(job.deadline) || job.status === 0 || job.status === 1)
      ) {
        let reason = isJobExpired(job.deadline)
          ? "expired jobs"
          : job.status === 0
          ? "pending jobs"
          : "rejected jobs";
        toast.error(`Cannot change priority for ${reason}.`);
        return;
      }

      // Call the backend to toggle priority
      const response = await toggleJobPriority(jobId);

      if (response === false) {
        // Khi đạt giới hạn, mở dialog nâng cấp
        handlePriorityLimitReached();
        return;
      }

      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.jobID === jobId ? { ...job, priority: !job.priority } : job
        )
      );

      // Update remaining high-priority slots
      setRemainingHighPrioritySlots((prev) => Math.max(0, prev - 1));

      toast.success("Job priority has been set to High!");
    } catch (error) {
      console.error("Failed to update job priority:", error);
      if (error.response && error.response.status === 400) {
        // Kiểm tra nếu lỗi liên quan đến giới hạn gói
        const errorMessage = error.response.data.message || "";

        if (
          errorMessage.includes("limit") ||
          errorMessage.includes("subscription") ||
          errorMessage.includes("maximum")
        ) {
          handlePriorityLimitReached();
        } else {
          toast.error(errorMessage || "Unable to update priority.");
        }
      } else {
        toast.error("Unable to update job priority.");
      }
    }
  };

  const handleHideJob = async (jobId) => {
    try {
      await hideJob(jobId);

      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.jobID === jobId ? { ...job, status: 2 } : job
        )
      );

      toast.success("Job has been hidden successfully!");
    } catch (error) {
      console.error("Failed to hide job:", error);
      toast.error("Unable to hide job.");
    }
  };

  const handleUnhideJob = async (jobId) => {
    try {
      await unhideJob(jobId);

      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.jobID === jobId ? { ...job, status: 3 } : job
        )
      );

      toast.success("Job has been unhidden successfully!");
    } catch (error) {
      console.error("Failed to unhide job:", error);
      toast.error("Unable to unhide job.");
    }
  };

  const handleEdit = (jobId) => {
    navigate(`/employer/manage-jobs/edit/${jobId}`);
  };

  const handleViewCandidates = (jobId) => {
    navigate(`/employer/manage-jobs/applied-candidates/${jobId}`);
  };

  const handleViewDetail = (job) => {
    setSelectedJob(job);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedJob(null);
  };

  const getCandidateButtonText = (jobId) => {
    const count = candidateCounts[jobId] || 0;
    return count === 0
      ? "No Candidates"
      : count === 1
      ? "View 1 Candidate"
      : `View ${count} Candidates`;
  };

  const getStatusBadge = (status, deadline) => {
    const expired = isJobExpired(deadline);

    if (expired) {
      return <span className="status-badge expired">Expired</span>;
    }

    let badgeClass = "status-badge";
    switch (parseInt(status)) {
      case 0:
        badgeClass += " pending";
        return <span className={badgeClass}>Pending</span>;
      case 1:
        badgeClass += " rejected";
        return <span className={badgeClass}>Rejected</span>;
      case 2:
        badgeClass += " hidden";
        return <span className={badgeClass}>Hidden</span>;
      case 3:
        badgeClass += " accepted";
        return <span className={badgeClass}>Active</span>;
      default:
        badgeClass += " pending";
        return <span className={badgeClass}>Pending</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    let badgeClass = "priority-badge";

    if (priority) {
      badgeClass += " high";
      return (
        <span className={badgeClass}>
          <i className="fas fa-gem"></i> High Priority
        </span>
      );
    } else {
      badgeClass += " low";
      return (
        <span className={badgeClass}>
          <i className="fas fa-gem"></i> Low Priority
        </span>
      );
    }
  };

  const renderJobDetailModal = () => {
    if (!selectedJob || !showDetailModal) return null;

    return (
      <div className="job-detail-modal">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Job Details</h3>
            <button className="close-btn" onClick={closeDetailModal}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="modal-body">
            {isJobExpired(selectedJob.deadline) && (
              <div className="expired-job-notice">
                <i className="fas fa-exclamation-circle"></i>
                <span>
                  This job has expired. It&apos;s no longer accepting
                  applications.
                </span>
              </div>
            )}

            <div className="job-detail-header">
              <div className="job-title-section">
                <h2>
                  {selectedJob.priority === true && (
                    <i className="fas fa-gem text-primary mr-2"></i>
                  )}
                  {selectedJob.title}
                </h2>
                <div className="job-meta">
                  {getStatusBadge(selectedJob.status, selectedJob.deadline)}
                  {getPriorityBadge(selectedJob.priority)}
                </div>
              </div>
              <div className="job-actions">
                <button
                  className="edit-btn"
                  onClick={() => {
                    closeDetailModal();
                    handleEdit(selectedJob.jobID);
                  }}
                >
                  <i className="fas fa-edit"></i> Edit
                </button>
                {isJobExpired(selectedJob.deadline) ||
                selectedJob.status === 0 ||
                selectedJob.status === 1 ? (
                  <button
                    className="priority-btn disabled"
                    disabled
                    title={
                      isJobExpired(selectedJob.deadline)
                        ? "Cannot change priority for expired jobs"
                        : selectedJob.status === 0
                        ? "Cannot change priority for pending jobs"
                        : "Cannot change priority for rejected jobs"
                    }
                  >
                    <i
                      className={`fas fa-gem ${
                        selectedJob.priority ? "" : "text-secondary"
                      }`}
                    ></i>
                    Priority
                  </button>
                ) : selectedJob.priority ? (
                  <button
                    className="priority-btn high-priority disabled"
                    disabled
                    title="High priority status cannot be changed until your subscription duration expires"
                  >
                    <i className="fas fa-gem"></i>
                    High Priority
                  </button>
                ) : (
                  <ConfirmDialog
                    title="Change to High Priority?"
                    description="Are you sure you want to set this job to High Priority? This will count against your featured job limit and cannot be changed back until your subscription duration expires."
                    confirmText="Set High"
                    variant="primary"
                    onConfirm={() => {
                      closeDetailModal();
                      handleTogglePriority(selectedJob.jobID);
                    }}
                  >
                    <button className="priority-btn low-priority">
                      <i className="fas fa-gem text-secondary"></i>
                      Set High Priority
                    </button>
                  </ConfirmDialog>
                )}
                <button
                  className={`view-candidates-btn ${
                    candidateCounts[selectedJob.jobID]
                      ? "has-candidates"
                      : "no-candidates"
                  }`}
                  onClick={() => {
                    closeDetailModal();
                    handleViewCandidates(selectedJob.jobID);
                  }}
                  disabled={candidateCounts[selectedJob.jobID] === 0}
                >
                  <i className="fas fa-user-check"></i>{" "}
                  {getCandidateButtonText(selectedJob.jobID)}
                </button>
              </div>
            </div>

            <div className="job-details-grid">
              <div className="detail-item">
                <div className="detail-label">
                  <i className="fas fa-map-marker-alt"></i> Location
                </div>
                <div className="detail-value">
                  {selectedJob.location || "Remote"}
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-label">
                  <i className="fas fa-solid fa-money-bill"></i> Salary (VND)
                </div>
                <div className="detail-value">
                  {selectedJob.minSalary && selectedJob.salary
                    ? `${selectedJob.minSalary.toLocaleString()} - ${selectedJob.salary.toLocaleString()}`
                    : selectedJob.salary
                    ? `${selectedJob.salary.toLocaleString()}`
                    : selectedJob.minSalary
                    ? `From ${selectedJob.minSalary.toLocaleString()}`
                    : "Negotiable"}
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-label">
                  <i className="fas fa-briefcase"></i> Work Type
                </div>
                <div className="detail-value">
                  {selectedJob.workType || "Full Time"}
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-label">
                  <i className="fas fa-user-plus"></i> Openings
                </div>
                <div className="detail-value">
                  {selectedJob.numberOfRecruitment || 1}
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-label">
                  <i className="fas fa-user-graduate"></i> Education
                </div>
                <div className="detail-value">
                  {selectedJob.education || "No Requirements"}
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-label">
                  <i className="fas fa-layer-group"></i> Level
                </div>
                <div className="detail-value">
                  {selectedJob.level || "Not Specified"}
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-label">
                  <i className="fas fa-gem"></i> Experience
                </div>
                <div className="detail-value">
                  {selectedJob.exp
                    ? `${selectedJob.exp} years`
                    : "No Requirements"}
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-label">
                  <i className="fas fa-calendar-plus"></i> Created Date
                </div>
                <div className="detail-value">
                  {formatDateTimeNotIncludeTime(selectedJob.createdAt)}
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-label">
                  <i className="fas fa-calendar-day"></i> Updated
                </div>
                <div className="detail-value">
                  {formatDateTimeNotIncludeTime(selectedJob.updatedAt)}
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-label">
                  <i className="fas fa-calendar-times"></i> Expires
                </div>
                <div className="detail-value">
                  {formatDateTimeNotIncludeTime(selectedJob.deadline)}
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-label">
                  <i className="fas fa-info-circle"></i> Status
                </div>
                <div className="detail-value">
                  {getStatusBadge(selectedJob.status, selectedJob.deadline)}
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-label">
                  <i className="fas fa-flag"></i> Priority
                </div>
                <div className="detail-value">
                  {getPriorityBadge(selectedJob.priority)}
                </div>
              </div>
            </div>

            {selectedJob.description && (
              <div className="job-description">
                <h4>
                  <i className="fas fa-file-alt"></i> Job Description
                </h4>
                <div className="description-content">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: selectedJob.description,
                    }}
                  />
                </div>
              </div>
            )}

            {selectedJob.requirements && (
              <div className="job-requirements">
                <h4>
                  <i className="fas fa-clipboard-list"></i> Requirements
                </h4>
                <div className="requirements-content">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: selectedJob.requirements,
                    }}
                  />
                </div>
              </div>
            )}

            {selectedJob.benefits && (
              <div className="job-benefits">
                <h4>
                  <i className="fas fa-gift"></i> Benefits
                </h4>
                <div className="benefits-content">
                  <div
                    dangerouslySetInnerHTML={{ __html: selectedJob.benefits }}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button className="close-modal-btn" onClick={closeDetailModal}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };
  return (
    <section className="user-dashboard">
      <div className="dashboard-outer">
        <div className="upper-title-box">
          <div className="title-and-badge-container">
            <div className="title-flex">
              <h3>Manage Jobs</h3>
              <div className="text">
                Manage all your posted jobs and track applications
              </div>
            </div>

            <div className="remaining-high-priority-slots">
              <span className="priority-badge">
                <i className="fas fa-gem"></i>
                {remainingHighPrioritySlots} High Priority Slot
                {remainingHighPrioritySlots !== 1 ? "s" : ""} Left
              </span>
            </div>
          </div>

          <div className="search-filter-wrapper">
            <div className="search-main-container">
              <div className="search-input-container">
                <input
                  type="text"
                  placeholder="Search jobs by title..."
                  value={searchTerm}
                  onChange={handleSearchTermChange}
                  className="search-input"
                />
                <button className="search-icon-button">
                  <i className="fas fa-search"></i>
                </button>
              </div>

              <div className="filter-actions">
                <button
                  className={`filter-toggle-button ${
                    showFilters ? "active" : ""
                  }`}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <i className="fas fa-filter"></i>
                  <span>{showFilters ? "Hide Filters" : "Show Filters"}</span>
                </button>

                {(searchParams.status ||
                  searchParams.location ||
                  searchParams.title) && (
                  <button
                    className="clear-all-button"
                    onClick={handleClearFilters}
                  >
                    <i className="fas fa-times"></i>
                    <span>Clear All</span>
                  </button>
                )}
              </div>
            </div>

            {showFilters && (
              <div className="filters-dropdown">
                <div className="filter-row">
                  <div className="filter-group">
                    <label>Status:</label>
                    <select
                      value={searchParams.status}
                      onChange={(e) =>
                        setSearchParams({
                          ...searchParams,
                          status: e.target.value,
                          PageIndex: 1,
                        })
                      }
                    >
                      <option value="">All Statuses</option>
                      <option value="0">Pending</option>
                      <option value="1">Rejected</option>
                      <option value="2">Hidden</option>
                      <option value="3">Active</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label>Location:</label>
                    <select
                      value={searchParams.location}
                      onChange={(e) =>
                        setSearchParams({
                          ...searchParams,
                          location: e.target.value,
                          PageIndex: 1,
                        })
                      }
                    >
                      <option value="">All Locations</option>
                      <option value="Ha Noi">Ha Noi</option>
                      <option value="Ho Chi Minh">Ho Chi Minh</option>
                      <option value="Da Nang">Da Nang</option>
                      <option value="Can Tho">Can Tho</option>
                      <option value="Hai Phong">Hai Phong</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label>Sort By:</label>
                    <select
                      value={sortOrder}
                      onChange={(e) => {
                        setSortOrder(e.target.value);
                        setSearchParams({
                          ...searchParams,
                          MostRecent: e.target.value === "newest",
                        });
                      }}
                    >
                      <option value="createdAt">Date Created</option>
                      <option value="newest">Newest</option>
                      <option value="deadline">Deadline</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label>Priority:</label>
                    <select
                      value={searchParams.priority || ""}
                      onChange={(e) =>
                        setSearchParams({
                          ...searchParams,
                          priority: e.target.value,
                          PageIndex: 1,
                        })
                      }
                    >
                      <option value="">All Priorities</option>
                      <option value="true">High Priority</option>
                      <option value="false">Low Priority</option>
                    </select>
                  </div>
                </div>

                <div className="active-filters">
                  {(searchParams.status ||
                    searchParams.location ||
                    searchParams.title) && (
                    <div className="active-filters-label">Active filters:</div>
                  )}

                  {searchParams.title && (
                    <div className="filter-tag">
                      Search: "{searchParams.title}"
                      <button
                        onClick={() =>
                          setSearchParams({
                            ...searchParams,
                            title: "",
                            PageIndex: 1,
                          })
                        }
                      >
                        ×
                      </button>
                    </div>
                  )}

                  {searchParams.status && (
                    <div className="filter-tag">
                      Status:{" "}
                      {searchParams.status === "0"
                        ? "Pending"
                        : searchParams.status === "1"
                        ? "Rejected"
                        : searchParams.status === "2"
                        ? "Hidden"
                        : searchParams.status === "3"
                        ? "Active"
                        : searchParams.status === "expired"
                        ? "Expired"
                        : searchParams.status}
                      <button
                        onClick={() =>
                          setSearchParams({
                            ...searchParams,
                            status: "",
                            PageIndex: 1,
                          })
                        }
                      >
                        ×
                      </button>
                    </div>
                  )}

                  {searchParams.location && (
                    <div className="filter-tag">
                      Location: {searchParams.location}
                      <button
                        onClick={() =>
                          setSearchParams({
                            ...searchParams,
                            location: "",
                            PageIndex: 1,
                          })
                        }
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12">
            <div className="ls-widget">
              <div className="widget-title">
                <h4>
                  <i className="fas fa-list mr-2"></i>
                  Job Listings
                </h4>
                <div className="widget-title-right">
                  <div className="refresh-button">
                    <button className="btn-refresh" onClick={() => getJobs()}>
                      <i className="fas fa-sync-alt"></i>
                    </button>
                  </div>
                  <div className="page-size-selector">
                    <label>Show per page:</label>
                    <select
                      value={searchParams.PageSize}
                      onChange={(e) =>
                        setSearchParams({
                          ...searchParams,
                          PageSize: parseInt(e.target.value),
                          PageIndex: 1,
                        })
                      }
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="20">20</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="widget-content">
                {loading ? (
                  <div className="loading-container">
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Loading jobs...</span>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="default-table manage-job-table">
                      <thead>
                        <tr>
                          <th
                            style={{
                              width: `${columnWidths.title}px`,
                              position: "relative",
                            }}
                          >
                            <i className="fas fa-file-alt mr-1"></i> Title
                            <div
                              className="column-resizer"
                              onMouseDown={(e) => handleResizeStart("title", e)}
                            ></div>
                          </th>
                          <th
                            style={{
                              width: `${columnWidths.location}px`,
                              position: "relative",
                            }}
                          >
                            <i className="fas fa-map-marker-alt mr-1"></i>{" "}
                            Location
                            <div
                              className="column-resizer"
                              onMouseDown={(e) =>
                                handleResizeStart("location", e)
                              }
                            ></div>
                          </th>
                          <th
                            style={{
                              width: `${columnWidths.salary}px`,
                              position: "relative",
                            }}
                          >
                            <i className="fas fa-solid fa-money-bill mr-1"></i>{" "}
                            Salary(VND)
                            <div
                              className="column-resizer"
                              onMouseDown={(e) =>
                                handleResizeStart("salary", e)
                              }
                            ></div>
                          </th>
                          <th
                            style={{
                              width: `${columnWidths.status}px`,
                              position: "relative",
                            }}
                          >
                            <i className="fas fa-info-circle mr-1"></i> Status
                            <div
                              className="column-resizer"
                              onMouseDown={(e) =>
                                handleResizeStart("status", e)
                              }
                            ></div>
                          </th>
                          <th
                            style={{
                              width: `${columnWidths.workType}px`,
                              position: "relative",
                            }}
                          >
                            <i className="fas fa-briefcase mr-1"></i> Work Type
                            <div
                              className="column-resizer"
                              onMouseDown={(e) =>
                                handleResizeStart("workType", e)
                              }
                            ></div>
                          </th>
                          <th
                            style={{
                              width: `${columnWidths.created}px`,
                              position: "relative",
                            }}
                          >
                            <i className="fas fa-calendar-plus mr-1"></i>{" "}
                            Created
                            <div
                              className="column-resizer"
                              onMouseDown={(e) =>
                                handleResizeStart("created", e)
                              }
                            ></div>
                          </th>
                          <th
                            style={{
                              width: `${columnWidths.expires}px`,
                              position: "relative",
                            }}
                          >
                            <i className="fas fa-calendar-times mr-1"></i>{" "}
                            Expires
                            <div
                              className="column-resizer"
                              onMouseDown={(e) =>
                                handleResizeStart("expires", e)
                              }
                            ></div>
                          </th>
                          <th
                            style={{
                              width: `${columnWidths.openings}px`,
                              position: "relative",
                            }}
                          >
                            <i className="fas fa-user-plus mr-1"></i> Openings
                            <div
                              className="column-resizer"
                              onMouseDown={(e) =>
                                handleResizeStart("openings", e)
                              }
                            ></div>
                          </th>
                          <th
                            className="text-center"
                            style={{
                              width: `${columnWidths.actions}px`,
                              position: "relative",
                            }}
                          >
                            <i className="fas fa-cogs mr-1"></i> Actions
                            <div
                              className="column-resizer"
                              onMouseDown={(e) =>
                                handleResizeStart("actions", e)
                              }
                            ></div>
                          </th>
                          <th
                            className="text-center"
                            style={{
                              width: `${columnWidths.candidates}px`,
                              position: "relative",
                            }}
                          >
                            <i className="fas fa-users mr-1"></i> Candidates
                            <div
                              className="column-resizer"
                              onMouseDown={(e) =>
                                handleResizeStart("candidates", e)
                              }
                            ></div>
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {jobs.length > 0 ? (
                          jobs.map((job) => (
                            <tr
                              key={job.jobID}
                              className={`job-row ${
                                job.status === 2 ? "job-hidden" : ""
                              } ${
                                isJobExpired(job.deadline) ? "job-expired" : ""
                              } ${job.priority ? "job-priority" : ""}`}
                            >
                              <td
                                className="clickable-cell"
                                onClick={() => handleViewDetail(job)}
                              >
                                <div className="job-title">
                                  {job.priority === true && (
                                    <i className="fas fa-gem text-primary mr-2"></i>
                                  )}
                                  <span
                                    className={`job-title-text ${
                                      isJobExpired(job.deadline)
                                        ? "text-danger"
                                        : ""
                                    }`}
                                  >
                                    {job.title}
                                  </span>
                                </div>
                              </td>
                              <td
                                className="clickable-cell"
                                onClick={() => handleViewDetail(job)}
                              >
                                {job.location || "Remote"}
                              </td>
                              <td
                                className="clickable-cell"
                                onClick={() => handleViewDetail(job)}
                              >
                                {job.salary
                                  ? `${job.salary.toLocaleString()}`
                                  : "Negotiable"}
                              </td>
                              <td
                                className="clickable-cell"
                                onClick={() => handleViewDetail(job)}
                              >
                                {getStatusBadge(job.status, job.deadline)}
                              </td>
                              <td
                                className="clickable-cell text-center"
                                onClick={() => handleViewDetail(job)}
                              >
                                {job.workType || "Full-Time"}
                              </td>
                              <td
                                className="clickable-cell"
                                onClick={() => handleViewDetail(job)}
                              >
                                {formatDateTimeNotIncludeTime(job.createdAt)}
                              </td>
                              <td
                                className="clickable-cell"
                                onClick={() => handleViewDetail(job)}
                              >
                                {formatDateTimeNotIncludeTime(job.deadline)}
                              </td>
                              <td
                                className="clickable-cell text-center"
                                onClick={() => handleViewDetail(job)}
                              >
                                {job.numberOfRecruitment || 1}
                              </td>
                              <td className="text-center">
                                <div
                                  className="action-buttons"
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "5px",
                                  }}
                                >
                                  {/* Top row - 2 buttons */}
                                  <button
                                    className="view-btn"
                                    onClick={() => handleViewDetail(job)}
                                  >
                                    <i className="fas fa-eye"></i> View
                                  </button>
                                  <button
                                    className="edit-btn"
                                    onClick={() => handleEdit(job.jobID)}
                                  >
                                    <i className="fas fa-edit"></i> Edit
                                  </button>

                                  {/* Bottom row - 2 buttons */}
                                  {/* Priority button */}
                                  {isJobExpired(job.deadline) ||
                                  job.status === 0 ||
                                  job.status === 1 ? (
                                    <button
                                      className="priority-btn disabled"
                                      disabled
                                      title={
                                        isJobExpired(job.deadline)
                                          ? "Cannot change priority for expired jobs"
                                          : job.status === 0
                                          ? "Cannot change priority for pending jobs"
                                          : "Cannot change priority for rejected jobs"
                                      }
                                    >
                                      <i
                                        className={`fas fa-gem ${
                                          job.priority ? "" : "text-secondary"
                                        }`}
                                      ></i>
                                      {job.priority
                                        ? "High Priority"
                                        : "Low Priority"}
                                    </button>
                                  ) : job.priority ? (
                                    <button
                                      className="priority-btn high-priority disabled"
                                      disabled
                                      title="High priority status cannot be changed until your subscription duration expires"
                                    >
                                      <i className="fas fa-gem"></i>
                                      High Priority
                                    </button>
                                  ) : (
                                    <ConfirmDialog
                                      title="Change to High Priority?"
                                      description="Are you sure you want to set this job to High Priority? This will count against your featured job limit and cannot be changed back until your subscription duration expires."
                                      confirmText="Set High"
                                      variant="primary"
                                      onConfirm={() =>
                                        handleTogglePriority(job.jobID)
                                      }
                                    >
                                      <button className="priority-btn low-priority">
                                        <i className="fas fa-gem text-secondary"></i>
                                        Set High Priority
                                      </button>
                                    </ConfirmDialog>
                                  )}

                                  {/* Hide/Unhide button */}
                                  {isJobExpired(job.deadline) ||
                                  job.status === 0 ||
                                  job.status === 1 ? (
                                    // Disabled button for expired, pending, or rejected jobs
                                    <button
                                      className="hide-btn disabled"
                                      disabled
                                      title={
                                        isJobExpired(job.deadline)
                                          ? "Cannot hide/unhide expired jobs"
                                          : job.status === 0
                                          ? "Cannot hide/unhide pending jobs"
                                          : "Cannot hide/unhide rejected jobs"
                                      }
                                    >
                                      <i className="fas fa-eye-slash"></i>{" "}
                                      {job.status === 2 ? "Unhide" : "Hide"}
                                    </button>
                                  ) : job.status !== 2 ? (
                                    <ConfirmDialog
                                      title="Hide job?"
                                      description="Are you sure you want to hide this job? It will not be visible to candidates."
                                      confirmText="Hide"
                                      variant="destructive"
                                      onConfirm={() => handleHideJob(job.jobID)}
                                    >
                                      <button className="hide-btn">
                                        <i className="fas fa-eye-slash"></i>{" "}
                                        Hide
                                      </button>
                                    </ConfirmDialog>
                                  ) : (
                                    <ConfirmDialog
                                      title="Show job?"
                                      description="Are you sure you want to show this job again? It will be visible to candidates."
                                      confirmText="Show"
                                      variant="primary"
                                      onConfirm={() =>
                                        handleUnhideJob(job.jobID)
                                      }
                                    >
                                      <button className="unhide-btn">
                                        <i className="fas fa-eye"></i> Unhide
                                      </button>
                                    </ConfirmDialog>
                                  )}
                                </div>
                              </td>
                              <td className="text-center">
                                <button
                                  className={`view-candidates-btn ${
                                    candidateCounts[job.jobID]
                                      ? "has-candidates"
                                      : "no-candidates"
                                  }`}
                                  onClick={() =>
                                    handleViewCandidates(job.jobID)
                                  }
                                  disabled={candidateCounts[job.jobID] === 0}
                                >
                                  <i className="fas fa-user-check"></i>{" "}
                                  {getCandidateButtonText(job.jobID)}
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr className="no-results">
                            <td colSpan="12">
                              <div className="no-jobs">
                                <i className="fas fa-briefcase-medical"></i>
                                <p>No jobs found</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>

                    {/* Pagination Component */}
                    <Pagination
                      currentPage={searchParams.PageIndex}
                      totalPage={totalPage}
                      setSearchParams={setSearchParams}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {renderJobDetailModal()}

      <ConfirmDialog
        title="Upgrade Subscription"
        description="To set more jobs to High Priority, you need to upgrade your subscription. Would you like to view available packages?"
        confirmText="View Packages"
        variant="primary"
        onConfirm={handleConfirmUpgrade}
        onCancel={handleCancelUpgrade}
        open={upgradeDialogOpen}
      >
        <button style={{ display: "none" }}></button>
      </ConfirmDialog>
    </section>
  );
}

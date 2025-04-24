import { useEffect, useState } from "react";
import {
  fetchCandidatesForJob,
  fetchJobDetails,
  sendInvitationForAPpliedCandidateEmail,
} from "../../../services/jobServices";
import { useParams, useNavigate } from "react-router-dom";
import Pagination from "./Pagination"; // Reusing your existing Pagination component
import { toast } from "react-toastify";
import axios from "axios";
import { getCVById } from "../../../services/cvServices"; // Add this import
import { Filter, Search, X } from "lucide-react";
// Import thêm thư viện cần thiết
import XLSX from "xlsx-js-style";
import { Download, FileText } from "lucide-react";
import openai from "@/lib/openai";

export default function CandidatesPage() {
  const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobTitle, setJobTitle] = useState("");
  const [totalPage, setTotalPage] = useState(1);
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    PageIndex: 1,
    PageSize: 5,
    name: "",
    email: "", // Thêm lọc email
    phone: "", // Thêm lọc số điện thoại
    status: "", // Thêm lọc trạng thái
  });

  // New state for message dialog
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [messageText, setMessageText] = useState(
    "Congratulations! We've reviewed your application and would like to schedule an interview with you. Please let us know your availability for the coming week."
  );

  const [isSending, setIsSending] = useState(false);
  const user = JSON.parse(localStorage.getItem("userLoginData")); // Get logged in employer data

  // State cho dialog phỏng vấn
  const [showInterviewDialog, setShowInterviewDialog] = useState(false);
  const [interviewDetails, setInterviewDetails] = useState({
    interviewDate: new Date(),
    interviewTime: "10:00",
    interviewType: "Virtual", // hoặc "In-Person"
    location: "",
    meetingLink: "",
    duration: 60,
    interviewerName: user?.fullName || "",
    interviewerPosition: jobTitle || "", // Giá trị mặc định
    companyName: user?.companyName || "",
    companyEmail: user?.email || "",
  });

  // Add these state variables
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Các state cần thêm vào component
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(null);

  // Add this function to handle search term changes
  const handleSearchTermChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    // Parse the search term to check if it looks like an email or phone
    if (term.includes("@")) {
      setSearchParams({
        ...searchParams,
        name: "",
        email: term,
        phone: "",
        PageIndex: 1,
      });
    } else if (/^\d+$/.test(term)) {
      // If it contains only digits, treat as phone
      setSearchParams({
        ...searchParams,
        name: "",
        email: "",
        phone: term,
        PageIndex: 1,
      });
    } else {
      // Otherwise treat as name
      setSearchParams({
        ...searchParams,
        name: term,
        email: "",
        phone: "",
        PageIndex: 1,
      });
    }
  };

  // Add this function to handle clearing all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setSearchParams({
      PageIndex: 1,
      PageSize: searchParams.PageSize,
      name: "",
      email: "",
      phone: "",
      status: "",
    });
  };

  useEffect(() => {
    getJobDetails(jobId);
    getCandidates(jobId);
  }, [
    jobId,
    searchParams.PageIndex,
    searchParams.PageSize,
    searchParams.name,
    searchParams.email,
    searchParams.phone,
    searchParams.status,
  ]);

  const getCandidates = async (jobId) => {
    try {
      setLoading(true);
      // Assuming your fetchCandidatesForJob function can accept pagination params
      const data = await fetchCandidatesForJob(jobId, searchParams);
      console.log("Fetched candidates data:", data);

      // Process candidates with CV data
      const processedCandidates = [];
      if (Array.isArray(data)) {
        // Fetch CV data for each candidate if they have a CV ID
        for (const candidate of data) {
          let enrichedCandidate = {
            ...candidate,
            // Default fallback name
            candidateName:
              candidate.candidateName ||
              candidate.fullName ||
              "Unknown Candidate",
          };

          // If candidate has a CV ID, try to fetch CV data
          if (candidate.cvid) {
            try {
              const cvData = await getCVById(candidate.cvid);
              console.log(
                `CV data for candidate ${candidate.applicationID}:`,
                cvData
              );

              enrichedCandidate = {
                ...enrichedCandidate,
                candidateName: `${cvData?.lastName} ${cvData?.firstName}`,
                email: cvData?.email || "Unknown",
                cvData: cvData,
              };
            } catch (cvError) {
              console.error(
                `Error fetching CV for candidate ${candidate.applicationID}:`,
                cvError
              );
            }
          }

          processedCandidates.push(enrichedCandidate);
        }
      }

      if (data.candidates && data.totalPage) {
        // Process paginated data similar to above
        const processedPaginatedCandidates = [];
        for (const candidate of data.candidates) {
          let enrichedCandidate = {
            ...candidate,
            candidateName:
              candidate.candidateName ||
              candidate.fullName ||
              "Unknown Candidate",
          };

          if (candidate.cvid) {
            try {
              const cvData = await getCVById(candidate.cvid);
              enrichedCandidate = {
                ...enrichedCandidate,
                candidateName:
                  cvData?.fullName || enrichedCandidate.candidateName,
                email: cvData?.email || enrichedCandidate.email,
                cvData: cvData,
              };
            } catch (cvError) {
              console.error(`Error fetching CV:`, cvError);
            }
          }

          processedPaginatedCandidates.push(enrichedCandidate);
        }

        setCandidates(processedPaginatedCandidates);
        setTotalPage(data.totalPage);
      } else {
        // If your API doesn't support pagination yet, handle it client-side
        setCandidates(data);

        // Calculate total pages based on data length
        const totalItems = data.length;
        const calculatedTotalPages = Math.ceil(
          totalItems / searchParams.PageSize
        );
        setTotalPage(calculatedTotalPages);

        // Paginate the data client-side
        const startIndex = (searchParams.PageIndex - 1) * searchParams.PageSize;
        const endIndex = startIndex + searchParams.PageSize;
        const filteredData = data
          .filter(
            (candidate) =>
              !searchParams.name ||
              (candidate.fullName &&
                candidate.fullName
                  .toLowerCase()
                  .includes(searchParams.name.toLowerCase()))
          )
          .slice(startIndex, endIndex);
        setCandidates(filteredData);
      }
      // Nếu API không hỗ trợ lọc trên server, thực hiện lọc ở client
      if (!data.candidates && Array.isArray(data)) {
        // Calculate total pages based on data length
        const totalItems = data.length;
        const calculatedTotalPages = Math.ceil(
          totalItems / searchParams.PageSize
        );
        setTotalPage(calculatedTotalPages);

        // Lọc dữ liệu theo các tiêu chí tìm kiếm
        const filteredData = data.filter((candidate) => {
          // Lọc theo tên
          const nameMatch =
            !searchParams.name ||
            (candidate.fullName &&
              candidate.fullName
                .toLowerCase()
                .includes(searchParams.name.toLowerCase()));

          // Lọc theo email
          const emailMatch =
            !searchParams.email ||
            (candidate.email &&
              candidate.email
                .toLowerCase()
                .includes(searchParams.email.toLowerCase()));

          // Lọc theo số điện thoại
          const phoneMatch =
            !searchParams.phone ||
            (candidate.phoneNumber &&
              candidate.phoneNumber.includes(searchParams.phone));

          // Lọc theo trạng thái
          const statusMatch =
            !searchParams.status ||
            (candidate.applicationStatus &&
              candidate.applicationStatus.toLowerCase() ===
                searchParams.status.toLowerCase());

          return nameMatch && emailMatch && phoneMatch && statusMatch;
        });

        // Phân trang dữ liệu đã lọc
        const startIndex = (searchParams.PageIndex - 1) * searchParams.PageSize;
        const endIndex = startIndex + searchParams.PageSize;
        const paginatedData = filteredData.slice(startIndex, endIndex);

        // Cập nhật số trang dựa trên dữ liệu đã lọc
        const filteredTotalPages = Math.ceil(
          filteredData.length / searchParams.PageSize
        );
        setTotalPage(filteredTotalPages || 1);

        setCandidates(paginatedData);
      }
      console.log("Processed candidates data:", processedCandidates);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching candidates:", error);
      toast.error("Could not load candidates. Please try again.");
    }
  };

  const getJobDetails = async (jobId) => {
    try {
      const jobDetails = await fetchJobDetails(jobId);
      console.log("Job details:", jobDetails);
      setInterviewDetails({
        ...interviewDetails,
        interviewerPosition: jobDetails.job.title,
      });
      setJobTitle(jobDetails.job.title || `Job #${jobId}`);
    } catch (error) {
      console.error("Error fetching job details:", error);
      setJobTitle(`Job #${jobId}`);
    }
  };

  const handleBackToJobs = () => {
    navigate("/employer/manage-jobs");
  };

  const getStatusBadge = (applicationStatus) => {
    let badgeClass = "status-badge";
    switch (applicationStatus?.toLowerCase()) {
      case "pending":
        badgeClass += " pending";
        break;
      case "approved":
        badgeClass += " accepted";
        break;
      case "rejected":
        badgeClass += " rejected";
        break;
      case "interview invited":
      case "interviewinvited": // Để hỗ trợ cả hai định dạng có thể có
        badgeClass += " interview-invited";
        break;
      default:
        badgeClass += " default";
    }

    return <span className={badgeClass}>{applicationStatus || "Unknown"}</span>;
  };

  // New function to handle message button click
  const handleMessageClick = (candidate) => {
    setSelectedCandidate({
      ...candidate,
      userID: candidate.userID, // Đảm bảo userID được thiết lập đúng
      fullName: candidate.fullName, // Đảm bảo fullName được thiết lập đúng
      email: candidate.email, // Đảm bảo email được thiết lập đúng
    });
    setShowMessageDialog(true);
  };

  // Update handleSendMessage
  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setIsSending(true);

    try {
      // Get sender (employer) and receiver (candidate) IDs
      const senderId = user.userID;
      const receiverId = selectedCandidate.userID; // Assuming this property exists

      // Create message data
      const messageData = {
        senderId: senderId,
        receiverId: receiverId,
        content: messageText.trim(),
      };

      // Send message through API endpoint
      await axios.post(`${BACKEND_API_URL}/api/Messages`, messageData);

      // Close dialog and reset state
      setShowMessageDialog(false);
      setSelectedCandidate(null);
      setMessageText(
        "Congratulations! We've reviewed your application and would like to schedule an interview with you. Please let us know your availability for the coming week."
      );

      toast.success("Message sent successfully!");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again later.");
    } finally {
      setIsSending(false);
    }
  };

  const handleInterviewClick = (candidate) => {
    setSelectedCandidate({
      ...candidate,
      userID: candidate.userID,
      fullName: candidate.fullName,
      email: candidate.email,
    });
    setShowInterviewDialog(true);
  };

  const handleSendInterviewInvitation = async () => {
    // Kiểm tra dữ liệu đầu vào
    if (!interviewDetails.interviewDate || !interviewDetails.interviewTime) {
      toast.error("Please provide a date and time for the interview");
      return;
    }

    if (
      interviewDetails.interviewType === "Virtual" &&
      !interviewDetails.meetingLink
    ) {
      toast.error("Please provide a meeting link for the virtual interview");
      return;
    }

    if (
      interviewDetails.interviewType === "In-Person" &&
      !interviewDetails.location
    ) {
      toast.error("Please provide a location for the in-person interview");
      return;
    }

    setIsSending(true);

    try {
      // Kết hợp ngày và giờ
      const interviewDateTime = new Date(interviewDetails.interviewDate);
      const [hours, minutes] = interviewDetails.interviewTime.split(":");
      interviewDateTime.setHours(parseInt(hours), parseInt(minutes));

      // Tạo dữ liệu yêu cầu theo cấu trúc DTO mới
      const requestData = {
        applicationId: selectedCandidate.applicationID,
        interviewDate: interviewDateTime.toISOString(),
        duration: interviewDetails.duration,
        interviewType: interviewDetails.interviewType === "Virtual" ? 2 : 1, // 1=In-Person, 2=Virtual
        location: interviewDetails.location,
        meetingLink: interviewDetails.meetingLink,
        interviewerName: interviewDetails.interviewerName,
        interviewerPosition: interviewDetails.interviewerPosition,
        companyName: user?.companyName || "",
        companyEmail: user?.email || "",
      };

      // Gọi API gửi lời mời phỏng vấn
      await sendInvitationForAPpliedCandidateEmail(requestData);

      // Đóng dialog và reset state
      setShowInterviewDialog(false);
      setSelectedCandidate(null);

      // Reset form dữ liệu
      setInterviewDetails({
        interviewDate: new Date(),
        interviewTime: "10:00",
        interviewType: "Virtual",
        location: "",
        meetingLink: "",
        duration: 60,
        interviewerName: user?.fullName || "",
        interviewerPosition: "",
      });

      toast.success("Interview invitation sent successfully!");

      // Làm mới danh sách ứng viên
      getCandidates(jobId);
    } catch (error) {
      console.error("Error sending interview invitation:", error);
      toast.error(
        "Failed to send interview invitation. Please try again later."
      );
    } finally {
      setIsSending(false);
    }
  };
  // Hàm phân tích CV bằng AI
  const analyzeCVWithOpenAI = async (cv, jobDetails, language = "en") => {
    try {
      // Chuẩn bị nội dung CV để phân tích
      const cvContent = prepareContentForAnalysis(cv, language);

      // Tạo prompt cho AI
      const systemPrompt =
        language === "vi"
          ? `Bạn là chuyên gia phân tích CV với hơn 15 năm kinh nghiệm trong lĩnh vực tuyển dụng. 
           Nhiệm vụ của bạn là tóm tắt CV của ứng viên và đánh giá mức độ phù hợp với vị trí công việc.
           
           Hãy phân tích chi tiết và chuyên nghiệp theo cấu trúc JSON với các mục sau:
           1. summary: Tóm tắt ngắn gọn về ứng viên (150-200 từ)
           2. keyStrengths: Mảng 3-5 điểm mạnh quan trọng liên quan đến vị trí
           3. keySkills: Mảng kỹ năng chính phù hợp với vị trí
           4. experienceHighlights: Tóm tắt kinh nghiệm nổi bật liên quan đến công việc
           5. educationFit: Đánh giá về trình độ học vấn với vị trí
           6. developmentAreas: Mảng 2-3 lĩnh vực ứng viên có thể cần phát triển
           7. interviewQuestions: Mảng 5 câu hỏi phỏng vấn cụ thể dựa trên CV và yêu cầu công việc
           8. fitRating: Đánh giá tổng thể mức độ phù hợp (1-10)
           9. recommendationSummary: Nhận xét tổng thể ngắn gọn (2-3 câu)
           
           QUAN TRỌNG: Phân tích phải được viết hoàn toàn bằng tiếng Việt.`
          : `You are a CV analysis expert with over 15 years of experience in recruitment. 
           Your task is to summarize a candidate's CV and evaluate their fit for a job position.
           
           Please analyze in detail and professionally according to the following JSON structure:
           1. summary: Brief summary of the candidate (150-200 words)
           2. keyStrengths: Array of 3-5 key strengths relevant to the position
           3. keySkills: Array of main skills that fit the position
           4. experienceHighlights: Summary of notable experience relevant to the job
           5. educationFit: Assessment of educational qualifications for the position
           6. developmentAreas: Array of 2-3 areas the candidate may need to develop
           7. interviewQuestions: Array of 5 specific interview questions based on the CV and job requirements
           8. fitRating: Overall fit rating (1-10)
           9. recommendationSummary: Brief overall comment (2-3 sentences)
           
           IMPORTANT: Analysis must be written completely in English.`;

      const userPrompt =
        language === "vi"
          ? `Hãy phân tích CV sau cho vị trí ${
              jobDetails.title || "không xác định"
            }:
           
           CV CONTENT:
           ${cvContent}
           
           JOB DESCRIPTION:
           ${
             jobDetails.description?.replace(/<[^>]*>/g, "") ||
             "Không có mô tả chi tiết."
           }
           
           JOB REQUIREMENTS:
           Skills: ${
             jobDetails.jobDetailTags?.map((tag) => tag.tagName).join(", ") ||
             "Không có thông tin"
           }
           Experience: ${jobDetails.exp || "Không xác định"} 
           Education: ${jobDetails.education || "Không xác định"}
           
           IMPORTANT: Vui lòng trả lời hoàn toàn bằng tiếng Việt và chỉ trả về kết quả dưới dạng JSON.`
          : `Please analyze the following CV for the position of ${
              jobDetails.title || "unspecified"
            }:
           
           CV CONTENT:
           ${cvContent}
           
           JOB DESCRIPTION:
           ${
             jobDetails.description?.replace(/<[^>]*>/g, "") ||
             "No detailed description available."
           }
           
           JOB REQUIREMENTS:
           Skills: ${
             jobDetails.jobDetailTags?.map((tag) => tag.tagName).join(", ") ||
             "No information"
           }
           Experience: ${jobDetails.exp || "Unspecified"} 
           Education: ${jobDetails.education || "Unspecified"}
           
           IMPORTANT: Please respond completely in English and return only JSON format results.`;

      // Gọi OpenAI API
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error(`Error analyzing CV in ${language}:`, error);
      return {
        error:
          language === "vi"
            ? "Không thể phân tích CV. Vui lòng thử lại sau."
            : "Could not analyze CV. Please try again later.",
      };
    }
  };

  // Thêm hàm này vào file component của bạn
  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return "Duration not specified";

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffInMonths =
      (end.getFullYear() - start.getFullYear()) * 12 +
      end.getMonth() -
      start.getMonth();

    if (diffInMonths < 12) {
      return `${diffInMonths} months`;
    } else {
      const years = Math.floor(diffInMonths / 12);
      const months = diffInMonths % 12;
      return months > 0 ? `${years} years, ${months} months` : `${years} years`;
    }
  };

  // Hàm chuẩn bị nội dung CV cho phân tích
  const prepareContentForAnalysis = (cv, language = "en") => {
    const labels = {
      en: {
        name: "Name",
        position: "Position",
        summary: "Summary",
        skills: "Skills",
        experience: "Professional Experience",
        education: "Education",
      },
      vi: {
        name: "Tên",
        position: "Vị trí",
        summary: "Tóm tắt",
        skills: "Kỹ năng",
        experience: "Kinh nghiệm làm việc",
        education: "Học vấn",
      },
    };

    const lang = labels[language] || labels.en;

    if (typeof cv === "string") return cv;

    let content = [];

    // Basic Info
    if (cv.firstName || cv.lastName) {
      content.push(`${lang.name}: ${cv.firstName || ""} ${cv.lastName || ""}`);
    }

    if (cv.jobPosition) {
      content.push(`${lang.position}: ${cv.jobPosition}`);
    }

    if (cv.summary) {
      content.push(`\n${lang.summary}:\n${cv.summary}`);
    }

    // Skills
    if (cv.skills) {
      content.push(`\n${lang.skills}:`);
      const skills = Array.isArray(cv.skills)
        ? cv.skills
        : Object.values(cv.skills);
      skills.forEach((skill) => {
        content.push(
          `- ${
            typeof skill === "object" ? skill.skillName || skill.name : skill
          }`
        );
      });
    }

    // Experience
    if (cv.experiences?.length > 0) {
      content.push(`\n${lang.experience}:`);
      cv.experiences.forEach((exp) => {
        if (typeof exp === "string") {
          content.push(exp);
        } else {
          const entry = [
            `${exp.jobPosition} at ${exp.companyName || "N/A"}`,
            `(${calculateDuration(exp.startedAt, exp.endedAt)})`,
            exp.description || "",
          ]
            .filter(Boolean)
            .join("\n");
          content.push(entry);
        }
      });
    }

    // Education
    if (cv.educations?.length > 0) {
      content.push(`\n${lang.education}:`);
      cv.educations.forEach((edu) => {
        if (typeof edu === "string") {
          content.push(edu);
        } else {
          const entry = [
            `${edu.degree} at ${edu.schoolName || "N/A"}`,
            `(${calculateDuration(edu.startedAt, edu.endedAt)})`,
          ]
            .filter(Boolean)
            .join("\n");
          content.push(entry);
        }
      });
    }

    return content.join("\n");
  };

  // Kiểm tra xem có ứng viên nào đang ở trạng thái Pending không
  const hasPendingCandidates = (candidates) => {
    return candidates.some(
      (candidate) => candidate.applicationStatus?.toLowerCase() === "pending"
    );
  };

  // Lọc ứng viên đủ điều kiện để phân tích (chỉ ở trạng thái Pending)
  const getEligibleCandidatesForAnalysis = (candidates) => {
    return candidates.filter((candidate) => {
      const status = candidate.applicationStatus?.toLowerCase();
      return status === "pending"; // Chỉ lấy ứng viên có trạng thái Pending
    });
  };

  // Hàm xử lý khi click nút Export to Excel
  const handleExportToExcel = async () => {
    // Kiểm tra xem có ứng viên pending không
    if (!hasPendingCandidates(candidates)) {
      toast.info(
        <div>
          <p>
            <strong>No candidates with 'Pending' status found!</strong>
          </p>
          <p>
            Only candidates with 'Pending' status can be analyzed with this
            tool.
          </p>
        </div>,
        {
          autoClose: 5000,
          closeOnClick: true,
          pauseOnHover: true,
        }
      );
      return;
    }

    // Tiến hành phân tích và xuất Excel
    try {
      setIsAnalyzing(true);

      // Lấy ứng viên đủ điều kiện để phân tích (chỉ các ứng viên Pending)
      const eligibleCandidates = getEligibleCandidatesForAnalysis(candidates);

      if (eligibleCandidates.length === 0) {
        toast.info("No candidates are qualified for analysis.");
        setIsAnalyzing(false);
        return;
      }

      // Lấy thông tin chi tiết về job để cung cấp ngữ cảnh cho phân tích
      const jobDetails = await fetchJobDetails(jobId);

      // Phân tích CV của từng ứng viên đủ điều kiện
      const analyzedCandidates = [];
      for (let i = 0; i < eligibleCandidates.length; i++) {
        const candidate = eligibleCandidates[i];

        // Cập nhật tiến trình
        setAnalysisProgress({
          current: i + 1,
          total: eligibleCandidates.length,
          candidateName: candidate.fullName || "Ứng viên",
        });

        // Lấy dữ liệu CV nếu chưa có
        let cvData = candidate.cvData;
        if (!cvData && candidate.cvid) {
          try {
            cvData = await getCVById(candidate.cvid);
          } catch (error) {
            console.error(
              `Lỗi khi lấy CV của ứng viên ${candidate.applicationID}:`,
              error
            );
          }
        }

        if (cvData) {
          // Phân tích CV bằng AI cho cả tiếng Việt và tiếng Anh
          const analysisEn = await analyzeCVWithOpenAI(
            cvData,
            jobDetails.job,
            "en"
          );
          const analysisVi = await analyzeCVWithOpenAI(
            cvData,
            jobDetails.job,
            "vi"
          );

          // Thêm vào danh sách đã phân tích
          analyzedCandidates.push({
            ...candidate,
            cvData,
            analysisEn,
            analysisVi,
          });
        } else {
          // Thêm ứng viên không có phân tích
          analyzedCandidates.push({
            ...candidate,
            analysisEn: { error: "No CV data available for analysis" },
            analysisVi: { error: "Không có dữ liệu CV để phân tích" },
          });
        }
      }

      // Tạo và tải xuống file Excel
      await exportToExcel(
        analyzedCandidates,
        jobDetails.job.title || `Job-${jobId}`
      );

      toast.success("Analysis & summary complete! Excel file downloaded.");
    } catch (error) {
      console.error("Lỗi khi xuất Excel:", error);
      toast.error(
        "Không thể phân tích CV và xuất Excel. Vui lòng thử lại sau."
      );
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(null);
    }
  };

  // Hàm xuất phân tích ra file Excel
  const exportToExcel = async (analyzedCandidates, jobTitle) => {
    // Tạo workbook mới
    const workbook = XLSX.utils.book_new();

    // Style chung cho toàn bộ cell
    const baseStyle = {
      alignment: {
        vertical: "top",
        wrapText: true,
      },
      border: {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      },
    };

    // Tạo dữ liệu cho 2 sheet
    const createSheetData = (isVietnamese) => {
      const rows = [];

      // Tiêu đề với style riêng
      const headers = isVietnamese
        ? [
            "Họ tên",
            "Email",
            "Số điện thoại",
            "Trạng thái",
            "Tóm tắt",
            "Điểm mạnh",
            "Kỹ năng chính",
            "Kinh nghiệm nổi bật",
            "Đánh giá học vấn",
            "Điểm cần phát triển",
            "Câu hỏi phỏng vấn",
            "Đánh giá phù hợp (1-10)",
            "Nhận xét tổng thể",
            "Nội dung CV",
          ]
        : [
            "Full Name",
            "Email",
            "Phone Number",
            "Status",
            "Summary",
            "Key Strengths",
            "Key Skills",
            "Experience Highlights",
            "Education Assessment",
            "Areas for Development",
            "Interview Questions",
            "Fit Rating (1-10)",
            "Recommendation",
            "CV Content",
          ];

      // Header style
      rows.push(
        headers.map((header) => ({
          v: header,
          s: {
            ...baseStyle,
            font: {
              bold: true,
              color: { rgb: "FFFFFF" },
              sz: 12,
            },
            fill: {
              fgColor: { rgb: "4472C4" },
            },
            alignment: {
              ...baseStyle.alignment,
              horizontal: "center",
            },
          },
        }))
      );

      // Dữ liệu ứng viên
      for (const candidate of analyzedCandidates) {
        // Sử dụng phân tích tiếng Việt hoặc tiếng Anh tùy theo loại sheet
        const analysis = isVietnamese
          ? candidate.analysisVi
          : candidate.analysisEn;

        // Chuẩn bị nội dung CV theo ngôn ngữ
        const cvContent = prepareContentForAnalysis(
          candidate.cvData || {},
          isVietnamese ? "vi" : "en"
        );

        // Định dạng dữ liệu
        const rowData = [
          { v: candidate.fullName || "N/A", s: baseStyle },
          { v: candidate.email || "N/A", s: baseStyle },
          { v: candidate.phoneNumber || "N/A", s: baseStyle },
          {
            v: candidate.applicationStatus || "N/A",
            s: {
              ...baseStyle,
              fill: getStatusColor(candidate.applicationStatus),
            },
          },
          { v: analysis.summary || "No data", s: baseStyle },
          { v: formatList(analysis.keyStrengths), s: baseStyle },
          { v: formatList(analysis.keySkills), s: baseStyle },
          { v: analysis.experienceHighlights || "No data", s: baseStyle },
          { v: analysis.educationFit || "No data", s: baseStyle },
          { v: formatList(analysis.developmentAreas), s: baseStyle },
          { v: formatNumberedList(analysis.interviewQuestions), s: baseStyle },
          {
            v: analysis.fitRating || "N/A",
            s: {
              ...baseStyle,
              fill: getRatingColor(analysis.fitRating),
            },
          },
          { v: analysis.recommendationSummary || "No data", s: baseStyle },
          { v: cvContent, s: baseStyle },
        ];

        rows.push(rowData);
      }

      return rows;
    };

    // Tạo và định dạng 2 sheet
    ["vi", "en"].forEach((lang) => {
      const isVietnamese = lang === "vi";
      const sheetData = createSheetData(isVietnamese);
      const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

      // Set column widths
      const colWidths = [
        { wch: 25 },
        { wch: 30 },
        { wch: 15 },
        { wch: 15 },
        { wch: 40 },
        { wch: 40 },
        { wch: 30 },
        { wch: 40 },
        { wch: 30 },
        { wch: 30 },
        { wch: 60 },
        { wch: 15 },
        { wch: 40 },
        { wch: 90 },
      ];

      worksheet["!cols"] = colWidths;
      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        isVietnamese ? "Phân tích ứng viên" : "Candidate Analysis"
      );
    });

    // Tạo file và tải xuống
    const excelBuffer = XLSX.write(workbook, { type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${jobTitle.replace(/[^a-zA-Z0-9]/g, "_")}_analysis.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Hàm hỗ trợ
  const formatList = (items) => {
    return Array.isArray(items)
      ? items.map((item) => `• ${item}`).join("\n")
      : items || "";
  };

  const formatNumberedList = (items) => {
    return Array.isArray(items)
      ? items.map((item, index) => `${index + 1}. ${item}`).join("\n\n")
      : items || "";
  };

  const getStatusColor = (status) => {
    const lowerStatus = (status || "").toLowerCase();
    return {
      fgColor: {
        rgb:
          lowerStatus === "approved"
            ? "C6EFCE"
            : lowerStatus === "rejected"
            ? "FFC7CE"
            : lowerStatus === "interview invited"
            ? "B4C6E7"
            : "FFFFFF",
      },
    };
  };

  const getRatingColor = (rating) => {
    const numRating = Number(rating) || 0;
    return {
      fgColor: {
        rgb: numRating >= 8 ? "C6EFCE" : numRating >= 6 ? "FFEB9C" : "FFC7CE",
      },
    };
  };

  return (
    <section className="user-dashboard">
      <div className="dashboard-outer">
        <div className="upper-title-box">
          <div className="title-flex">
            <button className="back-button" onClick={handleBackToJobs}>
              <i className="fas fa-arrow-left mr-1"></i> Back
            </button>
            <h3>
              {/* <i className="fas fa-users mr-2"></i> */}
              Candidates for:{" "}
              <span className="ml-2 text-primary">{jobTitle}</span>
            </h3>
          </div>
          <div className="search-filter-container">
            <div className="search-section">
              <div className="main-search-wrapper">
                <input
                  type="text"
                  className="main-search-input"
                  placeholder="Search candidates by name, email (must includes @) or phone..."
                  value={searchTerm}
                  onChange={handleSearchTermChange}
                />
                <button className="search-icon-button">
                  <Search size={18} strokeWidth={2} />
                </button>
              </div>

              <button
                className="filter-toggle-btn"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={18} />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>
            </div>

            {showFilters && (
              <div className="filters-section">
                <div className="filter-controls">
                  <div className="filter-group">
                    <label>Status:</label>
                    <select
                      className="filter-select"
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
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Interview Invited">
                        Interview Invited
                      </option>
                    </select>
                  </div>

                  <button
                    className="clear-filters-btn"
                    onClick={handleClearFilters}
                  >
                    <X size={16} /> Clear Filters
                  </button>
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
                  Applied Candidates
                </h4>
                <div className="widget-title-right">
                  <div className="refresh-button">
                    <button
                      className="btn-refresh"
                      onClick={() => getCandidates(jobId)}
                    >
                      <i className="fas fa-sync-alt"></i>
                    </button>
                  </div>

                  {/* Thêm nút Export Analysis */}
                  <div className="export-button">
                    <button
                      className="btn-export"
                      onClick={handleExportToExcel}
                      disabled={
                        loading ||
                        isAnalyzing ||
                        !hasPendingCandidates(candidates) // Thay đổi điều kiện ở đây
                      }
                      title={
                        !hasPendingCandidates(candidates)
                          ? "No pending candidates to analyze" // Thay đổi thông báo
                          : "Analyze pending candidates and export to Excel"
                      }
                    >
                      <Download size={16} />
                      <span>Analyze & Summary CVs</span>
                    </button>
                  </div>

                  {/* Thêm màn hình hiển thị tiến trình phân tích */}
                  {isAnalyzing && (
                    <div className="analysis-overlay">
                      <div className="analysis-progress">
                        <div className="spinner">
                          <i className="fas fa-cog fa-spin"></i>
                        </div>
                        <h3>Analyzing CV with AI</h3>
                        {analysisProgress && (
                          <>
                            <p>
                              Analyzing CV of {analysisProgress.candidateName} (
                              {analysisProgress.current}/
                              {analysisProgress.total})
                            </p>
                            <div className="progress-bar-container">
                              <div
                                className="progress-bar"
                                style={{
                                  width: `${
                                    (analysisProgress.current /
                                      analysisProgress.total) *
                                    100
                                  }%`,
                                }}
                              ></div>
                            </div>
                          </>
                        )}
                        <p className="analysis-note">
                          This process may take a few minutes. Please do not
                          close this window.
                        </p>
                      </div>
                    </div>
                  )}

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
                    <span>Loading candidates...</span>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="default-table manage-job-table">
                      <thead>
                        <tr>
                          <th>
                            <i className="fas fa-user mr-1"></i> Name
                          </th>
                          <th>
                            <i className="fas fa-envelope mr-1"></i> Email
                          </th>
                          <th>
                            <i className="fas fa-phone mr-1"></i> Phone
                          </th>
                          <th>
                            <i className="fas fa-info-circle mr-1"></i> Status
                          </th>
                          <th className="text-center">
                            <i className="fas fa-cogs mr-1"></i> Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {candidates.length > 0 ? (
                          candidates.map((candidate) => (
                            <tr key={candidate.applicationID}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="flex-shrink-0">
                                    <img
                                      src={
                                        candidate?.avatar
                                          ? candidate.avatar
                                          : "https://www.topcv.vn/images/avatar-default.jpg"
                                      }
                                      alt={candidate.fullName || "Candidate"}
                                      className="rounded-circle"
                                      width="50"
                                      height="50"
                                    />
                                  </div>
                                  <div className="flex-grow-1 ms-3 text-truncate">
                                    <span className="fw-bold">
                                      {candidate.fullName ||
                                        "Unknown Candidate"}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td>
                                <a
                                  href={`mailto:${candidate.email}`}
                                  className="email-link"
                                >
                                  {candidate.email || "Unknown"}
                                </a>
                              </td>
                              <td>
                                {candidate.phoneNumber ? (
                                  <a
                                    href={`tel:${candidate.phoneNumber}`}
                                    className="phone-link"
                                  >
                                    {candidate.phoneNumber}
                                  </a>
                                ) : (
                                  "Unknown"
                                )}
                              </td>
                              <td>
                                {getStatusBadge(candidate.applicationStatus)}
                              </td>
                              <td className="text-center">
                                <div className="action-buttons">
                                  {/* View Detail Button */}
                                  <button
                                    className="view-detail-btn"
                                    onClick={() =>
                                      navigate(
                                        `/employer/manage-jobs/candidates/${jobId}/${candidate.applicationID}`
                                      )
                                    }
                                  >
                                    <i className="fas fa-eye"></i> View Detail
                                  </button>

                                  {/* Message Button - Only show for Approved candidates */}
                                  {candidate.applicationStatus?.toLowerCase() ===
                                    "approved" && (
                                    <>
                                      {/* Message Button */}
                                      <button
                                        className="message-btn"
                                        onClick={() =>
                                          handleMessageClick(candidate)
                                        }
                                      >
                                        <i className="fas fa-comment-alt"></i>{" "}
                                        Message
                                      </button>

                                      {/* Interview Button - Nút mới thêm vào */}
                                      <button
                                        className="interview-btn"
                                        onClick={() =>
                                          handleInterviewClick(candidate)
                                        }
                                      >
                                        <i className="fas fa-calendar-alt"></i>{" "}
                                        Schedule Interview
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr className="no-results">
                            <td colSpan="5">
                              <div className="no-candidates">
                                <i className="fas fa-user-slash"></i>
                                <p>No candidates found</p>
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

      {/* Message Dialog */}
      {showMessageDialog && selectedCandidate && (
        <div className="message-dialog-overlay">
          <div className="message-dialog">
            <div className="message-dialog-header">
              <h3>Send Message to {selectedCandidate.fullName}</h3>
              <button
                className="close-btn"
                onClick={() => setShowMessageDialog(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="message-dialog-body">
              <p className="message-info">
                You&apos;re about to send a message to this approved candidate.
                This will notify them via email and in-app notification.
              </p>

              <div className="candidate-details">
                <div className="detail-item">
                  <span className="label">Email:</span>
                  <span className="value">{selectedCandidate.email}</span>
                </div>
                {selectedCandidate.phoneNumber && (
                  <div className="detail-item">
                    <span className="label">Phone:</span>
                    <span className="value">
                      {selectedCandidate.phoneNumber}
                    </span>
                  </div>
                )}
                <div className="detail-item">
                  <span className="label">Job Position:</span>
                  <span className="value">{jobTitle}</span>
                </div>
              </div>

              <div className="message-textarea-container">
                <label>Your message:</label>
                <textarea
                  className="message-textarea"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Enter your message to the candidate..."
                  rows={6}
                ></textarea>
              </div>
            </div>
            <div className="message-dialog-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowMessageDialog(false)}
              >
                Cancel
              </button>
              <button
                className="send-btn"
                onClick={handleSendMessage}
                disabled={isSending}
              >
                {isSending ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Sending...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i> Send Message
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interview Invitation Dialog */}
      {showInterviewDialog && selectedCandidate && (
        <div className="message-dialog-overlay">
          <div className="message-dialog interview-dialog">
            <div className="message-dialog-header">
              <h3>Schedule Interview with {selectedCandidate.fullName}</h3>
              <button
                className="close-btn"
                onClick={() => setShowInterviewDialog(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="message-dialog-body">
              <p className="message-info">
                You&apos;re about to schedule an interview with this candidate.
                They will receive an email with the interview details.
              </p>

              <div className="candidate-details">
                <div className="detail-item">
                  <span className="label">Email:</span>
                  <span className="value">{selectedCandidate.email}</span>
                </div>
                {selectedCandidate.phoneNumber && (
                  <div className="detail-item">
                    <span className="label">Phone:</span>
                    <span className="value">
                      {selectedCandidate.phoneNumber}
                    </span>
                  </div>
                )}
                <div className="detail-item">
                  <span className="label">Job Position:</span>
                  <span className="value">{jobTitle}</span>
                </div>
              </div>

              <div className="interview-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Interview Date:</label>
                    <input
                      type="date"
                      value={
                        interviewDetails.interviewDate
                          .toISOString()
                          .split("T")[0]
                      }
                      onChange={(e) =>
                        setInterviewDetails({
                          ...interviewDetails,
                          interviewDate: new Date(e.target.value),
                        })
                      }
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div className="form-group">
                    <label>Time:</label>
                    <input
                      type="time"
                      value={interviewDetails.interviewTime}
                      onChange={(e) =>
                        setInterviewDetails({
                          ...interviewDetails,
                          interviewTime: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Interview Type:</label>
                    <select
                      value={interviewDetails.interviewType}
                      onChange={(e) => {
                        setInterviewDetails({
                          ...interviewDetails,
                          interviewType: e.target.value,
                        });
                      }}
                    >
                      <option value="Virtual">Virtual</option>
                      <option value="In-Person">In-Person</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Duration (minutes):</label>
                    <input
                      type="number"
                      value={interviewDetails.duration}
                      onChange={(e) =>
                        setInterviewDetails({
                          ...interviewDetails,
                          duration: parseInt(e.target.value),
                        })
                      }
                      min="15"
                      step="15"
                    />
                  </div>
                </div>

                {interviewDetails.interviewType === "Virtual" ? (
                  <div className="form-group">
                    <label>Meeting Link:</label>
                    <input
                      type="text"
                      value={interviewDetails.meetingLink}
                      onChange={(e) =>
                        setInterviewDetails({
                          ...interviewDetails,
                          meetingLink: e.target.value,
                        })
                      }
                      placeholder="Enter meeting URL (Zoom, Google Meet, etc.)"
                    />
                  </div>
                ) : (
                  <div className="form-group">
                    <label>Location:</label>
                    <input
                      type="text"
                      value={interviewDetails.location}
                      onChange={(e) =>
                        setInterviewDetails({
                          ...interviewDetails,
                          location: e.target.value,
                        })
                      }
                      placeholder="Enter physical address for the interview"
                    />
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label>Interviewer Name:</label>
                    <input
                      type="text"
                      value={interviewDetails.interviewerName}
                      onChange={(e) =>
                        setInterviewDetails({
                          ...interviewDetails,
                          interviewerName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Interviewer Position:</label>
                    <input
                      type="text"
                      value={interviewDetails.interviewerPosition}
                      onChange={(e) =>
                        setInterviewDetails({
                          ...interviewDetails,
                          interviewerPosition: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="message-dialog-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowInterviewDialog(false)}
              >
                Cancel
              </button>
              <button
                className="send-btn"
                onClick={handleSendInterviewInvitation}
                disabled={isSending}
              >
                {isSending ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Sending...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i> Send Invitation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .view-detail-btn, .message-btn {
          padding: 6px 12px;
          border-radius: 4px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .view-detail-btn {
          background-color: #6c757d;
          color: white;
        }

        .view-detail-btn:hover {
          background-color: #5a6268;
        }
        
        .message-btn {
          background-color: #0088cc;
          color: white;
        }
        
        .message-btn:hover {
          background-color: #0077b5;
        }
        
        /* Message Dialog Styles */
        .message-dialog-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .message-dialog {
          background-color: white;
          border-radius: 8px;
          width: 90%;
          max-width: 600px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          max-height: 90vh;
          overflow: hidden;
        }
        
        .message-dialog-header {
          padding: 15px 20px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .message-dialog-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }
        
        .close-btn {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #888;
          padding: 5px;
        }
        
        .close-btn:hover {
          color: #333;
        }
        
        .message-dialog-body {
          padding: 20px;
          overflow-y: auto;
        }
        
        .message-info {
          background-color: #f8f9fa;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 15px;
          color: #495057;
          font-size: 14px;
          border-left: 4px solid #0088cc;
        }
        
        .candidate-details {
          margin-bottom: 20px;
          background-color: #f8f9fa;
          padding: 12px;
          border-radius: 6px;
        }
        
        .detail-item {
          margin-bottom: 8px;
          display: flex;
        }
        
        .detail-item .label {
          font-weight: 600;
          width: 100px;
          color: #495057;
        }
        
        .detail-item .value {
          color: #212529;
        }
        
        .message-textarea-container {
          margin-bottom: 10px;
        }
        
        .message-textarea-container label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
        }
        
        .message-textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: inherit;
          resize: vertical;
          min-height: 120px;
        }
        
        .message-textarea:focus {
          border-color: #0088cc;
          outline: none;
          box-shadow: 0 0 0 2px rgba(0, 136, 204, 0.2);
        }
        
        .message-dialog-footer {
          padding: 15px 20px;
          border-top: 1px solid #eee;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        
        .cancel-btn, .send-btn {
          padding: 8px 16px;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .cancel-btn {
          background-color: #f8f9fa;
          border: 1px solid #ddd;
          color: #495057;
        }
        
        .cancel-btn:hover {
          background-color: #e9ecef;
        }
        
        .send-btn {
          background-color: #0088cc;
          border: none;
          color: white;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .send-btn:hover {
          background-color: #0077b5;
        }
        
        .upper-title-box {
          margin-bottom: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
        }

        .title-flex {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .back-button {
          display: inline-flex;  /* Changed from flex to inline-flex */
          align-items: center;
          background-color: #f8f9fa;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 8px 15px;
          font-weight: 600;
          color: #495057;
          cursor: pointer;
          transition: all 0.3s;
          margin-bottom: 10px;
          width: fit-content;  /* Added to make width match content */
        }

        .back-button:hover {
          background-color: #e9ecef;
          color: #212529;
        }

        .back-button i {
          margin-right: 5px;
        }

        .upper-title-box h3 {
          font-size: 24px;
          font-weight: 600;
        }

        .text-primary {
          color: #3498db;
        }

        .search-box-container {
          position: relative;
          min-width: 250px;
        }

        .search-input-wrapper {
          position: relative;
        }

        .search-input {
          padding: 8px 15px;
          padding-right: 35px;
          border: 1px solid #ddd;
          border-radius: 4px;
          width: 100%;
        }

        .search-icon {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #6c757d;
        }

        .ls-widget {
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
          overflow: hidden;
          margin-bottom: 30px;
        }

        .widget-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          background: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
        }

        .widget-title h4 {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
        }

        .widget-title-right {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .page-size-selector {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .page-size-selector label {
          margin: 0;
          font-weight: 500;
        }

        .page-size-selector select {
          padding: 5px 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
        }

        .btn-refresh {
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 5px 15px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-refresh:hover {
          background: #f1f1f1;
          border-color: #ccc;
        }

        .widget-content {
          padding: 20px;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 200px;
          flex-direction: column;
          gap: 10px;
          color: #666;
        }

        .loading-container i {
          font-size: 32px;
          color: #3498db;
        }

        .table-responsive {
          overflow-x: auto;
        }

        .default-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }

        .default-table th {
          background: #f8f9fa;
          padding: 12px 15px;
          text-align: left;
          font-weight: 600;
          color: #495057;
          border-bottom: 2px solid #dee2e6;
        }

        .default-table th.text-center {
          text-align: center;
        }

        .default-table td {
          padding: 12px 15px;
          border-bottom: 1px solid #dee2e6;
          vertical-align: middle;
        }

        .default-table td.text-center {
          text-align: center;
        }

        .default-table tr:hover {
          background-color: #f8f9fa;
        }

        .candidate-name {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .candidate-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .candidate-info {
          display: flex;
          flex-direction: column;
        }

        .candidate-info .name {
          font-weight: 600;
        }

        .email-link,
        .phone-link {
          color: #3498db;
          text-decoration: none;
        }

        .email-link:hover,
        .phone-link:hover {
          text-decoration: underline;
        }

        .status-badge {
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 0.85em;
          font-weight: 600;
          display: inline-block;
        }

        .status-badge.pending {
          background-color: #fff3cd;
          color: #856404;
        }

        .status-badge.accepted {
          background-color: #d4edda;
          color: #155724;
        }

        .status-badge.rejected {
          background-color: #f8d7da;
          color: #721c24;
        }

        .status-badge.default {
          background-color: #e2e3e5;
          color: #383d41;
        }

        .action-buttons {
          display: flex;
          gap: 10px;
          justify-content: center;
        }

        .accept-btn,
        .reject-btn {
          padding: 6px 12px;
          border-radius: 4px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .accept-btn {
          background-color: #28a745;
          color: white;
        }

        .accept-btn:hover:not(:disabled) {
          background-color: #218838;
        }

        .reject-btn {
          background-color: #dc3545;
          color: white;
        }

        .reject-btn:hover:not(:disabled) {
          background-color: #c82333;
        }

        .accept-btn:disabled,
        .reject-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .no-results td {
          padding: 30px 15px;
        }

        .no-candidates {
          display: flex;
          flex-direction: column;
          align-items: center;
          color: #6c757d;
        }

        .no-candidates i {
          font-size: 48px;
          margin-bottom: 15px;
        }

        .no-candidates p {
          font-size: 16px;
          margin: 0;
        }

        .mr-1 {
          margin-right: 4px;
        }

        .mr-2 {
          margin-right: 8px;
        }

        .interview-btn {
  background-color: #28a745;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 5px;
}

.interview-btn:hover {
  background-color: #218838;
}

.interview-dialog {
  max-width: 650px;
}

.interview-form {
  margin-top: 20px;
}

.form-row {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

@media (max-width: 576px) {
  .form-row {
    flex-direction: column;
  }
}
@media (max-width: 576px) {
  .upper-title-box {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box-container {
    width: 100%;
    margin-top: 15px;
  }
  
  .search-input-wrapper {
    width: 100%;
  }
  
  .filter-inputs {
    flex-direction: column;
    width: 100%;
  }
  
  .filter-input, .filter-select, .clear-filters-btn {
    width: 100%;
  }
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-weight: 500;
}

.form-group input,
.form-group select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #0088cc;
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 136, 204, 0.2);
}
.status-badge.interview-invited {
  background-color: #cff4fc;
  color: #055160;
}
.filter-inputs {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.filter-input, .filter-select {
  flex: 1 1 150px;
  padding: 6px 10px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.filter-input:focus, .filter-select:focus {
  border-color: #0088cc;
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 136, 204, 0.2);
}

@media (max-width: 768px) {
  .filter-inputs {
    flex-direction: column;
  }
  
  .filter-input, .filter-select {
    width: 100%;
  }
}
.clear-filters-btn {
  padding: 6px 12px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #6c757d;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 5px;
}

.clear-filters-btn:hover {
  background-color: #e9ecef;
  color: #495057;
}
/* New search and filter styles */
.search-filter-container {
  width: 100%;
  margin-bottom: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.search-section {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.main-search-wrapper {
  position: relative;
  flex: 1;
}

.main-search-input {
  width: 100%;
  padding: 10px 15px;
  padding-right: 40px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 16px;
  transition: all 0.3s;
}

.main-search-input:focus {
  border-color: #0088cc;
  box-shadow: 0 0 0 3px rgba(0,136,204,0.15);
  outline: none;
}

.search-icon-button {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
}

.search-icon-button:hover {
  color: #212529;
}

.filter-toggle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #fff;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 8px 15px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.filter-toggle-btn:hover {
  background-color: #f1f3f5;
  border-color: #ced4da;
}

.filters-section {
  background-color: #fff;
  border-radius: 6px;
  padding: 15px;
  border: 1px solid #dee2e6;
  margin-top: 10px;
}

.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
  justify-content: space-between;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-weight: 500;
  margin: 0;
  white-space: nowrap;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 5px;
  min-width: 150px;
}

.clear-filters-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 15px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 5px;
  color: #6c757d;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-left: auto;
}

.clear-filters-btn:hover {
  background-color: #e9ecef;
  color: #495057;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .search-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-toggle-btn {
    margin-top: 10px;
  }
  
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-select {
    width: 100%;
  }
  
  .clear-filters-btn {
    width: 100%;
    justify-content: center;
    margin-top: 10px;
  }
}
/* CSS cho nút Export và màn hình loading */
.export-button {
  margin-left: 10px;
}

.btn-export {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
}

.btn-export:hover:not(:disabled) {
  background-color: #218838;
}

.btn-export:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
  opacity: 0.65;
}

/* CSS cho màn hình phân tích */
.analysis-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.analysis-progress {
  background-color: white;
  border-radius: 8px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.spinner {
  margin-bottom: 20px;
}

.spinner i {
  font-size: 40px;
  color: #0088cc;
}

.analysis-progress h3 {
  margin-bottom: 20px;
  color: #333;
}

.progress-bar-container {
  width: 100%;
  height: 10px;
  background-color: #e9ecef;
  border-radius: 5px;
  margin: 15px 0 25px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #0088cc;
  border-radius: 5px;
  transition: width 0.3s ease;
}

.analysis-note {
  color: #6c757d;
  font-size: 14px;
  margin-top: 20px;
}

      `}</style>
    </section>
  );
}

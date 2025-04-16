import { useState, useEffect, useRef } from "react";
import {
  FileText,
  Search,
  Mail,
  Phone,
  MapPin,
  Download,
  Eye,
  GraduationCap,
  Briefcase,
  Check,
  Info,
  Calendar,
  Tag,
  X,
  Brain,
  Sparkles,
  Cpu,
  FileCheck,
  ClipboardList,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { fetchJobDetailsV2 } from "@/services/jobServices";
import {
  fetchCandidatesWithFeaturedCVForJob,
  uploadCVToScan,
} from "@/services/cvServices";
import openai from "@/lib/openai";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  calculateDuration,
  generateCVMatchingPrompt,
} from "@/lib/prompts/candidateMatching";
import { generateJobAnalysisPrompt } from "@/lib/prompts/jobAnalysis";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import CVDialog from "./CVDialog";
import { exportCandidatesToExcel } from "@/helpers/excelExport";
import { AIAnalysisDialog } from "./AIAnalysisDialog";
import { CandidatePagination } from "./CandidatePagination";

const CandidateMatchingPage = () => {
  const { jobId } = useParams();
  const user = JSON.parse(localStorage.getItem("userLoginData"));
  const userId = user?.userID || null;
  const [job, setJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [matchedCandidates, setMatchedCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("all");
  const [filters, setFilters] = useState({
    position: "all",
    location: "all",
    education: "all",
    skills: "all",
  });
  const [expandedSkills, setExpandedSkills] = useState({});
  const [expandedExperiences, setExpandedExperiences] = useState({});
  const isProcessing = useRef(false);
  const pendingRequests = useRef({}).current;
  const [updateStatus, setUpdateStatus] = useState({
    jobNeedsUpdate: false,
    candidatesUpdated: false,
    lastChecked: null,
  });

  // Processing stages
  const [stage, setStage] = useState("initial"); // initial, analyzing-job, displaying-requirements, matching-candidates, complete
  const [progress, setProgress] = useState(0);
  const [jobRequirements, setJobRequirements] = useState(null);

  const [openCVDialog, setOpenCVDialog] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedCV, setSelectedCV] = useState(null);

  // Thêm state mới cho dialog AI Analysis
  const [openAIAnalysisDialog, setOpenAIAnalysisDialog] = useState(false);
  const [selectedAnalysisCandidate, setSelectedAnalysisCandidate] =
    useState(null);

  // Hàm để mở dialog phân tích AI
  const handleViewAIAnalysis = (candidate) => {
    setSelectedAnalysisCandidate(candidate);
    setOpenAIAnalysisDialog(true);
  };

  const handleViewCV = (candidate) => {
    setSelectedCandidate(candidate);
    setSelectedCV(candidate.featuredCVs[0]); // Lấy CV đầu tiên từ danh sách featuredCVs
    setOpenCVDialog(true);
  };

  // First, filter by tab view mode
  let candidatesByTab =
    viewMode === "all"
      ? matchedCandidates
      : matchedCandidates.filter((c) => {
          if (viewMode === "high") return c.matchPercentage >= 90;
          if (viewMode === "medium")
            return c.matchPercentage >= 80 && c.matchPercentage < 90;
          if (viewMode === "moderate")
            return c.matchPercentage >= 70 && c.matchPercentage < 80;
          return true;
        });

  // Handle search and filters
  const filteredCandidates = candidatesByTab.filter((candidate) => {
    // Search filter
    const matchesSearch =
      !searchTerm ||
      candidate.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.featuredCVs[0]?.jobPosition
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    // Position filter
    const matchesPosition =
      filters.position === "all" ||
      candidate.featuredCVs[0]?.jobPosition
        ?.toLowerCase()
        .includes(filters.position.toLowerCase());

    // Location filter
    const matchesLocation =
      filters.location === "all" ||
      candidate.address?.toLowerCase().includes(filters.location.toLowerCase());

    // Education filter
    const matchesEducation =
      filters.education === "all" ||
      candidate.featuredCVs[0]?.educations?.some((edu) =>
        edu.degree?.toLowerCase().includes(filters.education.toLowerCase())
      );

    // Skills filter
    const matchesSkills =
      filters.skills === "all" ||
      candidate.matchingSkills?.some((skill) =>
        skill.toLowerCase().includes(filters.skills.toLowerCase())
      );

    return (
      matchesSearch &&
      matchesPosition &&
      matchesLocation &&
      matchesEducation &&
      matchesSkills
    );
  });

  // For job analysis
  const analyzeJobRequirements = async (jobData) => {
    console.log("jobData: ", jobData);
    try {
      const prompt = generateJobAnalysisPrompt(jobData);
      const completion = await openai.chat.completions.create(prompt);
      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error("Error analyzing job requirements:", error);
      throw error;
    }
  };

  // For candidate matching
  const analyzeCVMatch = async (cvData, jobRequirements) => {
    console.log("cvData trước khi normalize:", cvData);
    try {
      // Kiểm tra và điều chỉnh cấu trúc cvData
      let normalizedData = cvData;

      // Nếu cvData là string, giữ nguyên
      // Nếu cvData không phải string, cần đảm bảo nó có cấu trúc đúng
      if (typeof cvData !== "string") {
        // Trường hợp skills không phải array
        if (cvData.skills && !Array.isArray(cvData.skills)) {
          // Nếu skills là string, chuyển thành array
          if (typeof cvData.skills === "string") {
            cvData.skills = cvData.skills
              .split(",")
              .map((skill) => ({ skillName: skill.trim() }));
          }
          // Nếu skills là object, chuyển thành array
          else if (typeof cvData.skills === "object") {
            cvData.skills = Object.values(cvData.skills).map((skill) =>
              typeof skill === "object"
                ? skill
                : { skillName: String(skill).trim() }
            );
          }
        }
      }

      console.log("cvData sau khi xử lý:", normalizedData);
      const prompt = generateCVMatchingPrompt(normalizedData, jobRequirements);
      const completion = await openai.chat.completions.create(prompt);
      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error("Error analyzing CV match:", error);
      throw error;
    }
  };

  /**
   * Hàm chuẩn hóa CV để phân tích
   * Xử lý cả CV JSON và CV tải lên
   */
  const normalizeCV = async (cv, candidateId) => {
    // Kiểm tra loại CV và trích xuất nội dung tương ứng
    if (cv.filePath) {
      // Đây là CV tải lên cần scan
      try {
        // Chỉ scan nếu chưa có content
        if (!cv.extractedContent) {
          const cvData = await uploadCVToScan({
            cvid: cv.cvid || 0,
            userID: candidateId,
            fileName: cv.fileName,
            filePath: cv.filePath,
          });

          // Trả về nội dung đã scan (đã là text string)
          return cvData.content;
        } else {
          // Sử dụng nội dung đã scan trước đó
          return cv.extractedContent;
        }
      } catch (error) {
        console.error(`Lỗi khi scan CV: ${error}`);
        return null;
      }
    } else {
      // Đây là CV có cấu trúc JSON
      // Xử lý skills an toàn
      let skillsArray = [];

      if (cv.skills) {
        if (Array.isArray(cv.skills)) {
          skillsArray = cv.skills.map((s) =>
            typeof s === "string"
              ? s
              : s.skillName || s.name || JSON.stringify(s)
          );
        } else if (typeof cv.skills === "string") {
          skillsArray = cv.skills.split(",").map((s) => s.trim());
        } else if (typeof cv.skills === "object") {
          skillsArray = Object.values(cv.skills).map((s) =>
            typeof s === "string" ? s : JSON.stringify(s)
          );
        }
      }

      // Format theo cấu trúc mà hàm analyzeCVMatch cần
      const structuredContent = {
        jobPosition: cv.jobPosition || "",
        summary: cv.summary || "",
        skills: skillsArray.join(", "), // Chuyển thành string
        experiences: Array.isArray(cv.experiences)
          ? cv.experiences.map(
              (e) =>
                `${e.jobPosition || ""} at ${
                  e.companyName || ""
                } (${calculateDuration(e.startedAt, e.endedAt)}): ${
                  e.description || ""
                }`
            )
          : [],
        education: Array.isArray(cv.educations)
          ? cv.educations.map(
              (e) =>
                `${e.degree || ""} at ${
                  e.schoolName || ""
                } (${calculateDuration(e.startedAt, e.endedAt)})`
            )
          : [],
      };

      return structuredContent;
    }
  };

  /**
   * Kiểm tra cập nhật CV trong nền
   * Chỉ cập nhật các CV đã thay đổi
   */
  const checkForCVUpdates = async (jobRequirements) => {
    if (!jobRequirements) return false;

    try {
      // Lấy dữ liệu ứng viên mới nhất
      const candidatesData = await fetchCandidatesWithFeaturedCVForJob(jobId);
      setCandidates(candidatesData);

      // Lấy phiên bản ứng viên đã cache
      let candidateVersions = JSON.parse(
        localStorage.getItem(`candidateVersions-${jobId}`) || "{}"
      );
      let cachedMatchedCandidates = JSON.parse(
        localStorage.getItem(`matchedCandidates-${jobId}`) || "[]"
      );

      // Kiểm tra từng ứng viên
      let updatedCandidates = [...cachedMatchedCandidates]; // Bắt đầu với danh sách hiện có
      let hasUpdates = false;

      for (const candidate of candidatesData) {
        if (!candidate.featuredCVs || candidate.featuredCVs.length === 0)
          continue;

        const cv = candidate.featuredCVs[0];
        const cvVersion = cv.updatedAt || Date.now().toString();
        const candidateKey = `candidate-${candidate.userID}`;

        // Kiểm tra xem CV đã cập nhật chưa
        const isUpdated =
          !candidateVersions[candidateKey] ||
          candidateVersions[candidateKey] !== cvVersion;

        if (isUpdated) {
          console.log(
            `CV cập nhật cho ứng viên ${candidate.userID}, làm mới phân tích`
          );
          hasUpdates = true;

          // Xử lý CV đã cập nhật
          try {
            // Chuẩn hóa CV
            const normalizedCV = await normalizeCV(cv, candidate.userID);
            if (!normalizedCV) continue;

            // Tạo khóa và thực hiện phân tích
            const matchKey = `candidate-${candidate.userID}-${jobId}`;

            // Xóa request cũ
            delete pendingRequests[matchKey];

            // Thực hiện phân tích
            pendingRequests[matchKey] = analyzeCVMatch(
              normalizedCV,
              jobRequirements
            );

            const matchResult = await pendingRequests[matchKey];

            // Tìm và xóa ứng viên cũ nếu có
            const existingIndex = updatedCandidates.findIndex(
              (c) => c.userID === candidate.userID
            );
            if (existingIndex !== -1) {
              updatedCandidates.splice(existingIndex, 1);
            }

            // Tạo đối tượng ứng viên đã cập nhật
            const updatedCandidate = {
              ...candidate,
              matchPercentage: matchResult.matchPercentage,
              matchingSkills: matchResult.matchingSkills,
              missingCriticalSkills: matchResult.missingCriticalSkills,
              domainExpertise: matchResult.domainExpertise,
              experienceDetails: matchResult.experienceDetails,
              educationMatch: matchResult.educationMatch,
              matchAnalysis: matchResult.matchAnalysis,
            };

            // Thêm vào danh sách ứng viên đã cập nhật
            updatedCandidates.push(updatedCandidate);

            // Cập nhật theo dõi phiên bản
            candidateVersions[candidateKey] = cvVersion;
          } catch (error) {
            console.error(`Lỗi khi phân tích CV đã cập nhật: ${error}`);
          }
        }
      }

      // Nếu có cập nhật, gộp và lưu
      if (hasUpdates) {
        // Lọc và sắp xếp ứng viên
        const sortedCandidates = updatedCandidates
          .filter((c) => c.matchPercentage >= 70)
          .sort((a, b) => b.matchPercentage - a.matchPercentage);

        // Cập nhật state và cache
        setMatchedCandidates(sortedCandidates);
        localStorage.setItem(
          `matchedCandidates-${jobId}`,
          JSON.stringify(sortedCandidates)
        );
        localStorage.setItem(
          `candidateVersions-${jobId}`,
          JSON.stringify(candidateVersions)
        );

        return true; // Có cập nhật
      }

      return false; // Không có cập nhật
    } catch (error) {
      console.error("Lỗi khi kiểm tra cập nhật CV:", error);
      return false;
    }
  };

  // processData function với cơ chế cache và tránh trùng lặp
  const processData = async (forceRefresh = false) => {
    try {
      // Kiểm tra xem đã đang xử lý chưa
      if (isProcessing.current) {
        console.log("Đang xử lý, bỏ qua");
        return;
      }

      // Đánh dấu đang xử lý
      isProcessing.current = true;

      // Nếu không phải force refresh, kiểm tra cache
      if (!forceRefresh) {
        // Kiểm tra localStorage
        const storedJobRequirements = localStorage.getItem(
          `jobRequirements-${jobId}`
        );
        const storedJobVersion = localStorage.getItem(`jobVersion-${jobId}`);
        const storedJob = localStorage.getItem(`job-${jobId}`);
        const storedMatchedCandidates = localStorage.getItem(
          `matchedCandidates-${jobId}`
        );

        // Nếu có dữ liệu cache
        if (
          storedJobRequirements &&
          storedJobVersion &&
          storedJob &&
          storedMatchedCandidates
        ) {
          // Tải job mới nhất để kiểm tra phiên bản
          const jobData = await fetchJobDetailsV2(jobId);
          const currentJobVersion =
            jobData.job.updatedAt || Date.now().toString();

          // Nếu job chưa thay đổi, sử dụng cache
          if (storedJobVersion === currentJobVersion.toString()) {
            console.log("Sử dụng dữ liệu từ cache - job chưa thay đổi");
            setJob(JSON.parse(storedJob));
            setJobRequirements(JSON.parse(storedJobRequirements));
            setMatchedCandidates(JSON.parse(storedMatchedCandidates));
            setStage("complete");
            setProgress(100);

            // Kiểm tra cập nhật CV trong nền
            checkForCVUpdates(JSON.parse(storedJobRequirements));
            return;
          }
        }
      }

      // Nếu đến đây, cần phân tích lại
      setStage("initial");
      setProgress(0);

      // Lấy dữ liệu job đầy đủ
      const jobData = await fetchJobDetailsV2(jobId);
      setJob(jobData.job);
      const currentJobVersion = jobData.job.updatedAt || Date.now().toString();
      localStorage.setItem(`job-${jobId}`, JSON.stringify(jobData.job));
      setProgress(10);

      // Phân tích yêu cầu job
      setStage("analyzing-job");
      setProgress(20);

      try {
        const requirementsResponse = await analyzeJobRequirements(jobData.job);
        console.log("Kết quả phân tích job: ", requirementsResponse);
        setJobRequirements(requirementsResponse);

        // Lưu cache với phiên bản
        localStorage.setItem(
          `jobRequirements-${jobId}`,
          JSON.stringify(requirementsResponse)
        );
        localStorage.setItem(
          `jobVersion-${jobId}`,
          currentJobVersion.toString()
        );

        setProgress(60);
        setStage("displaying-requirements");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setProgress(70);
      } catch (error) {
        console.error("Lỗi khi phân tích job:", error);
        throw error;
      }

      // Ghép ứng viên
      setStage("matching-candidates");

      const candidatesData = await fetchCandidatesWithFeaturedCVForJob(jobId);
      console.log("Dữ liệu ứng viên: ", candidatesData);
      setCandidates(candidatesData);

      // Xử lý từng ứng viên
      const processedCandidates = [];
      const candidateVersions = {};

      for (let i = 0; i < candidatesData.length; i++) {
        const candidate = candidatesData[i];
        setProgress(70 + Math.floor((i / candidatesData.length) * 20));

        if (candidate.featuredCVs && candidate.featuredCVs.length > 0) {
          const cv = candidate.featuredCVs[0];
          const candidateKey = `candidate-${candidate.userID}`;
          const cvVersion = cv.updatedAt || Date.now().toString();

          try {
            // Xử lý CV
            const normalizedCV = await normalizeCV(cv, candidate.userID);
            if (!normalizedCV) continue;

            // Tạo khóa duy nhất để tránh lệnh gọi API trùng lặp
            const matchKey = `candidate-${candidate.userID}-${jobId}`;

            // Xóa request cũ nếu có
            if (pendingRequests[matchKey]) {
              delete pendingRequests[matchKey];
            }

            // Phân tích ghép CV với job
            pendingRequests[matchKey] = analyzeCVMatch(
              normalizedCV,
              jobRequirements
            );

            const matchResult = await pendingRequests[matchKey];
            console.log(
              "Kết quả ghép cho ứng viên",
              candidate.userID,
              ":",
              matchResult
            );

            // Gộp dữ liệu ứng viên với kết quả ghép
            processedCandidates.push({
              ...candidate,
              matchPercentage: matchResult.matchPercentage,
              matchingSkills: matchResult.matchingSkills,
              missingCriticalSkills: matchResult.missingCriticalSkills,
              domainExpertise: matchResult.domainExpertise,
              experienceDetails: matchResult.experienceDetails,
              educationMatch: matchResult.educationMatch,
              matchAnalysis: matchResult.matchAnalysis,
            });

            // Lưu phiên bản CV
            candidateVersions[candidateKey] = cvVersion;
          } catch (error) {
            console.error(`Lỗi khi phân tích CV: ${error}`);
            continue;
          }
        }
      }

      // Lọc và sắp xếp ứng viên
      const sortedCandidates = processedCandidates
        .filter((c) => c.matchPercentage >= 70)
        .sort((a, b) => b.matchPercentage - a.matchPercentage);

      setMatchedCandidates(sortedCandidates);
      localStorage.setItem(
        `matchedCandidates-${jobId}`,
        JSON.stringify(sortedCandidates)
      );
      localStorage.setItem(
        `candidateVersions-${jobId}`,
        JSON.stringify(candidateVersions)
      );
      setProgress(100);

      // Hoàn thành
      setStage("complete");
    } catch (error) {
      console.error("Lỗi khi xử lý dữ liệu:", error);
      setStage("error");
    } finally {
      isProcessing.current = false;
    }
  };

  /**
   * Làm mới thủ công toàn bộ phân tích
   */
  const handleRefreshAnalysis = async () => {
    // Xóa tất cả cache cho job này
    localStorage.removeItem(`jobRequirements-${jobId}`);
    localStorage.removeItem(`matchedCandidates-${jobId}`);
    localStorage.removeItem(`jobVersion-${jobId}`);
    localStorage.removeItem(`candidateVersions-${jobId}`);

    // Xóa các request đang chờ
    Object.keys(pendingRequests).forEach((key) => {
      if (key.includes(`-${jobId}-`)) {
        delete pendingRequests[key];
      }
    });

    // Cập nhật trạng thái
    setUpdateStatus({
      jobNeedsUpdate: false,
      candidatesUpdated: false,
      lastChecked: new Date().toISOString(),
    });

    // Chạy lại quá trình
    await processData(true);
  };

  // useEffect ban đầu để xử lý dữ liệu
  useEffect(() => {
    if (jobId) {
      console.log("Xử lý dữ liệu ban đầu cho job ID:", jobId);
      processData();
    }
  }, [jobId]);

  // useEffect kiểm tra cập nhật nền
  useEffect(() => {
    let isMounted = true;
    let checkInterval;

    const setupBackgroundChecks = () => {
      // Kiểm tra cập nhật mỗi 5 phút
      checkInterval = setInterval(() => {
        if (isMounted && stage === "complete" && jobRequirements) {
          checkForJobUpdates();
        }
      }, 0.5 * 60 * 1000); // 30 giây
    };

    const checkForJobUpdates = async () => {
      console.log("Kiểm tra cập nhật job trong nền...");

      try {
        const jobData = await fetchJobDetailsV2(jobId);
        const currentJobVersion =
          jobData.job.updatedAt || Date.now().toString();
        const cachedJobVersion = localStorage.getItem(`jobVersion-${jobId}`);

        if (!cachedJobVersion || cachedJobVersion !== currentJobVersion) {
          console.log("Job đã cập nhật, cần làm mới yêu cầu");
          setUpdateStatus((prev) => ({ ...prev, jobNeedsUpdate: true }));
        } else {
          // Kiểm tra cập nhật CV ngay cả khi job không thay đổi
          const candidatesUpdated = await checkForCVUpdates(jobRequirements);
          if (candidatesUpdated) {
            setUpdateStatus((prev) => ({ ...prev, candidatesUpdated: true }));
          }
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra cập nhật:", error);
      }
    };

    if (stage === "complete") {
      setupBackgroundChecks();
    }

    // Cleanup
    return () => {
      isMounted = false;
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [jobId, jobRequirements, stage]);

  // Handle export to Excel
  const handleExportToExcel = () => {
    console.log("Exporting to Excel");
    // Implementation for Excel export
    exportCandidatesToExcel(job, matchedCandidates, {
      fileName: `${job?.companyName}_${job?.title}_Analysis.xlsx`,
      includeJobInfo: true,
    });
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      position: "all",
      location: "all",
      education: "all",
      skills: "all",
    });
    setSearchTerm("");
  };

  const [currentPage, setCurrentPage] = useState(1);
  const candidatesPerPage = 3; // Hiển thị 3 ứng viên mỗi trang

  // Tính toán ứng viên hiển thị cho trang hiện tại
  const indexOfLastCandidate = currentPage * candidatesPerPage;
  const indexOfFirstCandidate = indexOfLastCandidate - candidatesPerPage;
  const currentCandidates = filteredCandidates.slice(
    indexOfFirstCandidate,
    indexOfLastCandidate
  );

  // Render loading states
  const renderLoadingState = () => {
    if (stage === "initial") {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <h3 className="text-lg font-medium mb-2">Initializing analysis</h3>
          <p className="text-muted-foreground">
            Preparing to analyze job requirements...
          </p>
        </div>
      );
    }

    if (stage === "analyzing-job") {
      return (
        <div className="flex flex-col items-center justify-center h-90">
          <div className="relative mb-8">
            <div className="animate-pulse flex space-x-4 items-center mb-6">
              <div className="space-y-3 w-64">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            </div>
          </div>
          <Brain className="h-16 w-16 text-primary text-center mb-2" />
          <h3 className="text-lg font-medium mb-2">
            Analyzing job requirements with AI
          </h3>
          <p className="text-muted-foreground">
            Extracting essential skills and qualifications...
          </p>
          <Progress
            value={progress}
            className="rounded bg-gray-300 w-64 mt-4"
          />
        </div>
      );
    }

    if (stage === "matching-candidates") {
      return (
        <div className="flex flex-col items-center justify-center h-90">
          <div className="relative mb-8">
            <div className="animate-pulse flex space-x-4 items-center mb-6">
              <div className="space-y-3 w-64">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            </div>
          </div>
          <Cpu className="h-16 w-16 text-primary text-center" />
          <h3 className="text-lg font-medium mb-2">
            Matching candidates to requirements
          </h3>
          <p className="text-muted-foreground">
            Analyzing CVs and calculating match scores...
          </p>
          <Progress
            value={progress}
            className="rounded bg-gray-300 w-64 mt-4"
          />
        </div>
      );
    }

    if (stage === "error") {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-red-500">
          <X className="h-16 w-16 mb-4" />
          <h3 className="text-lg font-medium mb-2">Error Occurred</h3>
          <p className="text-muted-foreground">
            Unable to complete the analysis. Please try again.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      );
    }
  };

  return (
    <>
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold">
              AI Candidate Matching: {job?.title || "Job"}
            </h1>
            <p className="text-muted-foreground">
              Finding optimal candidates through AI-powered skill matching
            </p>
          </div>
          {/* Thêm thông báo cập nhật bên trên danh sách ứng viên */}
          {updateStatus.jobNeedsUpdate && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4 flex items-center justify-between"
            >
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                <span className="text-amber-800">
                  This job has been significantly updated. Would you like to
                  refresh the analysis to get the latest requirements?
                </span>
              </div>
              <Button size="sm" onClick={handleRefreshAnalysis}>
                Refresh
              </Button>
            </motion.div>
          )}

          {updateStatus.candidatesUpdated && !updateStatus.jobNeedsUpdate && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4 flex items-center justify-between"
            >
              <div className="flex items-center">
                <RefreshCw className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-blue-800">
                  Candidates have been automatically updated with the latest CV
                  data.
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setUpdateStatus((prev) => ({
                    ...prev,
                    candidatesUpdated: false,
                  }))
                }
              >
                Close
              </Button>
            </motion.div>
          )}

          <div className="flex gap-2">
            {stage === "complete" && (
              <>
                <Button onClick={handleExportToExcel}>
                  <Download className="mr-2 h-4 w-4" /> Export to Excel
                </Button>

                <Button
                  variant="outline"
                  onClick={handleRefreshAnalysis}
                  disabled={isProcessing.current}
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${
                      isProcessing.current ? "animate-spin" : ""
                    }`}
                  />
                  Refresh Analysis
                </Button>

                {/* Add the Job Requirements button */}
                {jobRequirements && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Eye className="mr-2 h-4 w-4" /> View Job Requirements
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-4xl p-0 overflow-hidden">
                      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                        <CardContent className="p-6">
                          <div className="flex items-center mb-4">
                            <Sparkles className="h-5 w-5 text-blue-600 mr-2" />
                            <h2 className="text-xl font-semibold text-blue-800">
                              Key Job Requirements Identified
                            </h2>
                          </div>

                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Must-Have Skills */}
                            <div>
                              <h3 className="font-medium text-blue-700 mb-2">
                                Must-Have Skills
                              </h3>
                              <ul className="space-y-1">
                                {jobRequirements.technicalSkills
                                  .filter((skill) => skill.required)
                                  .map((skill, index) => (
                                    <li
                                      key={index}
                                      className="flex items-center"
                                    >
                                      <Check className="h-4 w-4 text-green-600 mr-2" />
                                      <span>
                                        {skill.skill}{" "}
                                        {skill.importance > 8 && (
                                          <Badge
                                            variant="outline"
                                            className="ml-1 text-xs rounded bg-red-100 text-red-600 hover:bg-red-100"
                                          >
                                            Critical
                                          </Badge>
                                        )}
                                      </span>
                                    </li>
                                  ))}
                              </ul>
                            </div>

                            {/* Preferred Skills */}
                            <div>
                              <h3 className="font-medium text-blue-700 mb-2">
                                Preferred Skills
                              </h3>
                              {jobRequirements.technicalSkills.filter(
                                (skill) => !skill.required
                              ).length > 0 ? (
                                <ul className="space-y-1">
                                  {jobRequirements.technicalSkills
                                    .filter((skill) => !skill.required)
                                    .map((skill, index) => (
                                      <li
                                        key={index}
                                        className="flex items-center"
                                      >
                                        <Check className="h-4 w-4 text-blue-400 mr-2" />
                                        <span>{skill.skill}</span>
                                      </li>
                                    ))}
                                </ul>
                              ) : (
                                <p className="text-slate-500">
                                  No preferred skills specified for this
                                  position.
                                </p>
                              )}
                            </div>

                            {/* Key Requirements */}
                            <div className="mt-4">
                              <h3 className="font-medium text-blue-700 mb-2">
                                Key Requirements
                              </h3>
                              <ul className="space-y-1">
                                {jobRequirements.keyRequirements.map(
                                  (req, index) => (
                                    <li
                                      key={index}
                                      className="flex items-start"
                                    >
                                      <Check className="h-4 w-4 text-blue-600 mr-2 mt-1" />
                                      <span>
                                        {req.requirement}{" "}
                                        {req.required && (
                                          <Badge
                                            variant="outline"
                                            className="ml-1 text-xs rounded bg-red-100 text-red-600 hover:bg-red-100"
                                          >
                                            Required
                                          </Badge>
                                        )}
                                      </span>
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          </div>

                          <div className="flex justify-center mt-6">
                            <Badge className="rounded bg-blue-600 text-white px-3 py-1 hover:bg-blue-600">
                              Finding candidates matching these requirements...
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </DialogContent>
                  </Dialog>
                )}
              </>
            )}
          </div>
        </div>

        {/* Job Requirements Display - Animated fade in from top */}
        <AnimatePresence>
          {stage === "displaying-requirements" && jobRequirements && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, staggerChildren: 0.1 }}
              className="mb-8"
            >
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Sparkles className="h-5 w-5 text-blue-600 mr-2" />
                    <h2 className="text-xl font-semibold text-blue-800">
                      Key Job Requirements Identified
                    </h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Job Requirements Display */}
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h3 className="font-medium text-blue-700 mb-2">
                        Must-Have Skills
                      </h3>
                      <ul className="space-y-1">
                        {jobRequirements.technicalSkills
                          .filter((skill) => skill.required)
                          .map((skill, index) => (
                            <motion.li
                              key={index}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 + index * 0.1 }}
                              className="flex items-center"
                            >
                              <Check className="h-4 w-4 text-green-600 mr-2" />
                              <span>
                                {skill.skill}{" "}
                                {skill.importance > 8 && (
                                  <Badge
                                    variant="outline"
                                    className="ml-1 text-xs rounded bg-red-100 text-red-600 hover:bg-red-100"
                                  >
                                    Critical
                                  </Badge>
                                )}
                              </span>
                            </motion.li>
                          ))}
                      </ul>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <h3 className="font-medium text-blue-700 mb-2">
                        Preferred Skills
                      </h3>
                      {jobRequirements.technicalSkills.filter(
                        (skill) => !skill.required
                      ).length > 0 ? (
                        <ul className="space-y-1">
                          {jobRequirements.technicalSkills
                            .filter((skill) => !skill.required)
                            .map((skill, index) => (
                              <li key={index} className="flex items-center">
                                <Check className="h-4 w-4 text-blue-400 mr-2" />
                                <span>{skill.skill}</span>
                              </li>
                            ))}
                        </ul>
                      ) : (
                        <p className="text-slate-500">
                          No preferred skills specified for this position.
                        </p>
                      )}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="mt-4"
                    >
                      <h3 className="font-medium text-blue-700 mb-2">
                        Key Requirements
                      </h3>
                      <ul className="space-y-1">
                        {jobRequirements.keyRequirements.map((req, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 + index * 0.1 }}
                            className="flex items-start"
                          >
                            <Check className="h-4 w-4 text-blue-600 mr-2 mt-1" />
                            <span>
                              {req.requirement}{" "}
                              {req.required && (
                                <Badge
                                  variant="outline"
                                  className="ml-1 text-xs rounded bg-red-100 text-red-600 hover:bg-red-100"
                                >
                                  Required
                                </Badge>
                              )}
                            </span>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-4"
                  >
                    <h3 className="font-medium text-blue-700 mb-2">
                      Key Requirements
                    </h3>
                    <ul className="space-y-1">
                      {jobRequirements.keyRequirements.map((req, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + index * 0.1 }}
                          className="flex items-start"
                        >
                          <Check className="h-4 w-4 text-blue-600 mr-2 mt-1" />
                          <span>
                            {req.requirement}{" "}
                            {req.required && (
                              <Badge
                                variant="outline"
                                className="ml-1 text-xs rounded bg-red-100 text-red-600 hover:bg-red-100"
                              >
                                Required
                              </Badge>
                            )}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="flex justify-center mt-6"
                  >
                    <Badge className="rounded bg-blue-600 text-white px-3 py-1 hover:bg-blue-600">
                      Finding candidates matching these requirements...
                    </Badge>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading States */}
        {stage !== "complete" &&
          stage !== "displaying-requirements" &&
          renderLoadingState()}

        {/* Results Display - only show when complete */}
        {stage === "complete" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Filter tabs */}
            <div className="mb-4">
              <Tabs value={viewMode} onValueChange={setViewMode}>
                <TabsList className="border-b rounded-none bg-transparent w-full justify-start h-auto p-0">
                  <TabsTrigger
                    value="all"
                    className="py-2 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none bg-transparent h-auto"
                  >
                    All Matches ({matchedCandidates.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="high"
                    className="py-2 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none bg-transparent h-auto"
                  >
                    High Matches (90%+)
                  </TabsTrigger>
                  <TabsTrigger
                    value="medium"
                    className="py-2 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none bg-transparent h-auto"
                  >
                    Medium Matches (80-89%)
                  </TabsTrigger>
                  <TabsTrigger
                    value="moderate"
                    className="py-2 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none bg-transparent h-auto"
                  >
                    Moderate Matches (70-79%)
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Advanced Filter Controls */}
            <div className="bg-slate-50 p-4 rounded-md mb-6">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="text-sm font-medium">Filters:</span>

                <Select
                  value={filters.position}
                  onValueChange={(val) =>
                    setFilters({ ...filters, position: val })
                  }
                >
                  <SelectTrigger className="w-36 h-8 text-sm">
                    <Tag className="w-3.5 h-3.5 mr-2" />
                    <span className="">
                      <span>Position</span>
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Positions</SelectItem>
                    <SelectItem value="developer">Developer</SelectItem>
                    <SelectItem value="designer">Designer</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.location}
                  onValueChange={(val) =>
                    setFilters({ ...filters, location: val })
                  }
                >
                  <SelectTrigger className="w-36 h-8 text-sm">
                    <MapPin className="w-3.5 h-3.5 mr-2" />
                    <span className="flex items-center">
                      <span>Location</span>
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="hanoi">Hanoi</SelectItem>
                    <SelectItem value="hcmc">Ho Chi Minh City</SelectItem>
                    <SelectItem value="danang">Da Nang</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.education}
                  onValueChange={(val) =>
                    setFilters({ ...filters, education: val })
                  }
                >
                  <SelectTrigger className="w-36 h-8 text-sm">
                    <GraduationCap className="w-3.5 h-3.5 mr-2" />
                    <span className="flex items-center">
                      <span>Education</span>
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Education</SelectItem>
                    <SelectItem value="bachelor">Bachelor</SelectItem>
                    <SelectItem value="master">Master</SelectItem>
                    <SelectItem value="phd">PhD</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.skills}
                  onValueChange={(val) =>
                    setFilters({ ...filters, skills: val })
                  }
                >
                  <SelectTrigger className="w-36 h-8 text-sm">
                    <FileCheck className="w-3.5 h-3.5 mr-2" />
                    <span className="flex items-center">
                      <span>Key Skills</span>
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Skills</SelectItem>
                    <SelectItem value="react">React</SelectItem>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={resetFilters}
                >
                  <X className="mr-1 h-3.5 w-3.5" /> Clear
                </Button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name, position or skills..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Candidate listing */}
            {filteredCandidates.length > 0 ? (
              <div id="candidates-list" className="space-y-6">
                {currentCandidates.map((candidate, index) => {
                  return (
                    <motion.div
                      key={candidate.userID}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      {/* Candidate Card */}
                      <Card className="overflow-hidden border-slate-200 hover:border-slate-300 transition-all duration-200">
                        <CardContent className="p-0">
                          {/* Match percentage banner */}
                          <div
                            className={`w-full h-1.5 ${
                              candidate.matchPercentage >= 90
                                ? "bg-green-500"
                                : candidate.matchPercentage >= 80
                                ? "bg-blue-500"
                                : "bg-amber-500"
                            }`}
                          ></div>

                          <div className="flex flex-col lg:flex-row">
                            {/* Left column - candidate info */}
                            <div className="p-5 md:w-1/4 lg:w-1/4 lg:border-r bg-slate-50">
                              <div className="flex items-center gap-3 mb-4">
                                <Avatar className="h-16 w-16 rounded-md border shadow-sm">
                                  {candidate.avatar ? (
                                    <AvatarImage src={candidate.avatar} />
                                  ) : (
                                    <AvatarFallback className="bg-primary/10 text-primary font-semibold rounded-md">
                                      {candidate.fullName?.charAt(0) || "?"}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-medium">
                                      {candidate.fullName}
                                    </h3>
                                    {candidate.userID === 12 && (
                                      <Badge className="bg-amber-400 text-black text-xs px-1 py-0.5 hover:bg-amber-400">
                                        PRO
                                      </Badge>
                                    )}
                                  </div>
                                  {/* <p className="text-sm text-muted-foreground">
                                  {cv?.jobPosition || "Candidate FIX"}
                                </p> */}
                                </div>
                              </div>

                              <div className="space-y-2.5 mt-4 text-sm">
                                <div className="flex items-center text-slate-600">
                                  <Mail className="mr-2 h-4 w-4 text-slate-400" />
                                  <span className="truncate">
                                    {candidate.isPrivated
                                      ? "[protected data]"
                                      : candidate.email}
                                  </span>
                                </div>
                                {candidate.phoneNumber && (
                                  <div className="flex items-center text-slate-600">
                                    <Phone className="mr-2 h-4 w-4 text-slate-400" />
                                    <span>
                                      {candidate.isPrivated
                                        ? "[protected data]"
                                        : candidate.phoneNumber}
                                    </span>
                                  </div>
                                )}
                                {candidate.address && (
                                  <div className="flex items-center text-slate-600">
                                    <MapPin className="mr-2 h-4 w-4 text-slate-400" />
                                    <span>{candidate.address}</span>
                                  </div>
                                )}
                              </div>

                              {/* Match Score */}
                              <div className="mt-5 bg-white rounded-md p-3 border">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-sm font-medium flex items-center">
                                          <Brain className="mr-1.5 h-3.5 w-3.5" />
                                          AI Match Score
                                        </span>
                                        <Info className="h-3.5 w-3.5 text-slate-400" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent
                                      side="top"
                                      className="max-w-xs"
                                    >
                                      <p className="text-xs">
                                        AI-calculated match between candidate
                                        skills and job requirements
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <div className="flex items-center gap-3">
                                  <Progress
                                    value={candidate.matchPercentage}
                                    className="h-2.5 rounded bg-gray-300"
                                    indicatorclassname={
                                      candidate.matchPercentage >= 90
                                        ? "bg-green-500"
                                        : candidate.matchPercentage >= 80
                                        ? "bg-blue-500"
                                        : "bg-amber-500"
                                    }
                                  />
                                  <span
                                    className={`text-sm font-semibold ${
                                      candidate.matchPercentage >= 90
                                        ? "text-green-600"
                                        : candidate.matchPercentage >= 80
                                        ? "text-blue-600"
                                        : "text-amber-600"
                                    }`}
                                  >
                                    {candidate.matchPercentage}%
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Right column - Match analysis */}
                            <div className="p-5 md:w-3/4 lg:w-3/4">
                              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                                <h4 className="text-lg font-medium mb-2 md:mb-0">
                                  Match Assessment
                                </h4>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full md:w-auto border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-purple-500 transition-all duration-200"
                                    onClick={() =>
                                      handleViewAIAnalysis(candidate)
                                    }
                                  >
                                    <Brain className="mr-1.5 h-3.5 w-3.5 text-purple-600" />{" "}
                                    AI Analysis
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full md:w-auto border border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-600 transition-all duration-200"
                                    onClick={() => handleViewCV(candidate)}
                                  >
                                    <Eye className="mr-1.5 h-3.5 w-3.5 text-blue-600" />{" "}
                                    View Full CV
                                  </Button>
                                </div>
                              </div>

                              {/* Matching Skills - Vẫn hiển thị */}
                              <div className="mt-4">
                                <h5 className="text-sm font-medium mb-2 flex items-center">
                                  <Tag className="mr-1.5 h-3.5 w-3.5 text-blue-500" />
                                  Matching Skills
                                </h5>
                                <div className="flex flex-wrap gap-1.5">
                                  {candidate.matchingSkills
                                    .slice(
                                      0,
                                      expandedSkills[candidate.userID]
                                        ? undefined
                                        : 6
                                    )
                                    .map((skill, idx) => (
                                      <Badge
                                        variant="outline"
                                        className="rounded-md bg-blue-50 text-blue-700 text-xs border-blue-200"
                                        key={idx}
                                      >
                                        {skill}
                                      </Badge>
                                    ))}
                                  {candidate.matchingSkills.length > 6 &&
                                    !expandedSkills[candidate.userID] && (
                                      <Badge
                                        variant="outline"
                                        className="cursor-pointer rounded-md bg-blue-50 text-blue-700 text-xs border-blue-200"
                                        onClick={() =>
                                          setExpandedSkills({
                                            ...expandedSkills,
                                            [candidate.userID]: true,
                                          })
                                        }
                                      >
                                        +{candidate.matchingSkills.length - 6}{" "}
                                        more
                                      </Badge>
                                    )}
                                </div>
                              </div>

                              {/* Experience Summary - CẢI TIẾN */}
                              <div className="mt-4">
                                <h5 className="text-sm font-medium mb-2 flex items-center">
                                  <Briefcase className="mr-1.5 h-3.5 w-3.5 text-blue-500" />
                                  Experience Summary
                                </h5>
                                <div className="p-3 bg-slate-50 rounded-md border">
                                  {candidate.experienceDetails.length > 0 ? (
                                    <div className="text-sm text-slate-600">
                                      <div className="flex items-center mb-2">
                                        <Calendar className="h-4 w-4 text-slate-400 mr-2" />
                                        <span>
                                          {
                                            candidate.domainExpertise
                                              .experienceInDomain
                                          }{" "}
                                          years of relevant experience
                                        </span>
                                      </div>

                                      {/* Danh sách experience */}
                                      <ul className="space-y-2 mt-3">
                                        {candidate.experienceDetails
                                          .slice(
                                            0,
                                            expandedExperiences[
                                              candidate.userID
                                            ]
                                              ? undefined
                                              : 3
                                          )
                                          .map((exp, idx) => (
                                            <li
                                              key={idx}
                                              className="flex items-start"
                                            >
                                              <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 mr-2"></div>
                                              <div>
                                                <span className="font-medium">
                                                  {exp.position}
                                                </span>{" "}
                                                at{" "}
                                                <span className="text-blue-600">
                                                  {exp.company}
                                                </span>
                                                <div className="text-xs text-slate-500">
                                                  {exp.duration}
                                                </div>
                                              </div>
                                            </li>
                                          ))}
                                      </ul>

                                      {/* Nút Show more/Show less */}
                                      {candidate.experienceDetails.length >
                                        3 && (
                                        <Button
                                          variant="link"
                                          size="sm"
                                          className="p-0 h-auto mt-2 text-blue-600"
                                          onClick={() =>
                                            setExpandedExperiences((prev) => ({
                                              ...prev,
                                              [candidate.userID]:
                                                !prev[candidate.userID],
                                            }))
                                          }
                                        >
                                          {expandedExperiences[candidate.userID]
                                            ? "Show less"
                                            : `Show ${
                                                candidate.experienceDetails
                                                  .length - 3
                                              } more`}
                                        </Button>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-sm text-slate-600">
                                      No relevant experience found
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Hiển thị tóm tắt về AI Analysis (chỉ hiển thị đánh giá tổng quan ngắn gọn) */}
                              {/* <div className="mt-4">
                                <h5 className="text-sm font-medium mb-2 flex items-center">
                                  <ClipboardList className="mr-1.5 h-3.5 w-3.5 text-blue-500" />
                                  AI Summary
                                </h5>
                                <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-md border border-slate-200">
                                  <p className="line-clamp-3">
                                    {candidate.matchAnalysis.overallAssessment}
                                  </p>
                                  {candidate.matchAnalysis.overallAssessment
                                    .length > 150 && (
                                    <Button
                                      variant="link"
                                      size="sm"
                                      className="p-0 h-auto mt-1 text-blue-600"
                                      onClick={() =>
                                        handleViewAIAnalysis(candidate)
                                      }
                                    >
                                      Read full analysis
                                    </Button>
                                  )}
                                </div>
                              </div> */}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <Card className="border border-dashed p-8">
                <div className="text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">
                    No matching candidates found
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    Try adjusting your filters or search terms
                  </p>
                </div>
              </Card>
            )}

            {/* Thêm component phân trang */}
            {filteredCandidates.length > 0 && (
              <CandidatePagination
                totalCandidates={filteredCandidates.length}
                candidatesPerPage={candidatesPerPage}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
              />
            )}
          </motion.div>
        )}
      </div>

      <CVDialog
        open={openCVDialog}
        onOpenChange={setOpenCVDialog}
        candidate={selectedCandidate}
        cv={selectedCV}
        jobId={jobId}
        employerId={userId}
      />

      <AIAnalysisDialog
        open={openAIAnalysisDialog}
        onOpenChange={setOpenAIAnalysisDialog}
        candidate={selectedAnalysisCandidate}
      />
    </>
  );
};

export default CandidateMatchingPage;

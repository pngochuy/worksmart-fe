// src/utils/excelExport.js - Enhanced version

// import * as XLSX from "xlsx";
import XLSX from "xlsx-js-style";

import { saveAs } from "file-saver";
import { format } from "date-fns";
import { toast } from "react-toastify";

/**
 * Tính toán thời gian từ startDate đến endDate
 */
function calculateDuration(startDate, endDate) {
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
}

/**
 * Hàm xuất danh sách ứng viên ra file Excel
 * @param {Object} job - Thông tin job
 * @param {Array} candidates - Danh sách ứng viên với thông tin phân tích
 * @param {Object} options - Các tùy chọn cấu hình
 * @returns {void}
 */
export const exportCandidatesToExcel = (job, candidates, options = {}) => {
  try {
    // Chuẩn bị tên file
    const currentDate = format(new Date(), "yyyy-MM-dd");
    const jobTitle = job?.title?.replace(/[^a-zA-Z0-9]/g, "_") || "Job";
    const fileName =
      options.fileName || `${jobTitle}_Candidate_Analysis_${currentDate}.xlsx`;

    // Tạo workbook
    const wb = XLSX.utils.book_new();

    // ===== SHEET 1: JOB INFORMATION =====
    const jobData = [];
    jobData.push(["Job Analysis Report"]);
    jobData.push(["Job Title:", job?.title || ""]);
    jobData.push(["Position:", job?.jobPosition || ""]);
    jobData.push(["Location:", job?.location || ""]);
    jobData.push(["Company:", job?.companyName || ""]);
    jobData.push(["Required Experience:", `${job?.exp || ""} years`]);
    jobData.push(["Education:", job?.education || ""]);
    jobData.push(["Industry:", job?.industry || ""]);
    jobData.push(["Salary:", job?.salary || ""]);
    jobData.push(["Deadline:", job?.deadline || ""]);
    jobData.push(["Status:", job?.status || ""]);
    jobData.push([
      "Job Description:",
      job?.description?.replace(/<[^>]*>/g, " ") || "",
    ]);

    // Thêm thông tin về tags nếu có
    if (job?.jobDetailTags && job.jobDetailTags.length > 0) {
      jobData.push([
        "Tags:",
        job.jobDetailTags.map((tag) => tag.tagName).join(", "),
      ]);
    }

    // Thêm ngày giờ xuất file chính xác đến giây
    jobData.push([
      "Export Date:",
      format(new Date(), "MMMM d, yyyy, HH:mm:ss"),
    ]);

    // Tạo worksheet cho Job Info
    const wsJob = XLSX.utils.aoa_to_sheet(jobData);

    // Thiết lập chiều rộng cột cho sheet Job
    wsJob["!cols"] = [
      { wch: 20 }, // Label column
      { wch: 80 }, // Value column
    ];

    // Style cho sheet Job
    const jobRange = XLSX.utils.decode_range(wsJob["!ref"]);

    // Style cho tiêu đề
    const titleAddress = XLSX.utils.encode_cell({ r: 0, c: 0 });
    wsJob[titleAddress].s = {
      font: { bold: true, sz: 16, color: { rgb: "000000" } },
      alignment: { vertical: "center", horizontal: "left" },
    };

    // Merge cells cho tiêu đề
    if (!wsJob["!merges"]) wsJob["!merges"] = [];
    wsJob["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } });

    // Style cho labels và values
    for (let R = 1; R <= jobRange.e.r; ++R) {
      const labelAddress = XLSX.utils.encode_cell({ r: R, c: 0 });
      const valueAddress = XLSX.utils.encode_cell({ r: R, c: 1 });

      if (wsJob[labelAddress]) {
        wsJob[labelAddress].s = {
          font: { bold: true, color: { rgb: "000000" } },
          alignment: { vertical: "center", horizontal: "left" },
          fill: { fgColor: { rgb: "E0E0E0" }, patternType: "solid" },
        };
      }

      if (wsJob[valueAddress]) {
        wsJob[valueAddress].s = {
          alignment: { vertical: "center", horizontal: "left", wrapText: true },
        };
      }
    }

    // Thêm sheet Job vào workbook
    XLSX.utils.book_append_sheet(wb, wsJob, "Job Details");

    // ===== SHEET 2: CANDIDATES INFORMATION =====
    const candidateData = [];

    // Headers cho sheet Candidates - sử dụng màu đồng nhất
    const headers = [
      "Full Name",
      "Email",
      "Phone Number",
      "Address",
      "CV Type",
      "CV URL", // Thêm cột cho URL của CV
      "Match Score (%)",
      "Job Position",
      "Skills",
      "Domain Experience (Years)",
      "Experience Relevance",
      "Education",
      "Education Match",
      "Matching Skills",
      "Missing Critical Skills",
      "Strengths",
      "Weaknesses",
      "AI Assessment",
      // Thêm các thông tin raw data của CV
      "Raw CV Data - Summary",
      "Raw CV Data - Experience",
      "Raw CV Data - Education",
      "Raw CV Data - Skills",
      "Raw CV Data - Certifications",
    ];

    candidateData.push(headers);

    // Thêm dữ liệu từng ứng viên
    candidates.forEach((candidate) => {
      const cv = candidate.featuredCVs?.[0] || {};
      const cvType = cv.filePath ? "Uploaded CV" : "System CV";
      const cvUrl = cv.filePath || cv.cloudinaryUrl || ""; // URL của CV (chỉ có cho CV loại 2)

      // Lấy thông tin giáo dục
      const education = cv.educations
        ? cv.educations
            .map(
              (edu) =>
                `${edu.degree || ""} at ${
                  edu.schoolName || ""
                } (${calculateDuration(edu.startedAt, edu.endedAt)})`
            )
            .join("\n")
        : "";

      // Chuẩn bị skills từ danh sách matching skills
      const skillsList = candidate.matchingSkills?.join(", ") || "";

      // Chuẩn bị raw data
      const rawSummary = cv.summary || "";

      const rawExperience = cv.experiences
        ? cv.experiences
            .map(
              (exp) =>
                `${exp.jobPosition || ""} at ${
                  exp.companyName || ""
                } (${calculateDuration(exp.startedAt, exp.endedAt)}): ${
                  exp.description || ""
                }`
            )
            .join("\n\n")
        : "";

      const rawEducation = cv.educations
        ? cv.educations
            .map(
              (edu) =>
                `${edu.degree || ""} at ${
                  edu.schoolName || ""
                } (${calculateDuration(edu.startedAt, edu.endedAt)})`
            )
            .join("\n")
        : "";

      const rawSkills = cv.skills
        ? cv.skills
            .map((skill) =>
              typeof skill === "string" ? skill : skill.skillName || ""
            )
            .join(", ")
        : "";

      const rawCertifications = cv.certifications
        ? cv.certifications
            .map(
              (cert) =>
                `${cert.certificateName || ""} (${
                  cert.createAt
                    ? format(new Date(cert.createAt), "yyyy-MM-dd")
                    : "No date"
                })`
            )
            .join("\n")
        : "";

      // Thêm hàng dữ liệu cho ứng viên
      candidateData.push([
        candidate.fullName || "",
        candidate.isPrivated ? "[protected data]" : candidate.email || "",
        candidate.isPrivated ? "[protected data]" : candidate.phoneNumber || "",
        candidate.address || "",
        cvType,
        cvUrl, // URL của CV
        candidate.matchPercentage || 0,
        cv.jobPosition || "",
        skillsList,
        candidate.domainExpertise?.experienceInDomain || 0,
        candidate.domainExpertise?.domainKnowledge || "",
        education,
        candidate.educationMatch?.relevance || "",
        candidate.matchingSkills?.join(", ") || "",
        candidate.missingCriticalSkills?.join(", ") || "",
        candidate.matchAnalysis?.strengths?.join("\n") || "",
        candidate.matchAnalysis?.weaknesses?.join("\n") || "",
        candidate.matchAnalysis?.overallAssessment || "",
        // Thêm raw data
        rawSummary,
        rawExperience,
        rawEducation,
        rawSkills,
        rawCertifications,
      ]);
    });

    // Tạo worksheet cho Candidates
    const wsCandidates = XLSX.utils.aoa_to_sheet(candidateData);

    // Thiết lập chiều rộng cột cho sheet Candidates
    wsCandidates["!cols"] = [
      { wch: 20 }, // Full Name
      { wch: 25 }, // Email
      { wch: 15 }, // Phone Number
      { wch: 20 }, // Address
      { wch: 12 }, // CV Type
      { wch: 50 }, // CV URL
      { wch: 12 }, // Match Score
      { wch: 25 }, // Job Position
      { wch: 40 }, // Skills
      { wch: 12 }, // Domain Experience
      { wch: 15 }, // Experience Relevance
      { wch: 30 }, // Education
      { wch: 15 }, // Education Match
      { wch: 40 }, // Matching Skills
      { wch: 40 }, // Missing Critical Skills
      { wch: 40 }, // Strengths
      { wch: 40 }, // Weaknesses
      { wch: 50 }, // AI Assessment
      { wch: 50 }, // Raw Summary
      { wch: 70 }, // Raw Experience
      { wch: 50 }, // Raw Education
      { wch: 60 }, // Raw Skills
      { wch: 50 }, // Raw Certifications
    ];

    // Thiết lập filter cho cột CV Type và Match Score
    wsCandidates["!autofilter"] = { ref: `A1:W1` };

    // Style cho header của sheet Candidates
    const candRange = XLSX.utils.decode_range(wsCandidates["!ref"]);

    // Đảm bảo áp dụng style sau khi đã tạo tất cả các cell
    // Style cho header của sheet Candidates
    for (let C = candRange.s.c; C <= candRange.e.c; ++C) {
      const address = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!wsCandidates[address]) continue;

      // Style đồng nhất cho header với màu đậm hơn
      wsCandidates[address].s = {
        fill: { fgColor: { rgb: "4472C4" }, patternType: "solid" },
        font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 }, // Tăng font size
        alignment: { vertical: "center", horizontal: "center", wrapText: true },
        border: {
          top: { style: "medium", color: { rgb: "000000" } },
          bottom: { style: "medium", color: { rgb: "000000" } },
          left: { style: "medium", color: { rgb: "000000" } },
          right: { style: "medium", color: { rgb: "000000" } },
        },
      };
    }

    // Style cho data rows (alternate row coloring)
    for (let R = 1; R <= candRange.e.r; ++R) {
      const isAlternateRow = R % 2 === 1;
      const rowColor = isAlternateRow ? "F2F2F2" : "FFFFFF";

      for (let C = candRange.s.c; C <= candRange.e.c; ++C) {
        // Special handling for Match Score column
        if (C === 6) {
          const scoreAddress = XLSX.utils.encode_cell({ r: R, c: C });
          if (!wsCandidates[scoreAddress] || !wsCandidates[scoreAddress].v)
            continue;

          const score = parseFloat(wsCandidates[scoreAddress].v);
          let fillColor;

          if (score >= 90) {
            fillColor = "92D050"; // Green for excellent matches (90%+)
          } else if (score >= 80) {
            fillColor = "00B0F0"; // Light blue for good matches (80-89%)
          } else if (score >= 70) {
            fillColor = "FFC000"; // Amber for average matches (70-79%)
          } else {
            fillColor = "FF9999"; // Light red for lower matches (<70%)
          }

          wsCandidates[scoreAddress].s = {
            fill: { fgColor: { rgb: fillColor }, patternType: "solid" },
            font: { bold: true, color: { rgb: "FFFFFF" } },
            alignment: { vertical: "center", horizontal: "center" },
            border: {
              top: { style: "thin", color: { rgb: "CCCCCC" } },
              bottom: { style: "thin", color: { rgb: "CCCCCC" } },
              left: { style: "thin", color: { rgb: "CCCCCC" } },
              right: { style: "thin", color: { rgb: "CCCCCC" } },
            },
          };
          continue;
        }

        // Normal data cells
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!wsCandidates[cellAddress]) continue;

        wsCandidates[cellAddress].s = {
          fill: { fgColor: { rgb: rowColor }, patternType: "solid" },
          alignment: { vertical: "center", wrapText: true },
          border: {
            top: { style: "thin", color: { rgb: "CCCCCC" } },
            bottom: { style: "thin", color: { rgb: "CCCCCC" } },
            left: { style: "thin", color: { rgb: "CCCCCC" } },
            right: { style: "thin", color: { rgb: "CCCCCC" } },
          },
        };

        // Special formatting for URL cells
        if (C === 5 && wsCandidates[cellAddress].v) {
          // CV URL column
          wsCandidates[cellAddress].s = {
            ...wsCandidates[cellAddress].s,
            font: { color: { rgb: "0563C1" }, underline: true },
          };
        }
      }
    }

    // Thêm sheet Candidates vào workbook
    XLSX.utils.book_append_sheet(wb, wsCandidates, "Candidates");

    // Xuất file Excel
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, fileName);

    // Hiển thị thông báo thành công
    if (toast && typeof toast.success === "function") {
      toast.success(
        `Exported ${candidates.length} candidates to Excel successfully`
      );
    }

    return true;
  } catch (error) {
    console.error("Error exporting to Excel:", error);

    // Hiển thị thông báo lỗi
    if (toast && typeof toast.error === "function") {
      toast.error("Failed to export candidates to Excel. Please try again.");
    }

    return false;
  }
};

import openai from "@/lib/openai";
import { getCVsByUserId } from "@/services/cvServices";
import { getJobsActive } from "@/services/jobServices";

export const recommendJobsForUser = async (userId) => {
  try {
    // Lấy tất cả CV của người dùng
    const userCVs = await getCVsByUserId(userId);
    if (!userCVs || userCVs.length === 0) {
      throw new Error("Không tìm thấy CV của người dùng");
    }

    // Lấy danh sách công việc
    const availableJobs = await getJobsActive();

    // Gộp thông tin từ tất cả các CV của người dùng
    const consolidatedCV = consolidateCVs(userCVs);

    // Chuẩn bị dữ liệu công việc
    const jobSummaries = availableJobs.slice(0, 20).map((job) => ({
      id: job.jobID,
      title: job.title || job.name || job.jobTitle,
      company: job.companyName || job.company,
      description: job.description || job.jobDescription,
      requirements: job.requirements || job.requirement || job.jobRequirements,
      skills: job.requiredSkills || job.skills || [],
    }));

    console.log("Available Jobs Structure:", availableJobs);

    const systemMessage = `
      Bạn là AI chuyên gia về tuyển dụng và phân tích CV. Nhiệm vụ của bạn là phân tích thông tin được tổng hợp từ tất cả CV của ứng viên 
      và đề xuất 10 công việc phù hợp nhất từ danh sách công việc được cung cấp.
      
      Lưu ý rằng ứng viên có thể có nhiều CV với thông tin bổ sung cho nhau. Hãy tận dụng tất cả thông tin có sẵn để đưa ra đề xuất tốt nhất.
      
      Đối với mỗi đề xuất, hãy cung cấp:
      1. ID của công việc
      2. Tên vị trí công việc
      3. Công ty
      4. Mức độ phù hợp (tỷ lệ phần trăm từ 0-100%)
      5. Giải thích ngắn gọn về lý do công việc này phù hợp với ứng viên
      
      Phân tích kỹ tất cả kỹ năng, kinh nghiệm và học vấn được hợp nhất từ các CV của ứng viên để đánh giá mức độ phù hợp một cách chính xác nhất.
      
      Trả về kết quả dưới dạng JSON theo định dạng sau:
      {
        "recommendations": [
          {
            "jobId": "id của công việc",
            "jobTitle": "tên công việc",
            "company": "tên công ty",
            "matchPercentage": 85,
            "reason": "Giải thích tại sao công việc này phù hợp"
          },
          ...
        ]
      }
    `;

    const userMessage = `
      Thông tin tổng hợp từ tất cả CV của ứng viên:
      
      Thông tin cá nhân:
      - Họ tên: ${consolidatedCV.personalInfo?.fullName || "N/A"}
      - Vị trí hiện tại: ${
        consolidatedCV.personalInfo?.currentPosition || "N/A"
      }
      - Email: ${consolidatedCV.personalInfo?.email || "N/A"}
      - Số điện thoại: ${consolidatedCV.personalInfo?.phone || "N/A"}
      
      Kinh nghiệm làm việc (tổng hợp từ ${userCVs.length} CV):
      ${consolidatedCV.workExperiences
        ?.map(
          (exp) => `
          Vị trí: ${exp.position || exp.jobTitle || "N/A"} tại ${
            exp.companyName || exp.company || "N/A"
          }
          Thời gian: ${exp.startDate || "N/A"} đến ${exp.endDate || "Hiện tại"}
          Mô tả công việc:
          ${exp.description || exp.jobDescription || "N/A"}
          `
        )
        .join("\n\n")}
      
      Học vấn (tổng hợp từ ${userCVs.length} CV):
      ${consolidatedCV.educations
        ?.map(
          (edu) => `
          Bằng cấp: ${edu.degree || edu.degreeType || "N/A"} tại ${
            edu.school || edu.schoolName || "N/A"
          }
          Chuyên ngành: ${edu.fieldOfStudy || edu.major || "N/A"}
          `
        )
        .join("\n\n")}
      
      Kỹ năng (tổng hợp từ ${userCVs.length} CV):
      ${consolidatedCV.skills.join(", ")}
      
      Danh sách công việc hiện có:
      ${jobSummaries
        .map(
          (job, index) =>
            `
        Job #${index + 1}:
        ID: ${job.id}
        Tiêu đề: ${job.title}
        Công ty: ${job.company}
        Mô tả: ${job.description}
        Yêu cầu: ${job.requirements}
        Kỹ năng cần có: ${
          Array.isArray(job.skills) ? job.skills.join(", ") : job.skills
        }
        `
        )
        .join("\n")}
    `;

    // Gọi OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      messages: [
        {
          role: "system",
          content: systemMessage,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      response_format: { type: "json_object" },
    });

    const aiResponse = completion.choices[0].message.content;

    if (!aiResponse) {
      throw new Error("Không thể tạo được phản hồi từ AI");
    }

    // Phân tích kết quả JSON từ OpenAI
    const recommendations = JSON.parse(aiResponse);

    // Cache kết quả để tránh gọi API nhiều lần không cần thiết
    localStorage.setItem(
      `job_recommendations_${userId}_all`,
      JSON.stringify({
        timestamp: Date.now(),
        data: recommendations,
      })
    );

    return recommendations;
  } catch (error) {
    console.error("Error in job recommendation:", error);
    throw error;
  }
};

// Hàm hợp nhất thông tin từ nhiều CV
const consolidateCVs = (cvList) => {
  // Khởi tạo đối tượng CV hợp nhất
  const consolidated = {
    personalInfo: {},
    workExperiences: [],
    educations: [],
    skills: new Set(), // Sử dụng Set để loại bỏ các kỹ năng trùng lặp
  };

  // Duyệt qua tất cả các CV
  cvList.forEach((cv) => {
    const formattedCV = formatCVData(cv);

    // Hợp nhất thông tin cá nhân (lấy thông tin gần nhất hoặc đầy đủ nhất)
    if (
      !consolidated.personalInfo.fullName &&
      formattedCV.personalInfo.fullName
    ) {
      consolidated.personalInfo.fullName = formattedCV.personalInfo.fullName;
    }
    if (!consolidated.personalInfo.email && formattedCV.personalInfo.email) {
      consolidated.personalInfo.email = formattedCV.personalInfo.email;
    }
    if (!consolidated.personalInfo.phone && formattedCV.personalInfo.phone) {
      consolidated.personalInfo.phone = formattedCV.personalInfo.phone;
    }
    if (
      !consolidated.personalInfo.currentPosition &&
      formattedCV.personalInfo.currentPosition
    ) {
      consolidated.personalInfo.currentPosition =
        formattedCV.personalInfo.currentPosition;
    }

    // Hợp nhất kinh nghiệm làm việc
    if (Array.isArray(formattedCV.workExperiences)) {
      formattedCV.workExperiences.forEach((exp) => {
        // Kiểm tra xem kinh nghiệm này đã có trong CV hợp nhất chưa
        const isDuplicate = consolidated.workExperiences.some(
          (existingExp) =>
            existingExp.companyName === exp.companyName &&
            existingExp.position === exp.position
        );

        if (!isDuplicate) {
          consolidated.workExperiences.push(exp);
        }
      });
    }

    // Hợp nhất học vấn
    if (Array.isArray(formattedCV.educations)) {
      formattedCV.educations.forEach((edu) => {
        // Kiểm tra xem học vấn này đã có trong CV hợp nhất chưa
        const isDuplicate = consolidated.educations.some(
          (existingEdu) =>
            existingEdu.school === edu.school &&
            existingEdu.degree === edu.degree
        );

        if (!isDuplicate) {
          consolidated.educations.push(edu);
        }
      });
    }

    // Hợp nhất kỹ năng
    if (Array.isArray(formattedCV.skills)) {
      formattedCV.skills.forEach((skill) => {
        consolidated.skills.add(skill);
      });
    }
  });

  // Chuyển đổi Set thành Array cho kỹ năng
  consolidated.skills = Array.from(consolidated.skills);

  return consolidated;
};

// Hàm định dạng dữ liệu CV từ API để phù hợp với định dạng cần thiết
const formatCVData = (cv) => {
  // Thử xác định các trường CV dựa trên cấu trúc thực tế
  return {
    personalInfo: {
      fullName: cv.fullName || cv.name || cv.userName || "",
      currentPosition: cv.position || cv.currentPosition || cv.jobTitle || "",
      email: cv.email || cv.userEmail || "",
      phone: cv.phone || cv.phoneNumber || cv.contactNumber || "",
    },
    workExperiences:
      cv.workExperiences || cv.experiences || cv.jobs || cv.workHistory || [],
    educations: cv.educations || cv.education || cv.academicHistory || [],
    skills: cv.skills || cv.skillSet || cv.userSkills || [],
  };
};

// Hàm kiểm tra xem có kết quả đề xuất đã được lưu trong cache không
export const getCachedRecommendations = (userId) => {
  const cachedData = localStorage.getItem(`job_recommendations_${userId}_all`);
  if (!cachedData) return null;

  const parsed = JSON.parse(cachedData);

  // Kiểm tra xem cache còn hợp lệ không (ví dụ: không quá 1 giờ)
  const ONE_HOUR = 60 * 60 * 1000;
  if (Date.now() - parsed.timestamp > ONE_HOUR) {
    localStorage.removeItem(`job_recommendations_${userId}_all`);
    return null;
  }

  return parsed.data;
};

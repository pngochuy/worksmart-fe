import { editCV, getCVById } from "@/services/cvServices";
export default async function saveResume(values) {
  // Lấy các thông tin cần thiết
  const { id, cvid, userId, photo } = values;
  const cvId = cvid || id;

  // Kiểm tra ID
  if (!cvId || !userId) {
    console.error("❌ Missing required IDs", { cvId, userId });
    throw new Error("Missing required IDs");
  }

  try {
    //console.log("📤 Saving CV with photo:", photo ? "exists" : "not provided");

    // Gọi API để lấy dữ liệu hiện tại trước khi cập nhật
    // Chỉ cần nếu không có photo mới
    let currentCV = null;
    if (!photo) {
      try {
        // Giả sử có API để lấy CV hiện tại
        const response = await getCVById(cvId);
        if (response.ok) {
          currentCV = await response.json();
          //console.log("📷 Current CV has link:", currentCV.link);
        }
      } catch (error) {
        console.warn(
          "⚠️ Couldn't fetch current CV, will proceed anyway:",
          error
        );
      }
    }

    // Map data từ client format sang server format
    const mappedResumeValues = {
      CVID: Number(cvId),
      UserID: Number(userId),

      // General info
      title: values.title || "My CV",
      description: values.description || "",
      colorhex: values.colorHex || "#000000",
      borderstyle: values.borderStyle || "solid",

      // Personal info
      firstName: values.firstName || "",
      lastName: values.lastName || "",
      jobPosition: values.jobTitle || "",
      email: values.email || "",
      phone: values.phone || "",
      address: values.address || "",

      // QUAN TRỌNG: Chỉ ghi đè link khi có photo mới
      // Nếu không có photo mới, giữ nguyên link cũ từ DB
      link: photo || currentCV?.link || "",

      // Các trường khác...
      summary: values.summary || "",

      // Boolean flags
      isFeatured: Boolean(values.isFeatured),
      isHidden: false,

      // Map các mảng dữ liệu khác
      experiences: Array.isArray(values.workExperiences)
        ? values.workExperiences.map((exp) => ({
            jobPosition: exp.position || "",
            companyName: exp.companyName || "",
            address: exp.location || "",
            description: exp.description || "",
            startedAt: exp.startDate || null,
            endedAt: exp.endDate || null,
          }))
        : [],

      // Các mảng khác...
      educations: Array.isArray(values.educations)
        ? values.educations.map((edu) => ({
            schoolName: edu.school || "",
            major: edu.fieldOfStudy || "",
            degree: edu.degree || "",
            description: edu.description || "",
            startedAt: edu.startDate || null,
            endedAt: edu.endDate || null,
          }))
        : [],

      skills: Array.isArray(values.skills)
        ? values.skills.filter(Boolean).map((skill) => ({
            skillName: skill,
            description: "",
          }))
        : [],

      certifications: Array.isArray(values.certifications)
        ? values.certifications.map((cert) => ({
            certificateName: cert.name || "",
            description: cert.description || "",
            createAt: cert.date || new Date().toISOString(),
          }))
        : [],
    };

    //console.log("🔄 Final link value being sent:", mappedResumeValues.link);

    // Gọi API
    const result = await editCV(
      Number(cvId),
      Number(userId),
      mappedResumeValues
    );

    // Trả về kết quả với photo được giữ nguyên
    return {
      ...result,
      cvid: result.CVID || result.cvid,
      id: result.CVID || result.cvid,
      photo: result.link || photo || currentCV?.link || "",
    };
  } catch (error) {
    console.error("❌ Error saving resume:", error);
    throw error;
  }
}

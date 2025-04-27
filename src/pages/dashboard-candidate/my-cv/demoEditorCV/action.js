import { editCV } from "@/services/cvServices";

export default async function saveResume(values) {
  // Kiểm tra xem values có đủ dữ liệu không
  if (!values || typeof values !== "object") {
    console.error("❌ Invalid resume data", values);
    throw new Error("Invalid resume data");
  }

  const { id, cvid, userId, isFeatured } = values;
  const cvId = cvid || id;

  if (!cvId || !userId) {
    console.error("❌ Missing required IDs", { cvId, userId });
    throw new Error("Missing required IDs");
  }

  try {
    console.log("📤 Full form data:", values);

    // Map tất cả các phần dữ liệu từ form sang format server
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
      jobPosition: values.jobTitle || "", // Chú ý map đúng từ jobTitle sang jobPosition
      email: values.email || "",
      phone: values.phone || "",
      address: values.address || "",
      link: values.photo || "", // Chú ý map từ photo sang link

      // Summary
      summary: values.summary || "",

      // Boolean flags
      isFeatured: Boolean(isFeatured),
      isHidden: false,

      // Work experiences
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

      // Educations
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

      // Skills
      skills: Array.isArray(values.skills)
        ? values.skills.filter(Boolean).map((skill) => ({
            skillName: skill,
            description: "",
          }))
        : [],

      // Certifications (nếu có)
      certifications: Array.isArray(values.certifications)
        ? values.certifications.map((cert) => ({
            certificateName: cert.name || "",
            description: cert.description || "",
            createAt: cert.date || new Date().toISOString(),
          }))
        : [],
    };

    // Log dữ liệu đã map để debug
    console.log(
      "📤 Mapped data to send:",
      JSON.stringify(mappedResumeValues, null, 2)
    );

    // Gọi API với dữ liệu đã được map đúng
    const result = await editCV(
      Number(cvId),
      Number(userId),
      mappedResumeValues
    );
    console.log("📥 Server response:", result);

    // Format lại kết quả để client sử dụng
    return {
      ...result,
      cvid: result.CVID || result.cvid,
      id: result.CVID || result.cvid,
    };
  } catch (error) {
    console.error("❌ Error saving resume:", error);
    throw error;
  }
}

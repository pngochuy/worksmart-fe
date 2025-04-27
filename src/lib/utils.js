import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// mapToResumeValues sử dụng đối tượng ResumeServerData và chuyển đổi thành ResumeValues
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function fileReplacer(key, value) {
  return value instanceof File
    ? {
        name: value.name,
        size: value.size,
        type: value.type,
        lastModified: value.lastModified,
      }
    : value;
}

// mapToResumeValues chuyển đổi data từ ResumeServerData thành ResumeValues
export function mapToResumeValues(data) {
  console.log("🔄 Mapping server data to form values:", data);

  if (!data)
    return {
      title: "",
      description: "",
      workExperiences: [],
      educations: [],
      skills: [],
      summary: "",
    };

  // Đảm bảo ID luôn có giá trị
  const cvId = data.CVID || data.cvid || 0;

  // Log để debug
  console.log(`🔍 Mapping CV with ID ${cvId}`);

  // Map tất cả các phần từ server data sang form values
  return {
    // IDs
    cvid: cvId,
    id: cvId,

    // General info
    title: data.title || "",
    description: data.description || "",
    colorHex: data.colorhex || "",
    borderStyle: data.borderstyle || "",

    // Personal info
    firstName: data.firstName || "",
    lastName: data.lastName || "",
    jobTitle: data.jobPosition || "", // Chú ý map từ jobPosition sang jobTitle
    email: data.email || "",
    phone: data.phone || "",
    address: data.address || "",
    photo: data.link || "", // Chú ý map từ link sang photo

    // Summary
    summary: data.summary || "",

    // Boolean flags
    isFeatured: Boolean(data.isFeatured),

    // Work experiences
    workExperiences: Array.isArray(data.experiences)
      ? data.experiences.map((exp) => ({
          position: exp.jobPosition || "",
          companyName: exp.companyName || "",
          location: exp.address || "",
          description: exp.description || "",
          startDate: exp.startedAt ? exp.startedAt.split("T")[0] : "",
          endDate: exp.endedAt ? exp.endedAt.split("T")[0] : "",
        }))
      : [],

    // Educations
    educations: Array.isArray(data.educations)
      ? data.educations.map((edu) => ({
          school: edu.schoolName || "",
          fieldOfStudy: edu.major || "",
          degree: edu.degree || "",
          description: edu.description || "",
          startDate: edu.startedAt ? edu.startedAt.split("T")[0] : "",
          endDate: edu.endedAt ? edu.endedAt.split("T")[0] : "",
        }))
      : [],

    // Skills - mảng các string
    skills: Array.isArray(data.skills)
      ? data.skills.map((skill) => skill.skillName || "").filter(Boolean)
      : [],

    // Certifications (nếu có)
    certifications: Array.isArray(data.certifications)
      ? data.certifications.map((cert) => ({
          name: cert.certificateName || "",
          description: cert.description || "",
          date: cert.createAt ? cert.createAt.split("T")[0] : "",
        }))
      : [],
  };
}

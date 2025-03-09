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
  return {
    id: data?.cvid || "demo_id",
    title: data?.title || undefined,
    description: data?.description || undefined,
    photo: data?.link || undefined,
    firstName: data?.firstName || undefined,
    lastName: data?.lastName || undefined,
    jobTitle: data?.jobPosition || undefined,
    address: data?.address || undefined,
    phone: data?.phone || undefined,
    email: data?.email || undefined,
    // workExperiences -> experiences
    workExperiences: data?.experiences.map((exp) => ({
      position: exp?.jobPosition || undefined,
      companyName: exp?.companyName,
      startDate: exp?.startedAt?.split("T")[0] || undefined,
      endDate: exp?.endedAt?.split("T")[0] || undefined,
      // startDate: exp?.startedAt?.toISOString().split("T")[0],
      // endDate: exp?.endDate?.toISOString().split("T")[0],
      description: exp?.description || undefined,
    })),
    educations: data?.educations.map((edu) => ({
      degree: edu?.degree || undefined,
      school: edu?.schoolName || undefined,
      startDate: edu?.startedAt?.split("T")[0] || undefined,
      endDate: edu?.endedAt?.split("T")[0] || undefined,
    })),
    skills: data?.skills.map((skill) => skill?.skillName), // Only extract the skillName
    borderStyle: data?.borderstyle || undefined,
    colorHex: data?.colorhex || undefined,
    summary: data?.summary || undefined,
  };
}

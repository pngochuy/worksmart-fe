import { z } from "zod";

export const optionalString = z.string().trim().optional().or(z.literal(""));
const phoneNumberSchema = z
  .string()
  .trim()
  .optional()
  .refine((value) => {
    // If value is empty or undefined, it's valid due to optional()
    if (!value) return true;
    return /^(0[3|5|7|8|9])([0-9]{8})$/.test(value);
  }, "Invalid Vietnamese phone number format");

export const generalInfoSchema = z.object({
  title: optionalString,
  description: optionalString,
});

export const personalInfoSchema = z.object({
  photo: z
    .custom(
      (file) => {
        // Nếu là URL (chuỗi) thì không cần kiểm tra kích thước, chỉ cần cho qua
        if (!file || typeof file === "string") return true;

        // Nếu là tệp thì phải là ảnh
        return file instanceof File && file.type.startsWith("image/");
      },
      {
        message: "Must be an image file or a valid image URL",
      }
    )
    .refine((file) => {
      // Nếu là tệp thì kiểm tra kích thước
      if (file instanceof File) {
        return file.size <= 1024 * 1024 * 4; // 4MB size limit
      }
      return true; // Nếu là URL thì bỏ qua
    }, "File must be less than 4MB"),
  firstName: optionalString,
  lastName: optionalString,
  jobTitle: optionalString,
  address: optionalString,
  phone: phoneNumberSchema,
  email: optionalString,
});

export const workExperienceSchema = z.object({
  workExperiences: z
    .array(
      z.object({
        position: optionalString,
        companyName: optionalString,
        startDate: optionalString,
        endDate: optionalString,
        description: optionalString,
      })
    )
    .optional(),
});

export const educationSchema = z.object({
  educations: z
    .array(
      z.object({
        degree: optionalString,
        school: optionalString,
        startDate: optionalString,
        endDate: optionalString,
      })
    )
    .optional(),
});

export const skillsSchema = z.object({
  skills: z.array(z.string().trim()).optional(),
});

export const summarySchema = z.object({
  summary: optionalString,
});

export const resumeSchema = z.object({
  ...generalInfoSchema.shape,
  ...personalInfoSchema.shape,
  ...workExperienceSchema.shape,
  ...educationSchema.shape,
  ...skillsSchema.shape,
  ...summarySchema.shape,
  colorHex: optionalString,
  borderStyle: optionalString,
});

export const generateWorkExperienceSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Required")
    .min(20, "Must be at least 20 characters"),
});

export const generateSummarySchema = z.object({
  jobTitle: optionalString,
  ...workExperienceSchema.shape,
  ...educationSchema.shape,
  ...skillsSchema.shape,
});

import { resumeSchema } from "@/lib/validations";
import { uploadImagesProfile } from "@/services/candidateServices";

export default async function saveResume(values) {
  const { id } = values;
  console.log("received values: ", values);
  const { photo, workExperiences, educations, ...resumeValues } =
    resumeSchema.parse(values); // resumeValues là rest data của resumeSchema

  console.log("parsed values: ", resumeSchema.parse(values));

  // upload ảnh lên server
  if (photo) {
    const uploadResponse = await uploadImagesProfile(photo);
    resumeValues.photo = uploadResponse.imageUrl;
  }

  // nhớ trả vê CV đã tạo lúc đầu kèm cvID
  return { id: "demo_123" };
}

import { resumeSchema } from "@/lib/validations";
import { uploadImagesProfile } from "@/services/candidateServices";
import { editCV, getCVById } from "@/services/cvServices";

export default async function saveResume(values) {
  const { id, userId } = values;
  const resumeValues = resumeSchema.parse(values); // resumeValues is the validated data from resumeSchema
  // If there is a photo, upload it and get the URL
  if (resumeValues?.photo && typeof resumeValues.photo !== "string") {
    try {
      console.log("resumeValues.photo: ", resumeValues.photo);
      const uploadResponse = await uploadImagesProfile(resumeValues.photo);
      resumeValues.photo = uploadResponse.imageUrl; // update the resumeValues.photo with the image URL
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload photo");
    }
  } else {
    // If the photo is already a URL, no need to upload
    const fetchedCV = await getCVById(id);
    resumeValues.photo = fetchedCV.link; // Set default value if photo is empty
    console.log("fetchedCV.link: ", fetchedCV.link);
    console.log("resumeValues.photo: ", resumeValues.photo);
  }
  console.log("resumeValues: ", resumeValues);
  // Mapping resumeValues to the required format for the API
  const mappedResumeValues = {
    cvid: id, // Map the CV id
    userID: userId, // Map the userId
    title: resumeValues.title,
    description: resumeValues.description,
    firstName: resumeValues.firstName,
    lastName: resumeValues.lastName,
    jobPosition: resumeValues.jobTitle, // Change jobTitle to jobPosition
    workType: "", // You can set default value or leave it as required
    summary: resumeValues.summary,
    address: resumeValues.address,
    phone: resumeValues.phone,
    email: resumeValues.email,
    link: resumeValues.photo,
    borderstyle: resumeValues.borderStyle, // Change borderStyle to borderstyle
    colorhex: resumeValues.colorHex, // Change colorHex to colorhex
    isFeatured: false, // Default to true
    // createdAt: new Date().toISOString(), // You may need to use the actual created date
    updatedAt: new Date().toISOString(), // Use the actual updated date if available
    experiences: resumeValues.workExperiences.map((exp) => ({
      jobPosition: exp.position, // Rename position to jobPosition
      companyName: exp.companyName, // Rename company to companyName
      address: "", // If not provided, set as empty or add any logic
      description: exp.description,
      startedAt: exp.startDate, // Change startDate to startedAt
      endedAt: exp.endDate, // Change endDate to endedAt
    })),
    certifications: [], // You can add certifications if available, otherwise set as empty
    skills: resumeValues.skills.map((skill) => ({
      skillName: skill, // Map skills to skillName
    })),
    educations: resumeValues.educations.map((edu) => ({
      major: "", // Set major if available
      schoolName: edu.school, // Change school to schoolName
      degree: edu.degree,
      startedAt: edu.startDate, // Change startDate to startedAt
      endedAt: edu.endDate, // Change endDate to endedAt
    })),
  };

  // Now call the editCV API to update the CV
  try {
    const updatedCV = await editCV(id, mappedResumeValues); // Call the API with the CV ID and updated data
    console.log("Updated CV successfully: ", updatedCV);

    // Return the updated CV or any additional information from the API response
    return updatedCV;
  } catch (error) {
    console.error("Error editing CV:", error);
    throw new Error("Failed to edit CV");
  }
}

/* eslint-disable react/prop-types */
// src/components/CVDialog.jsx
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify"; // Đảm bảo import này
import {
  Mail,
  Phone,
  MapPin,
  FileText,
  Briefcase,
  GraduationCap,
  Tag,
  Award,
  Eye,
} from "lucide-react";
import LoadingButton from "@/components/LoadingButton";
import { sendInvitationEmail } from "@/services/jobServices";

// Helper function to get initials from name
const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

// Helper to format date
const formatDate = (dateString) => {
  if (!dateString) return "Present";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
};

const CVDialog = ({ open, onOpenChange, candidate, cv, jobId, employerId }) => {
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  if (!candidate || !cv) return null;

  // Kiểm tra xem CV có phải là loại 2 (có URL từ Cloudinary) hay không
  const cvFileUrl = cv.filePath || cv.cloudinaryUrl || "";

  // Tạo URL để xem (có thể chuyển đổi PDF thành JPG nếu cần)
  const viewableUrl = cvFileUrl;

  // Mở CV trực tiếp
  const openCVFile = () => {
    if (viewableUrl) {
      window.open(viewableUrl, "_blank");
    } else {
      toast.error("No CV file available to view");
    }
  };

  // Function to handle Contact Candidate button click
  const handleContactCandidate = async () => {
    // Log IDs to console
    console.log("Candidate ID:", candidate.userID);
    console.log("Job ID:", jobId);

    try {
      setIsSendingEmail(true);

      // Make API call to send invitation email
      await sendInvitationEmail({
        candidateId: candidate.userID,
        jobId: jobId,
        employerId: employerId,
      });

      // Show success message
      toast.success("Invitation email sent successfully!");

      // Optional: Close dialog after sending
      // onOpenChange(false);
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast.error("Failed to send invitation email. Please try again.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border border-blue-100 shadow-lg rounded-xl p-6">
          <>
            <DialogHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg -mt-6 -mx-6 p-6 border-b border-blue-100">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-blue-200 shadow-sm">
                  {candidate.avatar ? (
                    <AvatarImage src={candidate.avatar} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xl">
                      {getInitials(candidate.fullName)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <DialogTitle className="text-2xl text-blue-900 font-semibold text-left  ">
                    {candidate.fullName}
                  </DialogTitle>
                  <p className="text-sm text-blue-600 mt-1 flex items-center">
                    <Briefcase className="h-3.5 w-3.5 mr-1.5 text-blue-400" />
                    {cv.jobPosition}{" "}
                    {cv.workType && (
                      <span className="text-blue-400 mx-1.5">•</span>
                    )}
                    {cv.workType && (
                      <span className="text-blue-500">{cv.workType}</span>
                    )}
                  </p>
                </div>
              </div>
            </DialogHeader>

            <div className="mt-6">
              <Tabs defaultValue="overview">
                <TabsList className="mb-6 bg-gray-100 p-1 rounded-lg w-full grid grid-cols-4 gap-1">
                  <TabsTrigger
                    value="overview"
                    className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-md transition-all"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="experience"
                    className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-md transition-all"
                  >
                    Experience
                  </TabsTrigger>
                  <TabsTrigger
                    value="education"
                    className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-md transition-all"
                  >
                    Education
                  </TabsTrigger>
                  <TabsTrigger
                    value="skills"
                    className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-md transition-all"
                  >
                    Skills & Certifications
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* CV File Section - Thêm mới */}
                  {cvFileUrl && (
                    <div className="space-y-3 bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <h3 className="text-sm font-medium flex items-center text-blue-800">
                        <FileText className="mr-2 h-4 w-4 text-blue-500" />
                        <span className="bg-blue-100 px-2 py-1 rounded-md">
                          CV File
                        </span>
                      </h3>

                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant="outline"
                          onClick={openCVFile}
                          className="flex items-center justify-center bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View in New Tab
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => setShowPdfViewer(!showPdfViewer)}
                          className="flex items-center justify-center bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          {showPdfViewer ? "Hide Preview" : "Show Preview"}
                        </Button>
                      </div>

                      {showPdfViewer && (
                        <div className="border rounded-md p-1 bg-white">
                          <iframe
                            src={viewableUrl}
                            title="CV Viewer"
                            width="100%"
                            height="500px"
                            frameBorder="0"
                          ></iframe>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Summary */}
                  {cv.summary && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Summary</h3>
                      <p className="text-sm">{cv.summary}</p>
                    </div>
                  )}

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contact Information */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium flex items-center text-blue-800">
                        <Mail className="mr-2 h-4 w-4 text-blue-500" />
                        <span className="bg-blue-50 px-2 py-1 rounded-md">
                          Contact Information
                        </span>
                      </h3>
                      <div className="space-y-2 pl-6">
                        <div className="flex items-center text-sm">
                          <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>
                            {candidate.isPrivated
                              ? "[protected data]"
                              : cv.email || candidate.email}
                          </span>
                        </div>
                        {(cv.phone || candidate.phoneNumber) && (
                          <div className="flex items-center text-sm">
                            <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>
                              {candidate.isPrivated
                                ? "[protected data]"
                                : cv.phone || candidate.phoneNumber}
                            </span>
                          </div>
                        )}
                        {(cv.address || candidate.address) && (
                          <div className="flex items-center text-sm">
                            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{cv.address || candidate.address}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* CV Details */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium flex items-center">
                        <FileText className="mr-2 h-4 w-4" /> CV Details
                      </h3>
                      <div className="space-y-2 pl-6">
                        <div className="text-sm">
                          <span className="text-muted-foreground">
                            Position:
                          </span>{" "}
                          {cv.jobPosition}
                        </div>
                        {cv.workType && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">
                              Work Type:
                            </span>{" "}
                            {cv.workType}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* All Experiences */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium flex items-center">
                      <Briefcase className="mr-2 h-4 w-4" /> Experience
                    </h3>
                    {cv.experiences && cv.experiences.length > 0 ? (
                      <div className="space-y-4 pl-6">
                        {cv.experiences.map((exp, idx) => (
                          <div key={idx} className="space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="text-sm font-medium">
                                  {exp.jobPosition}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {exp.companyName}
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {formatDate(exp.startedAt)} -{" "}
                                {formatDate(exp.endedAt)}
                              </div>
                            </div>
                            <p className="text-sm mt-1 whitespace-pre-line">
                              {exp.description}
                            </p>
                            {idx < cv.experiences.length - 1 && (
                              <Separator className="my-2" />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground pl-6">
                        No experience information provided
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* All Education */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium flex items-center">
                      <GraduationCap className="mr-2 h-4 w-4" /> Education
                    </h3>
                    {cv.educations && cv.educations.length > 0 ? (
                      <div className="space-y-4 pl-6">
                        {cv.educations.map((edu, idx) => (
                          <div key={idx} className="space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="text-sm font-medium">
                                  {edu.degree}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {edu.schoolName}
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {formatDate(edu.startedAt)} -{" "}
                                {formatDate(edu.endedAt)}
                              </div>
                            </div>
                            {edu.description && (
                              <p className="text-sm mt-1">{edu.description}</p>
                            )}
                            {idx < cv.educations.length - 1 && (
                              <Separator className="my-2" />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground pl-6">
                        No education information provided
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* Skills */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium flex items-center">
                      <Tag className="mr-2 h-4 w-4" /> Skills
                    </h3>
                    {cv.skills && cv.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2 pl-6">
                        {cv.skills.map((skill, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="rounded-md py-1 px-3 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200 hover:border-blue-300 hover:from-blue-100 hover:to-indigo-100 transition-all"
                          >
                            {skill.skillName}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground pl-6">
                        No skills information provided
                      </p>
                    )}
                  </div>
                </TabsContent>

                {/* Experience Tab */}
                <TabsContent value="experience" className="space-y-6">
                  {cv.experiences && cv.experiences.length > 0 ? (
                    cv.experiences.map((exp, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-sm font-medium text-blue-800">
                              {exp.jobPosition}
                            </div>
                            <div className="text-sm text-blue-600">
                              {exp.companyName}
                            </div>
                          </div>
                          <div className="text-sm bg-blue-50 text-blue-600 px-2 py-1 rounded-md">
                            {formatDate(exp.startedAt)} -{" "}
                            {formatDate(exp.endedAt)}
                          </div>
                        </div>
                        <p className="text-sm mt-1 whitespace-pre-line text-gray-700">
                          {exp.description}
                        </p>
                        {idx < cv.experiences.length - 1 && (
                          <Separator className="my-2 bg-blue-100" />
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">
                      No experience information provided
                    </p>
                  )}
                </TabsContent>

                {/* Education Tab */}
                <TabsContent value="education" className="space-y-6">
                  {cv.educations && cv.educations.length > 0 ? (
                    cv.educations.map((edu, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{edu.degree}</h3>
                            <p className="text-muted-foreground">
                              {edu.schoolName}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className="rounded-md bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                          >
                            {formatDate(edu.startedAt)} -{" "}
                            {formatDate(edu.endedAt)}
                          </Badge>
                        </div>
                        {edu.major && (
                          <p className="text-sm text-muted-foreground">
                            Major: {edu.major}
                          </p>
                        )}
                        {edu.description && (
                          <p className="text-sm">{edu.description}</p>
                        )}
                        {idx < cv.educations.length - 1 && (
                          <Separator className="my-4" />
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">
                      No education information provided
                    </p>
                  )}
                </TabsContent>

                {/* Skills Tab */}
                <TabsContent
                  value="skills"
                  className="grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                  {/* Skills */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium flex items-center">
                      <Tag className="mr-2 h-4 w-4" /> Skills
                    </h3>
                    {cv.skills && cv.skills.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {cv.skills.map((skill, idx) => (
                          <div
                            key={idx}
                            className="flex items-center text-sm p-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 hover:border-blue-200 hover:from-blue-100 hover:to-indigo-100 transition-all"
                          >
                            <Tag className="h-3.5 w-3.5 mr-2 text-blue-500" />
                            <span className="text-blue-700">
                              {skill.skillName}
                            </span>
                            {skill.description && (
                              <span className="text-xs text-blue-500 ml-1.5 bg-white px-1.5 py-0.5 rounded-full">
                                ({skill.description})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        No skills information provided
                      </p>
                    )}
                  </div>

                  {/* Certifications */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium flex items-center">
                      <Award className="mr-2 h-4 w-4" /> Certifications
                    </h3>
                    {cv.certifications && cv.certifications.length > 0 ? (
                      <div className="space-y-3">
                        {cv.certifications.map((cert, idx) => (
                          <div
                            key={idx}
                            className="space-y-1 bg-gradient-to-r from-amber-50 to-orange-50 p-3 rounded-lg border border-amber-100"
                          >
                            <div className="font-medium text-sm text-amber-800 flex items-center">
                              <Award className="h-4 w-4 mr-2 text-amber-500" />
                              {cert.certificateName}
                            </div>
                            {cert.createAt && (
                              <div className="text-xs text-amber-600 bg-white px-2 py-1 rounded-full inline-block">
                                Issued: {formatDate(cert.createAt)}
                              </div>
                            )}
                            {cert.description && (
                              <p className="text-sm text-amber-700">
                                {cert.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        No certifications information provided
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end mt-6 pt-4 border-t border-blue-100">
              <div className="space-x-2">
                <LoadingButton
                  variant="default"
                  onClick={handleContactCandidate}
                  loading={isSendingEmail}
                >
                  Contact
                </LoadingButton>
              </div>
            </div>
          </>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CVDialog;

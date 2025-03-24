import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusSquare, Upload, FileText } from "lucide-react";
import { ResumeItem } from "./ResumeItem";
import { toast } from "react-toastify";
import {
  createCV,
  getCVsByUserId,
  setFeatureCV,
  uploadCV,
  deleteCV,
} from "@/services/cvServices";
import { uploadFile } from "@/services/employerServices";

export const Index = () => {
  const [resumes, setResumes] = useState([]);
  const [uploadedResumes, setUploadedResumes] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [featuredCVs, setFeaturedCVs] = useState({});
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [filePath, setFilePath] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [fileError, setFileError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const user = JSON.parse(localStorage.getItem("userLoginData"));
  const userID = user?.userID || undefined;

  const fetchCVs = async () => {
    try {
      const data = await getCVsByUserId(userID);

      if (data) {
        const systemCVs = data.filter((cv) => !cv.filePath);
        const uploadedCVs = data.filter((cv) => cv.filePath);

        setResumes(systemCVs);
        setUploadedResumes(uploadedCVs);
        setTotalCount(data.length);

        const featuredStatus = data.reduce((acc, resume) => {
          acc[resume.cvid] = resume.isFeatured || false;
          return acc;
        }, {});
        setFeaturedCVs(featuredStatus);
      }

      console.log("CVs fetched:", data);
    } catch (error) {
      console.error("Error fetching CVs:", error);
      toast.error("Failed to load CVs. Please try again.");
    }
  };

  useEffect(() => {
    if (userID) {
      fetchCVs();
    }
  }, [userID]);

  const handleCreateCV = async () => {
    try {
      if (resumes.length >= 3) {
        toast.warning("You can only create a maximum of 3 CVs.");
        return;
      }

      const newCV = await createCV({ userID });
      setResumes((prevResumes) => [newCV, ...prevResumes]);
      setTotalCount((prevCount) => prevCount + 1);

      // Assuming you want to navigate to edit page
      // navigate(`/candidate/my-cv/edit?cvId=${newCV.cvid}`);
    } catch (error) {
      console.error("Error creating CV:", error);
      toast.error("Failed to create new CV. Please try again.");
    }
  };

  const handleDeleteCV = async (deletedCVId, isUploadedCV = false) => {
    if (isDeleting) return;

    try {
      setIsDeleting(true);

      await deleteCV(deletedCVId);

      if (isUploadedCV) {
        setUploadedResumes((prevResumes) =>
          prevResumes.filter((resume) => resume.cvid !== deletedCVId)
        );
      } else {
        setResumes((prevResumes) =>
          prevResumes.filter((resume) => resume.cvid !== deletedCVId)
        );
      }

      setTotalCount((prevCount) => prevCount - 1);
      toast.success("CV deleted successfully");
    } catch (error) {
      console.error("Error deleting CV:", error);
      toast.error("Failed to delete CV. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSetAsFeatured = async (cvId) => {
    try {
      await setFeatureCV(cvId, userID);

      setFeaturedCVs((prevState) => {
        const updatedFeaturedCVs = Object.keys(prevState).reduce((acc, key) => {
          acc[key] = key === cvId.toString();
          return acc;
        }, {});

        return updatedFeaturedCVs;
      });

      // Update both system and uploaded CVs
      setResumes((prevResumes) =>
        prevResumes.map((resume) => ({
          ...resume,
          isFeatured: resume.cvid === cvId,
        }))
      );

      setUploadedResumes((prevResumes) =>
        prevResumes.map((resume) => ({
          ...resume,
          isFeatured: resume.cvid === cvId,
        }))
      );

      toast.success("CV featured status updated successfully");
    } catch (error) {
      console.error("Error setting featured CV:", error);
      toast.error("Failed to update CV featured status.");
    }
  };

  const handleCVFileChange = async (event) => {
    const selectedFile = event.target.files[0];

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setFileError("Only PDF files are allowed!");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setFileError("File size must be less than 5MB!");
      return;
    }

    setFileError("");
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setPreviewUrl(URL.createObjectURL(selectedFile));

    setIsLoading(true);

    try {
      const uploadResponse = await uploadFile(selectedFile);
      const fileUrl = uploadResponse.fileUrl;

      const cvData = await uploadCV({
        cvid: 0,
        userID,
        fileName: selectedFile.name,
        filePath: fileUrl,
      });

      if (cvData) {
        setUploadedResumes((prevResumes) => [cvData, ...prevResumes]);
        setTotalCount((prevCount) => prevCount + 1);
        toast.success("CV uploaded and processed successfully!");
      }

      // Reset file state
      setFile(null);
      setFileName("");
      setPreviewUrl("");
    } catch (error) {
      console.error("Error processing CV:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Error processing CV, please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileName("");
    setPreviewUrl("");
    setFilePath("");
    setFileError("");
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-3 py-6">
      {/* Total CV Count */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-blue-800">Total CVs</h2>
            <p className="text-blue-600">
              You have <span className="font-semibold">{totalCount}</span> CVs
              in total ({resumes.length} system CVs, {uploadedResumes.length}{" "}
              uploaded CVs)
            </p>
          </div>
          <Button onClick={handleCreateCV} className="flex items-center gap-2">
            <PlusSquare className="size-5" />
            New CV
          </Button>
        </div>
      </div>

      {/* Upload CV Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-4">Upload CV File</h2>
        <div className="flex flex-col gap-3">
          <div className="uploadButton">
            <input
              className="uploadButton-input"
              type="file"
              accept=".pdf"
              id="uploadCV"
              onChange={handleCVFileChange}
              disabled={isLoading}
            />
            <label
              className="uploadButton-button ripple-effect flex items-center gap-2"
              htmlFor="uploadCV"
            >
              <Upload className="size-4" />
              Upload CV PDF
            </label>
          </div>

          {fileName && (
            <div className="flex items-center gap-2 mt-2">
              <FileText className="size-4 text-blue-600" />
              <span className="text-sm font-medium">{fileName}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveFile}
                disabled={isLoading}
              >
                Remove
              </Button>
            </div>
          )}

          <div className="text-sm text-gray-500">
            Max file size is 5MB. Suitable files are .pdf
            {fileError && <div className="text-red-500 mt-2">{fileError}</div>}
          </div>

          {isLoading && (
            <div className="text-sm flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
              Processing your CV...
            </div>
          )}
        </div>
      </div>

      {/* System-Created CVs */}
      <section>
        <div className="space-y-4 mb-4">
          <h1 className="text-2xl font-bold">My System CVs</h1>
          <p className="text-gray-500">CVs created directly in our system</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {resumes.length > 0 ? (
            resumes.map((resume) => (
              <ResumeItem
                key={resume?.cvid}
                resume={resume}
                onDelete={() => handleDeleteCV(resume.cvid)}
                isFeatured={featuredCVs[resume.cvid]}
                onSetAsFeatured={handleSetAsFeatured}
                isDeleting={isDeleting}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-6 text-gray-500">
              No system CVs created yet. Click "New CV" to create one.
            </div>
          )}
        </div>
      </section>

      {/* Uploaded CVs */}
      <section className="mt-8">
        <div className="space-y-4 mb-4">
          <h1 className="text-2xl font-bold">Uploaded CVs</h1>
          <p className="text-gray-500">CVs uploaded to our system</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {uploadedResumes.length > 0 ? (
            uploadedResumes.map((resume) => (
              <div
                key={resume.cvid}
                className={`border rounded-md p-4 shadow-sm ${
                  featuredCVs[resume.cvid]
                    ? "bg-yellow-50 border-yellow-300"
                    : "bg-white"
                }`}
              >
                <h2 className="text-lg font-bold truncate mb-2">
                  {resume.fileName || "Uploaded CV"}
                </h2>

                <div className="h-64 overflow-hidden mb-4 bg-gray-100 rounded">
                  <iframe
                    src={resume.filePath}
                    title={`CV Preview ${resume.fileName}`}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    className="cv-preview-frame"
                  ></iframe>
                </div>

                <a
                  href={resume.filePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline mt-2 block mb-4"
                >
                  Preview CV
                </a>

                <div className="flex justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetAsFeatured(resume.cvid)}
                    className={featuredCVs[resume.cvid] ? "bg-yellow-200" : ""}
                  >
                    {featuredCVs[resume.cvid] ? "Featured" : "Set as Featured"}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteCV(resume.cvid, true)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Remove"}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-6 text-gray-500">
              No uploaded CVs yet. Use the upload button to add your existing
              CV.
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

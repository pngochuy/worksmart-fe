import { Button } from "@/components/ui/button";
import { PlusSquare, Upload, FileText } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { ResumeItem } from "./ResumeItem";
import { useEffect, useState } from "react";
import { createCV, getCVsByUserId, setFeatureCV, uploadCV, deleteCV } from "@/services/cvServices";
import { toast } from "react-toastify";
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
  const navigate = useNavigate();

  const fetchCVs = async () => {
    try {
      const data = await getCVsByUserId(userID);

      if (data) {
        // Phân tách CV được tạo từ hệ thống và CV được upload
        const systemCVs = data.filter(cv => !cv.filePath);
        const uploadedCVs = data.filter(cv => cv.filePath);
        
        setResumes(systemCVs);
        setUploadedResumes(uploadedCVs);
        setTotalCount(data.length);

        // Lưu trạng thái featured cho từng CV
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
    fetchCVs();
  }, [userID]);

  // Function to create a new CV
  const handleCreateCV = async () => {
    try {
      // Kiểm tra xem đã đạt giới hạn 3 CV chưa
      if (resumes.length >= 3) {
        toast.warning("You can only create a maximum of 3 CVs.");
        return; // Dừng hàm nếu đã đạt giới hạn
      }

      const newCV = await createCV({ userID: userID });
      console.log("New CV created:", newCV);
      setResumes((prevResumes) => [newCV, ...prevResumes]);
      setTotalCount((prevCount) => prevCount + 1);

      navigate(`/candidate/my-cv/edit?cvId=${newCV.cvid}`);
    } catch (error) {
      console.error("Error creating CV:", error);
      toast.error("Failed to create new CV. Please try again.");
    }
  };

  // Hàm cập nhật danh sách CV sau khi xóa
  const handleDeleteCV = async (deletedCVId, isUploadedCV = false) => {
    if (isDeleting) return; // Tránh nhấn nút xóa nhiều lần
    
    try {
      setIsDeleting(true);
      
      // Gọi API xóa CV từ cơ sở dữ liệu
      await deleteCV(deletedCVId);
      
      // Sau khi xóa thành công từ DB, cập nhật state
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

  // Hàm xử lý khi "Set as Featured" (cập nhật trạng thái featured)
  const handleSetAsFeatured = async (cvId) => {
    try {
      const newState = !featuredCVs[cvId];
      await setFeatureCV(cvId, userID);
  
      // Cập nhật trạng thái featured cho danh sách CV
      setFeaturedCVs((prevState) => {
        const updatedFeaturedCVs = Object.keys(prevState).reduce((acc, key) => {
          acc[key] = key === cvId ? true : false;
          return acc;
        }, {});
  
        return updatedFeaturedCVs;
      });
  
      // Cập nhật lại danh sách CV để đảm bảo CV mới không bị ẩn
      setResumes((prevResumes) => {
        return prevResumes.map((resume) => ({
          ...resume,
          isFeatured: resume.cvid === cvId ? true : false,
        }));
      });
      
      setUploadedResumes((prevResumes) => {
        return prevResumes.map((resume) => ({
          ...resume,
          isFeatured: resume.cvid === cvId ? true : false,
        }));
      });
  
      toast.success(
        newState
          ? "Resume set as featured successfully."
          : "Resume removed from featured"
      );
    } catch (error) {
      console.log("error: ", error);
      toast.error("Failed to set resume as featured.");
    }
  };
  
  // Xử lý upload file CV
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
      // Bước 1: Upload file lên cloudinary thông qua uploadImagesProfile
      const uploadResponse = await uploadFile(selectedFile);
      console.log("File Select:", selectedFile);
      const fileUrl = uploadResponse.fileUrl;
      setFilePath(fileUrl);

      console.log("File uploaded to Cloudinary:", fileUrl);
      console.log("Data upload:", userID);
      console.log("Data upload:", selectedFile.name);
      console.log("Data upload:", fileUrl);

      // Bước 2: Gọi API để xử lý file PDF đã upload
      const cvData = await uploadCV({
        cvid: 0,
        userID: userID,
        fileName: selectedFile.name,
        filePath: fileUrl
      });

      console.log("CV processed:", cvData);

      // Bước 3: Cập nhật danh sách CV đã upload (không thêm vào danh sách My CVs)
      if (cvData) {
        setUploadedResumes((prevResumes) => [cvData, ...prevResumes]);
        setTotalCount((prevCount) => prevCount + 1);
        toast.success("CV uploaded and processed successfully!");
      }

      // Reset form sau khi upload thành công
      setFile(null);
      setFileName("");
      setPreviewUrl("");

    } catch (error) {
      console.error("Error processing CV:", error);
      const errorMessage = error.response?.data?.message || "Error processing CV, please try again.";
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
    <>
      <main className="mx-auto w-full max-w-7xl space-y-6 px-3 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <Button
            asChild
            className="flex w-fit gap-2"
            onClick={handleCreateCV}
          >
            <NavLink className="hover:text-white">
              <PlusSquare className="size-5" />
              New CV
            </NavLink>
          </Button>

          <div className="bg-white p-4 rounded-lg shadow-sm w-full sm:w-96">
            <h2 className="text-lg font-semibold mb-2">Upload CV File</h2>
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
        </div>

        {/* My CVs - Chỉ hiển thị CV tạo từ hệ thống */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">My CVs</h1>
          <p className="text-gray-500">CVs created in our system</p>
        </div>
        <div className="flex w-full grid-cols-2 flex-col gap-3 sm:grid md:grid-cols-3 lg:grid-cols-4">
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
              No CVs created yet. Click "New CV" to create one.
            </div>
          )}
        </div>

        {/* CV UPLOAD - Chỉ hiển thị CV đã upload */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">CV UPLOAD</h1>
          <p className="text-gray-500">CVs uploaded to our system</p>
        </div>
        <div className="flex w-full grid-cols-2 flex-col gap-3 sm:grid md:grid-cols-3 lg:grid-cols-4">
          {uploadedResumes.length > 0 ? (
            uploadedResumes.map((resume) => (
              <div key={resume.cvid} className="border rounded-md p-4 shadow-sm">
                <h2 className="text-lg font-bold truncate mb-2">{resume.fileName || "Uploaded CV"}</h2>
                
                <div className="h-64 overflow-hidden mb-4 bg-gray-100 rounded">
                  <iframe
                    src={resume.filePath}
                    title={`CV Preview ${resume.fileName}`}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    className="pointer-events-none"
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
                    className={featuredCVs[resume.cvid] ? "bg-blue-100" : ""}
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
              No uploaded CVs yet. Use the upload button to add your existing CV.
            </div>
          )}
        </div>
      </main>
    </>
  );
};
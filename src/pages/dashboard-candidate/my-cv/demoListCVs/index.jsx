import { Button } from "@/components/ui/button";
import { PlusSquare, Upload, FileText } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { ResumeItem } from "./ResumeItem";
import { useEffect, useState } from "react";
import { createCV, getCVsByUserId, setFeatureCV, uploadCV } from "@/services/cvServices";
import { toast } from "react-toastify";
import { uploadFile  } from "@/services/employerServices";

export const Index = () => {
  const [resumes, setResumes] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [featuredCVs, setFeaturedCVs] = useState({});
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [filePath, setFilePath] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [fileError, setFileError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const user = JSON.parse(localStorage.getItem("userLoginData"));
  const userID = user?.userID || undefined;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCVs = async () => {
      try {
        const data = await getCVsByUserId(userID);

        if (data) {
          setResumes(data);
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
      }
    };

    fetchCVs();
  }, []);

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
    }
  };

  // Hàm cập nhật danh sách CV sau khi xóa
  const handleDeleteCV = (deletedCVId) => {
    setResumes((prevResumes) =>
      prevResumes.filter((resume) => resume.cvid !== deletedCVId)
    );
    setTotalCount((prevCount) => prevCount - 1);
  };

  // Hàm xử lý khi "Set as Featured" (cập nhật trạng thái featured)
  const handleSetAsFeatured = async (cvId) => {
    try {
      const newState = !featuredCVs[cvId];
      await setFeatureCV(cvId, userID);

      setFeaturedCVs((prevState) => {
        const updatedFeaturedCVs = Object.keys(prevState).reduce((acc, key) => {
          acc[key] = key === cvId ? true : false;
          return acc;
        }, {});

        return updatedFeaturedCVs;
      });
      toast.success(
        newState
          ? "Resume set as featured successfully."
          : "Resume removed from featured"
      );
      window.location.reload();
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
    setUploadProgress(10);
    
    try {
      // Bước 1: Upload file lên cloudinary thông qua uploadImagesProfile
      setUploadProgress(30);
      const uploadResponse = await uploadFile(selectedFile);
      console.log("File Select:", selectedFile);
      const fileUrl = uploadResponse.fileUrl;
      setFilePath(fileUrl);
      
      console.log("File uploaded to Cloudinary:", fileUrl);
      console.log("Data upload:", userID);
      console.log("Data upload:", selectedFile.name);
      console.log("Data upload:", fileUrl);
      setUploadProgress(60);
      
      // Bước 2: Gọi API để xử lý file PDF đã upload
      const cvData = await uploadCV({
        cvid: 0,
        userID: userID,
        fileName: selectedFile.name,
        filePath: fileUrl
      });
      
      console.log("CV processed:", cvData);
      setUploadProgress(100);
      
      // Bước 3: Cập nhật danh sách CV
      if (cvData) {
        setResumes((prevResumes) => [cvData, ...prevResumes]);
        setTotalCount((prevCount) => prevCount + 1);
        
        toast.success("CV uploaded and processed successfully!");
      }
      
      // Reset form sau khi upload thành công
      setFile(null);
      setFileName("");
      setPreviewUrl("");
      setUploadProgress(0);
      
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
                {fileError && (
                  <div className="text-red-500 mt-2">{fileError}</div>
                )}
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

        <div className="space-y-1">
          <h1 className="text-3xl font-bold">My CVs</h1>
          <p>Total: {totalCount}</p>
        </div>
        <div className="flex w-full grid-cols-2 flex-col gap-3 sm:grid md:grid-cols-3 lg:grid-cols-4">
          {resumes.map((resume) => (
            <ResumeItem
              key={resume?.cvid}
              resume={resume}
              onDelete={handleDeleteCV} 
              isFeatured={featuredCVs[resume.cvid]} 
              onSetAsFeatured={handleSetAsFeatured} 
            />
          ))}
        </div>
      </main>
    </>
  );
};
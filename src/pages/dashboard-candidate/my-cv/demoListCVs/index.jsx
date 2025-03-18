import { Button } from "@/components/ui/button";
import { PlusSquare } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { ResumeItem } from "./ResumeItem";
import { useEffect, useState } from "react";
import { createCV, getCVsByUserId, setFeatureCV, uploadCV } from "@/services/cvServices";
import { toast } from "react-toastify";

export const Index = () => {
  const [resumes, setResumes] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [featuredCVs, setFeaturedCVs] = useState({});
  const [file, setFile] = useState("");
  const [filePath, setFilePath] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  //upload CV
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile); // Lưu file thực tế
      setFilePath(selectedFile.name);
    } else {
      toast.error("Chỉ hỗ trợ tệp PDF.");
    }
  };

  const handleUpload = async () => {
    if (!filePath) return toast.error("Vui lòng chọn một tệp CV!");
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("cvFile", file);
      formData.append("userId", userID);

      const result = await uploadCV(formData);
      console.log("Data send:", formData)
      toast.success("CV đã tải lên thành công!");
      setResumes((prevResumes) => [result.cvDto, ...prevResumes]);
      setTotalCount((prevCount) => prevCount + 1);
    } catch (error) {
      console.log("Error:", error)
      toast.error("Lỗi khi tải lên. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <main className="mx-auto w-full max-w-7xl space-y-6 px-3 py-6">
        <div className="flex gap-4">
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

          <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" id="upload-cv" />
          <label htmlFor="upload-cv" className="cursor-pointer">
            <Button className="flex items-center gap-2">Upload CV</Button>
          </label>
          <Button onClick={handleUpload} className="flex items-center gap-2" disabled={isLoading}>
            {isLoading ? "Uploading..." : "Upload"}
          </Button>
        </div>

        <div className="space-y-1">
          <h1 className="text-3xl font-bold">My CVs</h1>
          <p>Total: {totalCount}</p>
        </div>
        <div className="flex w-full grid-cols-2 flex-col gap-3 sm:grid md:grid-cols-3 lg:grid-cols-4">
          {/* <ResumeItem /> */}
          {resumes.map((resume) => (
            <ResumeItem
              key={resume?.cvid}
              resume={resume}
              onDelete={handleDeleteCV} // Truyền hàm xóa CV vào
              isFeatured={featuredCVs[resume.cvid]} // Truyền trạng thái featured vào
              onSetAsFeatured={handleSetAsFeatured} // Truyền hàm set featured vào
            />
          ))}
        </div>
      </main>
    </>
  );
};

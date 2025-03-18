import { Button } from "@/components/ui/button";
import { PlusSquare } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { ResumeItem } from "./ResumeItem";
import { useEffect, useState } from "react";
import { createCV, getCVsByUserId, setFeatureCV } from "@/services/cvServices";
import { toast } from "react-toastify";

export const Index = () => {
  const [resumes, setResumes] = useState([]); // State to store resumes
  const [totalCount, setTotalCount] = useState(0); // State to store total count
  const [featuredCVs, setFeaturedCVs] = useState({}); // Trạng thái featured cho từng CV (dùng object để lưu trạng thái theo cvid)

  const user = JSON.parse(localStorage.getItem("userLoginData"));
  const userID = user?.userID || undefined;
  const navigate = useNavigate(); // Initialize useNavigate hook

  useEffect(() => {
    const fetchCVs = async () => {
      try {
        const data = await getCVsByUserId(userID);

        if (data) {
          setResumes(data); // Assuming the data has a `resumes` array
          setTotalCount(data.length); // Assuming the data has a `totalCount`

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

    fetchCVs(); // Call the fetch function
  }, []); // Empty dependency array means it runs once on mount

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

      // Redirect to the edit page with the newly created cvId
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
      const newState = !featuredCVs[cvId]; // Lật lại trạng thái featured của CV
      // Gọi API để cập nhật trạng thái featured của CV
      await setFeatureCV(cvId, userID);

      // Cập nhật trạng thái `featured` cho tất cả CVs
      setFeaturedCVs((prevState) => {
        // Tạo một object mới với trạng thái updated
        const updatedFeaturedCVs = Object.keys(prevState).reduce((acc, key) => {
          // Nếu key là cvId thì set true, còn lại false
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

  return (
    <>
      <main className="mx-auto w-full max-w-7xl space-y-6 px-3 py-6">
        <Button
          asChild
          className="mx-auto flex w-fit gap-2"
          onClick={handleCreateCV}
        >
          <NavLink className="hover:text-white ">
            <PlusSquare className="size-5 " />
            New CV
          </NavLink>
        </Button>

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

import { Button } from "@/components/ui/button";
import { PlusSquare } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { ResumeItem } from "./ResumeItem";
import { useEffect, useState } from "react";
import { createCV, getCVsByUserId, setFeatureCV } from "@/services/cvServices";
import { toast } from "react-toastify";

export const Index = () => {
  const [resumes, setResumes] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [featuredCVs, setFeaturedCVs] = useState({});

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

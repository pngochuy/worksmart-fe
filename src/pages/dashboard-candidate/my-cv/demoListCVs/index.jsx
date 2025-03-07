import { Button } from "@/components/ui/button";
import { PlusSquare } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { ResumeItem } from "./ResumeItem";
import { useEffect, useState } from "react";
import { createCV, getCVsByUserId } from "@/services/cvServices";

export const Index = () => {
  // get all CVs based on userId, orderBy: desc và totalCount
  const [resumes, setResumes] = useState([]); // State to store resumes
  const [totalCount, setTotalCount] = useState(0); // State to store total count
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
            <ResumeItem key={resume?.cvid} resume={resume} />
          ))}
        </div>
      </main>
    </>
  );
};

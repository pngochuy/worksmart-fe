import { Button } from "@/components/ui/button";
import { PlusSquare } from "lucide-react";
import { NavLink } from "react-router-dom";
import { ResumeItem } from "./ResumeItem";

export const index = () => {
  // get all CVs based on userId, orderBy: desc và totalCount

  return (
    <>
      <main className="mx-auto w-full max-w-7xl space-y-6 px-3 py-6">
        <Button asChild className="mx-auto flex w-fit gap-2">
          <NavLink to={`/candidate/my-cv/edit`} className="hover:text-white ">
            <PlusSquare className="size-5 " />
            New CV
          </NavLink>
        </Button>

        <div className="space-y-1">
          <h1 className="text-3xl font-bold">My CVs</h1>
          <p>Total: 99</p>
        </div>
        <div className="flex w-full grid-cols-2 flex-col gap-3 sm:grid md:grid-cols-3 lg:grid-cols-4">
          <ResumeItem />
          {/* {resumes.map((resume) => (
            <ResumeItem key={resume.id} resume={resume} />
          ))} */}
        </div>
      </main>
    </>
  );
};

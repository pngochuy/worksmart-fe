import { Button } from "@/components/ui/button";
import { PlusSquare } from "lucide-react";
import { NavLink } from "react-router-dom";

export const index = () => {
  return (
    <>
      <main className="mx-auto w-full max-w-7xl space-y-6 px-3 py-6">
        <Button asChild className="mx-auto flex w-fit gap-2">
          <NavLink to={`/demo/new-resume`}>
            <PlusSquare className="size-5" />
            New Resume
          </NavLink>
        </Button>
      </main>
    </>
  );
};

/* eslint-disable react/prop-types */
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { steps } from "./step";

export const Footer = ({ currentStep, setCurrentStep }) => {
  const previousStep = steps.find(
    (_, index) => steps[index + 1]?.key === currentStep
  )?.key;

  const nextStep = steps.find(
    (_, index) => steps[index - 1]?.key === currentStep
  )?.key;

  return (
    <>
      <footer className="w-full border-t px-3 py-5">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between gap-3">
          <div className="flex items-start gap-3">
            <Button
              variant="secondary"
              className="bg-gray-800 hover:bg-gray-700 text-white"
              onClick={
                previousStep ? () => setCurrentStep(previousStep) : undefined
              }
              disabled={!previousStep}
            >
              Previous Step
            </Button>
            <Button
              onClick={nextStep ? () => setCurrentStep(nextStep) : undefined}
              disabled={!nextStep}
            >
              Next Step
            </Button>
          </div>
          <div className="flex items-start gap-3">
            <Button
              variant="secondary"
              className="bg-gray-800 hover:bg-gray-700 text-white"
              asChild
            >
              <Link to={`/demo/list-cvs`}>Close</Link>
            </Button>
            <p className="text-muted-foreground opacity-0">Saving...</p>
          </div>
        </div>
      </footer>
    </>
  );
};

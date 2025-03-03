/* eslint-disable react/prop-types */
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileUserIcon, PenLineIcon } from "lucide-react";
import { steps } from "./steps";

export const Footer = ({
  currentStep,
  setCurrentStep,
  showSmResumePreview,
  setShowSmResumePreview,
  isSaving,
}) => {
  const previousStep = steps.find(
    (_, index) => steps[index + 1]?.key === currentStep
  )?.key;

  const nextStep = steps.find(
    (_, index) => steps[index - 1]?.key === currentStep
  )?.key;

  return (
    <footer className="w-full border-t px-3 py-5">
      <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            className="bg-gray-800 hover:bg-gray-700 text-white"
            onClick={
              previousStep ? () => setCurrentStep(previousStep) : undefined
            }
            disabled={!previousStep}
          >
            Previous step
          </Button>
          <Button
            onClick={nextStep ? () => setCurrentStep(nextStep) : undefined}
            disabled={!nextStep}
          >
            Next step
          </Button>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowSmResumePreview(!showSmResumePreview)}
          className="md:hidden"
          title={
            showSmResumePreview ? "Show input form" : "Show resume preview"
          }
        >
          {showSmResumePreview ? <PenLineIcon /> : <FileUserIcon />}
        </Button>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            className="bg-gray-800 hover:bg-gray-700 text-white"
            asChild
          >
            <a href="/demo/list-cvs">Close</a>
          </Button>
          <p
            className={cn(
              "text-muted-foreground opacity-0",
              isSaving && "opacity-100"
            )}
          >
            Saving...
          </p>
        </div>
      </div>
    </footer>
  );
};

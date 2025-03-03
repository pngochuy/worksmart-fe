import { useSearchParams } from "react-router-dom";
import { steps } from "./steps";
import Breadcrumbs from "./Breadcrumbs";
import { Footer } from "./Footer";
import { useState } from "react";
import { ResumePreviewSection } from "./ResumePreviewSection";
import { cn } from "@/lib/utils";
import useUnloadWarning from "@/helpers/useUnloadWarning";
import useAutoSaveResume from "./useAutoSaveResume";

export const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [resumeData, setResumeData] = useState();
  // resumeToEdit ? mapToResumeValues(resumeToEdit) : {} // => khi tới trang này phải fetch CV từ DB phải truyền qua được
  const [showSmResumePreview, setShowSmResumePreview] = useState(false);
  const { isSaving, hasUnsavedChanges } = useAutoSaveResume(resumeData);

  useUnloadWarning(hasUnsavedChanges);

  const currentStep = searchParams.get("step") || steps[0].key;

  function setStep(key) {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("step", key);
    setSearchParams(newSearchParams); // Use setSearchParams to update URL and trigger re-render
    // window.history.pushState(null, "", `?${newSearchParams.toString()}`); => ko cập nhật đc form thì thay đổi step
  }

  const FormComponent = steps.find(
    (step) => step.key === currentStep
  )?.component;

  return (
    <>
      <div className="flex grow flex-col">
        <header className="space-y-1.5 border-b px-3 py-5 text-center">
          <h1 className="text-2xl font-bold">Design your CV</h1>
          <p className="text-sm text-muted-foreground">
            Follow the steps below to create your CV. Your progress will be
            saved automatically.
          </p>
        </header>
        <main className="relative grow">
          <div className="absolute bottom-0 top-0 flex w-full">
            <div
              className={cn(
                "w-full space-y-6 overflow-y-auto p-3 md:block md:w-1/2",
                showSmResumePreview && "hidden"
              )}
            >
              <Breadcrumbs currentStep={currentStep} setCurrentStep={setStep} />
              {FormComponent && (
                <FormComponent
                  resumeData={resumeData}
                  setResumeData={setResumeData}
                />
              )}
            </div>
            <div className="grow md:border-r" />
            <ResumePreviewSection
              resumeData={resumeData}
              setResumeData={setResumeData}
              className={cn(showSmResumePreview && "flex")}
            />
            {/* <div className="hidden w-1/2 md:flex">
              <pre
                className="overflow-x-auto"
                style={{
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word",
                  overflow: "auto",
                  width: "100%",
                }}
              >
                {JSON.stringify(resumeData, null, 2)}
              </pre>
            </div> */}
          </div>
        </main>
        <Footer
          currentStep={currentStep}
          setCurrentStep={setStep}
          showSmResumePreview={showSmResumePreview}
          setShowSmResumePreview={setShowSmResumePreview}
          isSaving={isSaving}
        />
      </div>
    </>
  );
};

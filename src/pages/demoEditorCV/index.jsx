import { useSearchParams } from "react-router-dom";
import { steps } from "./step";
import Breadcrumbs from "./Breadcrumbs";
import { Footer } from "./Footer";
import { useState } from "react";
import { ResumePreviewSection } from "./ResumePreviewSection";

export const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [resumeData, setResumeData] = useState();
  // resumeToEdit ? mapToResumeValues(resumeToEdit) : {}

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
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Sit
            blanditiis illo, a tempora ipsum, quisquam nulla beatae labore
            ducimus perferendis ipsam iusto earum, velit aperiam sapiente
            corrupti quam molestiae incidunt.
          </p>
        </header>
        <main className="relative grow">
          <div className="absolute bottom-0 top-0 flex w-full">
            <div className="w-full md:w-1/2 overflow-y-auto space-y-6">
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
        <Footer currentStep={currentStep} setCurrentStep={setStep} />
      </div>
    </>
  );
};

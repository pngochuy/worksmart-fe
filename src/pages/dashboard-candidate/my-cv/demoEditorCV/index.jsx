import { useSearchParams } from "react-router-dom";
import { steps } from "./steps";
import Breadcrumbs from "./Breadcrumbs";
import { Footer } from "./Footer";
import { useEffect, useState } from "react";
import { ResumePreviewSection } from "./ResumePreviewSection";
import { cn, mapToResumeValues } from "@/lib/utils";
import useUnloadWarning from "@/helpers/useUnloadWarning";
import useAutoSaveResume from "./useAutoSaveResume";
import { getCVById } from "@/services/cvServices";

export const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [resumeData, setResumeData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showSmResumePreview, setShowSmResumePreview] = useState(false);

  const { isSaving, hasUnsavedChanges } = useAutoSaveResume(
    resumeData,
    setResumeData,
    !isInitialized
  );

  // Get the cvId from the URL
  const cvId = searchParams.get("cvId");

  // Fetch the CV when the cvId changes
  useEffect(() => {
    async function loadCVData() {
      setIsLoading(true);

      if (cvId) {
        try {
          console.log("🔍 Fetching CV with ID:", cvId);
          const fetchedCV = await getCVById(cvId);

          if (fetchedCV) {
            console.log("✅ CV fetched successfully:", fetchedCV);
            const mappedData = mapToResumeValues(fetchedCV);
            setResumeData(mappedData);
            console.log("📋 Mapped resume data:", mappedData);
          } else {
            console.warn("⚠️ No CV data returned from server");
            setResumeData({
              cvid: cvId,
              id: cvId,
              title: "My CV",
            });
          }
        } catch (error) {
          console.error("❌ Error fetching CV:", error);
        }
      } else {
        console.log("ℹ️ No cvId provided, initializing empty CV");
      }

      setIsLoading(false);
      setIsInitialized(true);
    }

    loadCVData();
  }, [cvId]);

  useUnloadWarning(hasUnsavedChanges);

  const currentStep = searchParams.get("step") || steps[0].key;

  function setStep(key) {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("step", key);
    setSearchParams(newSearchParams);
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
          {isLoading && (
            <div className="text-sm text-blue-600">Loading your CV data...</div>
          )}
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

// import { useToast } from "@/hooks/use-toast";
import { fileReplacer } from "@/lib/utils";
import { useEffect, useState } from "react";
import useDebounce from "@/helpers/useDebounce";
import saveResume from "./action";
import { useSearchParams } from "react-router-dom";

export default function useAutoSaveResume(resumeData) {
  const [searchParams] = useSearchParams();

  //   const { toast } = useToast();

  const debouncedResumeData = useDebounce(resumeData, 1500);

  const [resumeId, setResumeId] = useState(resumeData?.cvid);
  const user = JSON.parse(localStorage.getItem("userLoginData"));
  const userID = user?.userID || undefined;

  const [lastSavedData, setLastSavedData] = useState(
    structuredClone(resumeData)
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setIsError(false);
  }, [debouncedResumeData]);

  useEffect(() => {
    async function save() {
      try {
        setIsSaving(true);
        setIsError(false);

        const newData = structuredClone(debouncedResumeData);

        const updatedResume = await saveResume({
          ...newData,
          // Remove photo from the payload if it hasn't changed
          ...(JSON.stringify(lastSavedData?.photo, fileReplacer) ===
            JSON.stringify(newData?.photo, fileReplacer) && {
            photo: undefined,
          }),
          cvid: resumeId,
          userId: userID,
        });

        setResumeId(updatedResume.id);
        setLastSavedData(newData);

        // sau khi điền form "General info" lần đầu create-cv trong DB để lấy cvID
        if (searchParams.get("resumeId") !== updatedResume.id) {
          const newSearchParams = new URLSearchParams(searchParams);
          newSearchParams.set("resumeId", updatedResume.id);
          window.history.replaceState(
            null,
            "",
            `?${newSearchParams.toString()}`
          );
        }
      } catch (error) {
        setIsError(true);
        console.error(error);

        // const { dismiss } = toast({
        //   variant: "destructive",
        //   description: (
        //     <div className="space-y-3">
        //       <p>Could not save changes.</p>
        //       <Button
        //         variant="secondary"
        //         onClick={() => {
        //           dismiss();
        //           save();
        //         }}
        //       >
        //         Retry
        //       </Button>
        //     </div>
        //   ),
        // });
      } finally {
        setIsSaving(false);
      }
    }

    // console.log(
    //   "debouncedResumeData",
    //   JSON.stringify(debouncedResumeData, fileReplacer)
    // );
    // console.log("lastSavedData", JSON.stringify(lastSavedData, fileReplacer));

    const hasUnsavedChanges =
      JSON.stringify(debouncedResumeData, fileReplacer) !==
      JSON.stringify(lastSavedData, fileReplacer);

    if (hasUnsavedChanges && debouncedResumeData && !isSaving && !isError) {
      save();
    }
  }, [
    debouncedResumeData,
    isSaving,
    lastSavedData,
    isError,
    resumeId,
    searchParams,
    // toast,
  ]);

  return {
    isSaving,
    hasUnsavedChanges:
      JSON.stringify(resumeData, fileReplacer) !==
      JSON.stringify(lastSavedData, fileReplacer),
  };
}

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import useDebounce from "@/helpers/useDebounce";
import saveResume from "./action";
import { getCVById } from "@/services/cvServices";
import { mapToResumeValues, fileReplacer } from "@/lib/utils";

export default function useAutoSaveResume(
  resumeData,
  setResumeData,
  skipSaving = false
) {
  const [searchParams, setSearchParams] = useSearchParams();
  const debouncedResumeData = useDebounce(resumeData, 1500);

  // Lấy ID từ URL hoặc từ resumeData
  const cvIdFromUrl = searchParams.get("cvId");
  const resumeIdRef = useRef(resumeData?.cvid || resumeData?.id || cvIdFromUrl);

  const user = JSON.parse(localStorage.getItem("userLoginData"));
  const userID = user?.userID || undefined;

  const [lastSavedData, setLastSavedData] = useState(
    JSON.stringify(resumeData, fileReplacer)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isError, setIsError] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState(0);

  // Cập nhật resumeIdRef khi URL hoặc resumeData thay đổi
  useEffect(() => {
    if (cvIdFromUrl) {
      resumeIdRef.current = cvIdFromUrl;
    } else if (resumeData?.cvid) {
      resumeIdRef.current = resumeData.cvid;
    }
  }, [cvIdFromUrl, resumeData?.cvid]);

  // Reset error khi có thay đổi
  useEffect(() => {
    if (isError) {
      setIsError(false);
    }
  }, [debouncedResumeData]);

  // Auto-save effect
  useEffect(() => {
    async function save() {
      try {
        // Ngăn lưu quá thường xuyên
        const now = Date.now();
        if (now - lastSaveTime < 5000) {
          console.log("⏳ Debouncing save operation");
          return;
        }

        setIsSaving(true);
        setLastSaveTime(now);

        // Kiểm tra dữ liệu có đầy đủ không
        const hasMinimumData =
          resumeIdRef.current && Object.keys(debouncedResumeData).length > 5;

        if (!hasMinimumData) {
          //console.warn("⚠️ Not enough data to save", debouncedResumeData);
          setIsSaving(false);
          return;
        }

        // Log để debug avatar URL
        // if (debouncedResumeData.photo) {
        //   console.log("📷 Photo field before saving:", {
        //     value: debouncedResumeData.photo.substring(0, 100) + "...",
        //   });
        // }

        //console.log(`🔄 Saving resume with ID: ${resumeIdRef.current}`);

        // Clone dữ liệu
        const dataToSave = { ...debouncedResumeData };

        // Đảm bảo ID được set
        dataToSave.id = resumeIdRef.current;
        dataToSave.cvid = resumeIdRef.current;
        dataToSave.userId = userID;

        // QUAN TRỌNG: Nếu không có photo trong currentData nhưng có trong lastSavedData
        // thì khôi phục giá trị đó
        if (!dataToSave.photo && lastSavedData) {
          try {
            const parsedLastSaved = JSON.parse(lastSavedData);
            if (parsedLastSaved.photo) {
              //console.log("🔄 Restoring photo from lastSavedData");
              dataToSave.photo = parsedLastSaved.photo;
            }
          } catch (error) {
            //console.error("Error parsing lastSavedData:", error);
          }
        }

        // console.log(
        //   "📤 Saving with photo:",
        //   dataToSave.photo ? "exists" : "not provided"
        // );

        // Tiếp tục save như thường lệ
        const updatedResume = await saveResume(dataToSave);

        // Đảm bảo photo được giữ lại trong kết quả
        if (updatedResume.link && !updatedResume.photo) {
          updatedResume.photo = updatedResume.link;
        }

        // Kiểm tra ID trả về từ server
        const serverReturnedId = updatedResume?.cvid || updatedResume?.CVID;

        if (
          serverReturnedId &&
          String(serverReturnedId) !== String(resumeIdRef.current)
        ) {
          // console.log(
          //   `🔀 CV clone detected! ID changed: ${resumeIdRef.current} → ${serverReturnedId}`
          // );

          // Cập nhật ID reference và URL
          resumeIdRef.current = String(serverReturnedId);

          // Cập nhật URL param
          const newSearchParams = new URLSearchParams(searchParams);
          newSearchParams.set("cvId", String(serverReturnedId));
          setSearchParams(newSearchParams);

          // Fetch lại CV mới từ server
          const refreshedCV = await getCVById(serverReturnedId);

          if (refreshedCV) {
            // Log để debug link từ server
            //console.log("📷 Server returned link:", refreshedCV.link);

            const mappedData = mapToResumeValues(refreshedCV);
            setResumeData(mappedData);
            setLastSavedData(JSON.stringify(mappedData, fileReplacer));
          }
        } else {
          // Cập nhật lastSavedData
          setLastSavedData(JSON.stringify(debouncedResumeData, fileReplacer));
        }
      } catch (error) {
        //console.error("❌ Error saving resume:", error);
        setIsError(true);
      } finally {
        setIsSaving(false);
      }
    }

    // Kiểm tra có thay đổi chưa lưu không
    const hasChanges =
      JSON.stringify(debouncedResumeData, fileReplacer) !== lastSavedData;
    const hasData = Object.keys(debouncedResumeData).length > 5;

    // Chỉ save khi có đủ điều kiện
    if (hasChanges && hasData && !isSaving && !skipSaving) {
      save();
    }
  }, [
    debouncedResumeData,
    lastSavedData,
    isSaving,
    skipSaving,
    userID,
    searchParams,
  ]);

  // Trạng thái để component hiển thị
  return {
    isSaving,
    hasUnsavedChanges:
      JSON.stringify(resumeData, fileReplacer) !== lastSavedData,
  };
}

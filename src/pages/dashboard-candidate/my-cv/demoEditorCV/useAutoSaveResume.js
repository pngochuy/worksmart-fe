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
          console.warn("⚠️ Not enough data to save", debouncedResumeData);
          setIsSaving(false);
          return;
        }

        console.log("⚙️ Resume data structure before save:", {
          generalInfo: {
            title: debouncedResumeData.title,
            description: debouncedResumeData.description,
            colorHex: debouncedResumeData.colorHex,
            borderStyle: debouncedResumeData.borderStyle,
          },
          personalInfo: {
            firstName: debouncedResumeData.firstName,
            lastName: debouncedResumeData.lastName,
            jobTitle: debouncedResumeData.jobTitle,
            email: debouncedResumeData.email,
            phone: debouncedResumeData.phone,
            address: debouncedResumeData.address,
            photo: debouncedResumeData.photo ? "present" : "not present",
          },
          experiences: debouncedResumeData.workExperiences?.length || 0,
          educations: debouncedResumeData.educations?.length || 0,
          skills: debouncedResumeData.skills?.length || 0,
          summary: debouncedResumeData.summary ? "present" : "not present",
        });

        console.log(`🔄 Saving resume with ID: ${resumeIdRef.current}`);

        const updatedResume = await saveResume({
          ...debouncedResumeData,
          id: resumeIdRef.current,
          cvid: resumeIdRef.current,
          userId: userID,
        });

        // Kiểm tra ID trả về từ server
        const serverReturnedId = updatedResume?.cvid || updatedResume?.CVID;

        if (
          serverReturnedId &&
          String(serverReturnedId) !== String(resumeIdRef.current)
        ) {
          console.log(
            `🔀 CV clone detected! ID changed: ${resumeIdRef.current} → ${serverReturnedId}`
          );

          // Cập nhật ID reference và URL
          resumeIdRef.current = String(serverReturnedId);

          // Cập nhật URL param
          const newSearchParams = new URLSearchParams(searchParams);
          newSearchParams.set("cvId", String(serverReturnedId));
          setSearchParams(newSearchParams);

          // Fetch lại CV mới từ server
          const refreshedCV = await getCVById(serverReturnedId);

          if (refreshedCV) {
            const mappedData = mapToResumeValues(refreshedCV);
            setResumeData(mappedData);
            setLastSavedData(JSON.stringify(mappedData, fileReplacer));
          }
        } else {
          // Cập nhật lastSavedData
          setLastSavedData(JSON.stringify(debouncedResumeData, fileReplacer));
        }
      } catch (error) {
        console.error("❌ Error saving resume:", error);
        setIsError(true);
      } finally {
        setIsSaving(false);
      }
    }

    // Kiểm tra có thay đổi chưa lưu không
    const hasChanges =
      JSON.stringify(debouncedResumeData, fileReplacer) !== lastSavedData;
    const hasData = Object.keys(debouncedResumeData).length > 5;

    // Chỉ save khi:
    // 1. Có thay đổi
    // 2. Đủ dữ liệu
    // 3. Không đang trong quá trình save
    // 4. Không bị skip (nghĩa là đã khởi tạo xong)
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

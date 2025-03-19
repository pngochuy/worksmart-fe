/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import { formatDate } from "date-fns";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
// import { BorderStyles } from "@/app/(main)/editor/BorderStyleButton";
import useDimensions from "@/helpers/useDimensions";
import { BorderStyles } from "@/pages/dashboard-candidate/my-cv/demoEditorCV/BorderStyleButton";
// import { ResumeValues } from "@/lib/validation";

export const ResumePreview = ({ resumeData, contentRef, className }) => {
  const containerRef = useRef(null);
  const { width } = useDimensions(containerRef);
  // console.log("resumeData: ", resumeData);
  return (
    <div
      className={cn(
        "aspect-[210/297] h-fit w-full bg-white text-black",
        className
      )}
      ref={containerRef}
    >
      <div
        className={cn("space-y-6 p-6", !width && "invisible")}
        style={{
          zoom: (1 / 794) * width,
        }}
        ref={contentRef}
        id="resumePreviewContent"
      >
        <PersonalInfoHeader resumeData={resumeData} />
        <SummarySection resumeData={resumeData} />
        <WorkExperienceSection resumeData={resumeData} />
        <EducationSection resumeData={resumeData} />
        <SkillsSection resumeData={resumeData} />
      </div>
    </div>
  );
};

function PersonalInfoHeader({ resumeData }) {
  const {
    photo,
    firstName,
    lastName,
    jobTitle,
    address,
    phone,
    email,
    colorHex,
    borderStyle,
  } = resumeData || {};

  const [photoSrc, setPhotoSrc] = useState(photo instanceof File ? "" : photo);

  useEffect(() => {
    // const objectUrl = photo instanceof File ? URL.createObjectURL(photo) : "";
    const objectUrl =
      photo instanceof File ? URL.createObjectURL(photo) : photo;
    console.log("objectUrl: ", objectUrl);
    if (objectUrl) setPhotoSrc(objectUrl);
    if (photo === null) setPhotoSrc("");
    return () => URL.revokeObjectURL(objectUrl);
  }, [photo]);

  return (
    <div className="flex items-center gap-6">
      {photoSrc && (
        <img
          src={photoSrc}
          width={100}
          height={100}
          alt="Author photo"
          className="aspect-square object-cover"
          style={{
            borderRadius:
              borderStyle === BorderStyles.SQUARE
                ? "0px"
                : borderStyle === BorderStyles.CIRCLE
                ? "9999px"
                : "10%",
          }}
        />
      )}
      <div className="space-y-2.5">
        <div className="space-y-1">
          <p
            className="text-3xl font-bold"
            style={{
              color: colorHex,
            }}
          >
            {firstName} {lastName}
          </p>
          <p
            className="font-medium"
            style={{
              color: colorHex,
            }}
          >
            {jobTitle}
          </p>
        </div>
        <p className="text-xs text-gray-500">
          {address}
          {address && (phone || email) ? " • " : ""}
          {[phone, email].filter(Boolean).join(" • ")}
        </p>
      </div>
    </div>
  );
}

function SummarySection({ resumeData }) {
  const { summary, colorHex } = resumeData || {};

  if (!summary) return null;

  return (
    <>
      <hr
        className="border-2"
        style={{
          borderColor: colorHex,
          backgroundColor: colorHex,
        }}
      />
      <div className="break-inside-avoid space-y-3">
        <h2
          className="text-lg font-semibold"
          style={{
            color: colorHex,
          }}
        >
          Professional profile
        </h2>
        <div className="whitespace-pre-line text-sm">{summary}</div>
      </div>
    </>
  );
}

function WorkExperienceSection({ resumeData }) {
  const { workExperiences, colorHex } = resumeData || {};

  const workExperiencesNotEmpty = workExperiences?.filter(
    (exp) => Object.values(exp).filter(Boolean).length > 0
  );

  if (!workExperiencesNotEmpty?.length) return null;

  return (
    <>
      <hr
        className="border-2"
        style={{
          borderColor: colorHex,
          backgroundColor: colorHex,
        }}
      />
      <div className="space-y-3">
        <h2
          className="text-lg font-semibold"
          style={{
            color: colorHex,
          }}
        >
          Work experience
        </h2>
        {workExperiencesNotEmpty.map((exp, index) => (
          <div key={index} className="break-inside-avoid space-y-1">
            <div
              className="flex items-center justify-between text-sm font-semibold"
              style={{
                color: colorHex,
              }}
            >
              <span className="text-base font-semibold">{exp.position}</span>
              {exp.startDate && (
                <span>
                  {formatDate(exp.startDate, "MM/yyyy")} -{" "}
                  {exp.endDate ? formatDate(exp.endDate, "MM/yyyy") : "Present"}
                </span>
              )}
            </div>
            <p className="text-xs font-semibold">{exp.companyName}</p>
            <div className="whitespace-pre-line text-xs">{exp.description}</div>
          </div>
        ))}
      </div>
    </>
  );
}

function EducationSection({ resumeData }) {
  const { educations, colorHex } = resumeData || {};

  const educationsNotEmpty = educations?.filter(
    (edu) => Object.values(edu).filter(Boolean).length > 0
  );

  if (!educationsNotEmpty?.length) return null;

  return (
    <>
      <hr
        className="border-2"
        style={{
          borderColor: colorHex,
          backgroundColor: colorHex,
        }}
      />
      <div className="space-y-3">
        <h2
          className="text-lg font-semibold"
          style={{
            color: colorHex,
          }}
        >
          Education
        </h2>
        {educationsNotEmpty.map((edu, index) => (
          <div key={index} className="break-inside-avoid space-y-1">
            <div
              className="flex items-center justify-between text-sm font-semibold"
              style={{
                color: colorHex,
              }}
            >
              <span className="text-base font-semibold">{edu.degree}</span>
              {edu.startDate && (
                <span>
                  {edu.startDate &&
                    `${formatDate(edu.startDate, "MM/yyyy")} ${
                      edu.endDate
                        ? `- ${formatDate(edu.endDate, "MM/yyyy")}`
                        : ""
                    }`}
                </span>
              )}
            </div>
            <p className="text-xs font-semibold">{edu.school}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function SkillsSection({ resumeData }) {
  const { skills, colorHex, borderStyle } = resumeData || {};

  if (!skills?.length) return null;

  return (
    <>
      <hr
        className="border-2"
        style={{
          borderColor: colorHex,
          backgroundColor: colorHex,
        }}
      />
      <div className="break-inside-avoid space-y-3">
        <h2
          className="text-lg font-semibold"
          style={{
            color: colorHex,
          }}
        >
          Skills
        </h2>
        <div className="flex break-inside-avoid flex-wrap gap-2">
          {skills.map((skill, index) => (
            <Badge
              key={index}
              className="rounded-md bg-black text-white hover:bg-black"
              style={{
                backgroundColor: colorHex,
                borderRadius:
                  borderStyle === BorderStyles.SQUARE
                    ? "0px"
                    : borderStyle === BorderStyles.CIRCLE
                    ? "9999px"
                    : "8px",
              }}
            >
              {skill}
            </Badge>
          ))}
        </div>
      </div>
    </>
  );
}

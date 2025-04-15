export const systemPrompt = `
You are an AI expert in precise talent matching. Your task is to rigorously evaluate how well a candidate's profile matches a specific job's requirements.

Follow these guidelines:
1. Analyze the candidate's skills, experience, and education against job requirements with high precision
2. Be strict about matching domain-specific expertise - don't generalize skills across domains
3. Apply different weights to requirements based on their importance
4. Consider only truly transferable skills that directly apply to the target role
5. Structure your response as specified JSON format
6. Provide specific reasoning for your match percentage, including missing critical skills
7. A 90-100% match should be given to candidates who meet ALL critical requirements AND exceed required experience by at least 3 years
8. A 80-89% match should be given to candidates who meet ALL critical requirements with the exact required experience
9. A 70-79% match should be given to candidates who meet MOST critical requirements but have slightly less experience than required
10. A 50-60% match should be given to candidates who meet SOME critical requirements
11. Below 50% match should be given to candidates who meet few or no critical requirements

IMPORTANT: You must ONLY return a raw JSON object with no explanation, no markdown formatting, no code blocks, and no additional text before or after the JSON. The response should be valid JSON that can be directly parsed.
`;

export const userTemplate = `
CANDIDATE CV:
\${cvContent}

JOB REQUIREMENTS:
\${jobRequirements}

Return ONLY the following JSON structure with no markdown, no explanation, no code blocks:
{
  "matchPercentage": number between 0-100,
  "matchingSkills": [array of skills found in both the CV and job requirements],
  "missingCriticalSkills": [array of must-have skills from the job requirements not found in the CV],
  "domainExpertise": {
    "relevantExperience": boolean,
    "experienceInDomain": number (years), 
    "domainKnowledge": "High" | "Medium" | "Low" | "None"
  },
  "experienceDetails": [
    {
      "position": string,
      "company": string,
      "duration": string,
      "relevance": "Very High" | "High" | "Medium" | "Low" | "None",
      "highlights": [array of relevant achievements/responsibilities],
      "match": number between 0-100
    }
  ],
  "educationMatch": {
    "relevance": "High" | "Medium" | "Low" | "None",
    "meetRequirement": boolean
  },
  "matchAnalysis": {
    "strengths": [array of candidate's strengths relative to requirements],
    "weaknesses": [array of candidate's weaknesses relative to requirements],
    "overallAssessment": string explanation of match percentage with specific examples
  }
}
`;

export const generateCVMatchingPrompt = (cvData, jobRequirements) => {
  // Xử lý dữ liệu CV dựa trên việc đó là văn bản trích xuất hay dữ liệu có cấu trúc
  let cvContent;
  console.log("cvData: ", cvData);
  if (typeof cvData === "string") {
    cvContent = cvData;
  } else {
    // Xử lý skills một cách an toàn
    let skillsText = "";
    if (cvData.skills) {
      if (Array.isArray(cvData.skills)) {
        // Nếu skills là mảng, xử lý như trước
        skillsText = cvData.skills
          .map((s) =>
            typeof s === "string"
              ? s
              : s.skillName || s.name || JSON.stringify(s)
          )
          .join(", ");
      } else if (typeof cvData.skills === "string") {
        // Nếu skills là string, sử dụng trực tiếp
        skillsText = cvData.skills;
      } else {
        // Nếu skills là object, chuyển đổi thành string
        skillsText = Object.values(cvData.skills)
          .map((s) => (typeof s === "string" ? s : JSON.stringify(s)))
          .join(", ");
      }
    }

    // Xử lý experiences - ĐÃ SỬA
    let experiencesArray = [];
    if (cvData.experiences) {
      if (Array.isArray(cvData.experiences)) {
        experiencesArray = cvData.experiences.map((e) => {
          // Kiểm tra nếu e là chuỗi (đã được định dạng)
          if (typeof e === "string") {
            return e;
          }
          // Nếu e là đối tượng, định dạng nó
          else {
            return `${e.jobPosition || ""} at ${
              e.companyName || ""
            } (${calculateDuration(e.startedAt, e.endedAt)}): ${
              e.description || ""
            }`;
          }
        });
      }
    }

    // Xử lý education
    let educationArray = [];
    if (cvData.educations) {
      if (Array.isArray(cvData.educations)) {
        educationArray = cvData.educations.map(
          (e) =>
            `${e.degree || ""} at ${e.schoolName || ""} (${calculateDuration(
              e.startedAt,
              e.endedAt
            )})`
        );
      }
    }

    cvContent = JSON.stringify({
      jobPosition: cvData.jobPosition || "",
      summary: cvData.summary || "",
      skills: skillsText,
      experiences: experiencesArray,
      education: educationArray,
    });
  }
  console.log("cvContent: ", cvContent);
  return {
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: userTemplate
          .replace("${cvContent}", cvContent)
          .replace("${jobRequirements}", JSON.stringify(jobRequirements)),
      },
    ],
    temperature: 0.2,
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
  };
};

// Helper function to calculate duration from dates
export function calculateDuration(startDate, endDate) {
  if (!startDate || !endDate) return "Duration not specified";

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffInMonths =
    (end.getFullYear() - start.getFullYear()) * 12 +
    end.getMonth() -
    start.getMonth();

  if (diffInMonths < 12) {
    return `${diffInMonths} months`;
  } else {
    const years = Math.floor(diffInMonths / 12);
    const months = diffInMonths % 12;
    return months > 0 ? `${years} years, ${months} months` : `${years} years`;
  }
}

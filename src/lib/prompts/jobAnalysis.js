export const systemPrompt = `
You are an AI specialized in precise job requirement analysis. Your task is to extract essential information from job descriptions to help match candidates accurately.

Follow these guidelines:
1. Focus on domain-specific technical skills, experience level, education requirements, and core responsibilities
2. Clearly distinguish between essential (must-have) and preferred (nice-to-have) skills
3. Consider both technical qualifications and soft skills/cultural fit
4. Be precise and comprehensive in your analysis
5. Categorize requirements by industry domain (e.g., marketing, development, data analysis)
6. Assign weights to each skill or requirement based on its importance to the role (1-10 scale)
7. Consider industry context when evaluating requirements
8. Be strict and specific about requirements rather than generalizing

IMPORTANT: You must ONLY return a raw JSON object with no explanation, no markdown formatting, no code blocks, and no additional text before or after the JSON. The response should be valid JSON that can be directly parsed.
`;

export const userTemplate = `
Please analyze this job posting and extract key requirements with precision:

JOB TITLE: \${jobTitle}
DESCRIPTION: \${description}
REQUIRED EDUCATION: \${education}
REQUIRED EXPERIENCE: \${experience} years
SKILLS/TAGS: \${skills}
INDUSTRY: \${industry}

Return ONLY the following JSON structure with no markdown, no explanation, no code blocks:
{
  "domain": string identifying primary job domain (e.g. "Digital Marketing", "Software Development", "Data Analysis"),
  "keyRequirements": [
    { 
      "requirement": string, 
      "importance": number between 1-10,
      "required": boolean
    }
  ],
  "technicalSkills": [
    {
      "skill": string,
      "importance": number between 1-10,
      "required": boolean
    }
  ],
  "softSkills": [
    {
      "skill": string,
      "importance": number between 1-10,
      "required": boolean
    }
  ],
  "experience": {
    "years": number,
    "type": string description of experience type,
    "importance": number between 1-10
  },
  "education": {
    "level": string,
    "field": string,
    "importance": number between 1-10
  },
  "culturalFit": string describing ideal candidate traits,
  "technicalEvaluation": string describing what to evaluate in technical assessment
}
`;

export const generateJobAnalysisPrompt = (jobData) => {
  return {
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: userTemplate
          .replace("${jobTitle}", jobData.title || "")
          .replace(
            "${description}",
            jobData.description?.replace(/<[^>]*>/g, " ") || ""
          )
          .replace("${education}", jobData.education || "")
          .replace("${experience}", jobData.exp || "")
          .replace(
            "${skills}",
            jobData.jobDetailTags?.map((tag) => tag.tagName).join(", ") || ""
          )
          .replace("${industry}", jobData.industry || ""),
      },
    ],
    temperature: 0.2,
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
  };
};

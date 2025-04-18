// src/lib/prompts/utils.js

/**
 * Creates a standardized prompt with proper formatting
 * @param {string} systemPrompt - Instructions for the AI assistant
 * @param {object} data - Data to include in the user message
 * @param {string} template - Template string for the user message
 */
export const createPrompt = (systemPrompt, data, template) => {
  const userMessage = template.replace(
    /\${(\w+)}/g,
    (_, key) => data[key] || "N/A"
  );

  return {
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    temperature: 0.3, // Lower temperature for more deterministic responses
    model: "gpt-4o-mini", // Can be configured as needed
  };
};

// Example usage:
// const prompt = createPrompt(
//   systemPrompts.jobAnalysis,
//   { jobTitle: "Software Engineer", description: "..." },
//   userTemplates.jobAnalysis
// );

import openai from "@/lib/openai";

export async function expandSearchTerms(searchTerm) {
  if (!searchTerm || searchTerm.trim() === "") {
    return [];
  }

  const systemMessage = `
    You are an AI assistant specialized in job searching. 
    Given a job search term, generate 25-35 closely related keywords that would help expand the search scope.
    Return ONLY a comma-separated list of keywords (including the original term).
    Example input: "software engineer"
    Example output: software engineer, developer, programmer, web development, fullstack, backend, frontend, software development, coding, computer science
  `;

  const userMessage = `Generate related job search keywords for: ${searchTerm}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const aiResponse = completion.choices[0].message.content;
    console.log("AI expanded search terms:", aiResponse);

    // Đảm bảo kết quả trả về là một mảng
    if (typeof aiResponse === "string") {
      return aiResponse
        .split(",")
        .map((term) => term.trim())
        .filter((term) => term);
    }

    // Fallback nếu không phải string
    return [searchTerm];
  } catch (error) {
    console.error("Error expanding search terms:", error);
    // Nếu có lỗi, trả về mảng chỉ chứa từ khóa gốc
    return [searchTerm];
  }
}

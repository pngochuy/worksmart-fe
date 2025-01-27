export const translateToEnglish = async (name) => {
  const apiKey = import.meta.env.VITE_TRANSLATION_API_KEY; // Thay bằng khóa API của bạn
  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
  const params = {
    q: name,
    target: "en",
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();
    return data.data.translations[0].translatedText;
  } catch (error) {
    console.error("Error translating province name:", error);
    return name;
  }
};

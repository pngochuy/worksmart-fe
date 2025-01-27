export const fetchProvinces = async () => {
  try {
    const response = await fetch("https://provinces.open-api.vn/api?depth=2");
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error fetching provinces:", err);
    return [];
  }
};

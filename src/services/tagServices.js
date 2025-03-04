import axios from "axios";
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

export const fetchTags = async () => {
  try {
    const response = await axios.get(`${BACKEND_API_URL}/api/Tag/getAll`);
    return response.data;
  } catch (error) {
    console.error("Error fetching tags:", error);
    return [];
  }
};

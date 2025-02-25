import axios from "axios";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL; // Thay thế bằng URL backend thật

export const fetchCandidates = async (searchParams) => {
  try {
    const response = await axios.get(
      `${BACKEND_API_URL}/candidates/GetListSearch`,
      {
        params: searchParams,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching candidates:", error);
    return [];
  }
};

import axios from "axios";
import qs from "qs";
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

export const fetchJobs = async (searchParams) => {
  try {
    const response = await axios.get(
      `${BACKEND_API_URL}/api/Job/GetListSearch`,
      {
        params: searchParams,
        paramsSerializer: (params) =>
          qs.stringify(params, {
            skipNulls: true,
            skipEmptyStrings: true,
            arrayFormat: "repeat",
          }),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching candidates:", error);
    return [];
  }
};

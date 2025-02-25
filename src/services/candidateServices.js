import axios from "axios";

const BACKEND_API_URL = "https://localhost:7141"; // Thay thế bằng URL backend thật

export const fetchCandidates = async (searchParams) => {
    try {
        const response = await axios.get(`${BACKEND_API_URL}/api/Candidate/GetListSearch`, {
            params: searchParams
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching candidates:", error);
        return [];
    }
};

export const editCandidateProfile = async (candidateData) => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.put(`${BACKEND_API_URL}/candidates/edit-profile`, 
            candidateData, {
                headers: { Authorization: `Bearer ${token}`},
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error edit candidate profile:", error);
        return [];
    }
};

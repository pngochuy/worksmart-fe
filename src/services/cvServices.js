import axios from "axios";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

// services/cvService.js
export const getCVsByUserId = async (userId) => {
  try {
    const response = await axios.get(
      `${BACKEND_API_URL}/api/CV/user/${userId}`
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching CVs:", error);
    return null;
  }
};

export const getCVById = async (cvId) => {
  try {
    const response = await axios.get(`${BACKEND_API_URL}/api/CV/${cvId}`);

    return response.data;
  } catch (error) {
    console.error("Error fetching CV:", error);
    return null;
  }
};

// Create a new CV
export const createCV = async (cvData) => {
  try {
    // Gửi POST request để tạo một CV mới
    const response = await axios.post(
      `${BACKEND_API_URL}/api/CV/create`,
      cvData
    );

    // Return the created CV or the response if needed
    return response.data;
  } catch (error) {
    console.error("Error creating CV:", error);
    throw new Error("Failed to create CV");
  }
};

// Function to edit an existing CV (PUT request)
export const editCV = async (cvId, updatedData) => {
  try {
    // Sending PUT request to update the CV
    const response = await axios.put(
      `${BACKEND_API_URL}/api/CV/${cvId}`, // Assuming the endpoint to edit CV uses `cvId`
      updatedData
    );
    // Return the response data (assuming it returns the updated CV)
    return response.data;
  } catch (error) {
    console.error("Error updating CV:", error);
    return null;
  }
};
// Function to edit SetFeature CV (PUT request)
export const setFeatureCV = async (cvId, userId) => {
  try {
    // Sending PUT request to update the CV
    const response = await axios.put(
      `${BACKEND_API_URL}/setfeature?cvId=${cvId}&userId=${userId}`
    );
    // Return the response data (assuming it returns the updated CV)
    return response.data;
  } catch (error) {
    console.error("Error set feature CV:", error);
    return null;
  }
};

// Function to delete a CV by its ID
export const deleteCV = async (cvId) => {
  try {
    // Gửi DELETE request để xóa CV
    const response = await axios.delete(`${BACKEND_API_URL}/api/CV/${cvId}`);

    // Return the response data (you can modify this based on the response you expect from the API)
    return response.data;
  } catch (error) {
    console.error("Error deleting CV:", error);
    throw new Error("Failed to delete CV");
  }
};

export const uploadCV = async (formData) => {
  try {
    const response = await axios.post(`${BACKEND_API_URL}/api/CV/upload-cv`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Lỗi khi tải lên CV:", error);
    return null;
  }
};
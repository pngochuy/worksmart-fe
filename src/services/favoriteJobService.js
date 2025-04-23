import axios from "axios";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

// Get all favorite jobs
export const getAllFavoriteJobs = async () => {
  try {
    const response = await axios.get(`${BACKEND_API_URL}/favoritejob`);
    return response.data;
  } catch (error) {
    console.error("Error fetching all favorite jobs:", error);
    throw error;
  }
};

// Get a specific favorite job by ID
export const getFavoriteJobById = async (id) => {
  try {
    const response = await axios.get(`${BACKEND_API_URL}/favoritejob/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching favorite job with ID ${id}:`, error);
    throw error;
  }
};

// Get all favorite jobs for a specific user
export const getFavoriteJobsByUserId = async (userId) => {
  try {
    console.log(`Requesting favorite jobs for user ID: ${userId}`);
    const response = await axios.get(
      `${BACKEND_API_URL}/favoritejob/user/${userId}`
    );
    console.log(`Response for user ${userId} favorite jobs:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching favorite jobs for user ${userId}:`, error);
    return []; // Return empty array on error for better UI handling
  }
};

// Add a job to favorites
export const addJobToFavorites = async (jobData) => {
  try {
    const response = await axios.post(
      `${BACKEND_API_URL}/favoritejob`,
      jobData
    );
    return response.data;
  } catch (error) {
    console.error("Error adding job to favorites:", error);
    throw error;
  }
};

// Remove a job from favorites
export const removeFavoriteJob = async (favoriteJobId) => {
  try {
    console.log(`Removing favorite job with ID: ${favoriteJobId}`);
    const response = await axios.delete(
      `${BACKEND_API_URL}/favoritejob/${favoriteJobId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error removing favorite job with ID ${favoriteJobId}:`,
      error
    );
    throw error;
  }
};

// Check if a job is in user's favorites
export const checkJobIsFavorite = async (userId, jobId) => {
  try {
    const favoriteJobs = await getFavoriteJobsByUserId(userId);
    return favoriteJobs.some((job) => job.jobID === jobId);
  } catch (error) {
    console.error(`Error checking if job ${jobId} is in favorites:`, error);
    return false;
  }
};

// Toggle job favorite status (add if not in favorites, remove if already there)
export const toggleFavoriteJob = async (userId, jobId) => {
  try {
    // First check if the job is already in favorites
    const favoriteJobs = await getFavoriteJobsByUserId(userId);
    const existingFavorite = favoriteJobs.find((job) => job.jobID === jobId);

    if (existingFavorite) {
      // If already in favorites, remove it
      await removeFavoriteJob(existingFavorite.favoriteJobID);
      return { isFavorite: false, message: "Job removed from favorites" };
    } else {
      // If not in favorites, add it
      const newFavorite = await addJobToFavorites({
        userID: userId,
        jobID: jobId,
        dateSaved: new Date().toISOString(),
      });
      return {
        isFavorite: true,
        message: "Job added to favorites",
        data: newFavorite,
      };
    }
  } catch (error) {
    console.error(`Error toggling favorite status for job ${jobId}:`, error);
    throw error;
  }
};

export const isJobFavorited = async (userId, jobId) => {
  try {
    const response = await axios.get(
      `${BACKEND_API_URL}/favoritejob/isfavorited/${userId}/${jobId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error checking if job ${jobId} is favorited by user ${userId}:`,
      error
    );
    throw error;
  }
};
export const deleteFavoriteJob = async (userId, jobId) => {
  try {
    const response = await axios.delete(
      `${BACKEND_API_URL}/favoritejob/delete-favorite-job/${userId}/${jobId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error deleting favorite job ${jobId} for user ${userId}:`,
      error
    );
    throw error;
  }
};

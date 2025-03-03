import axios from "axios";
import apiURLConfig from "../components/apiURLConfig"; 

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL
export const getAllJobs = async () => {
  try {
    const response = await axios.get(`${BACKEND_API_URL}/api/Job/getAllJob`); 
    console.log(response);
    return response.data;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw error;
  }
};  


export const createJob = async (jobData) => {
  try {
    const response = await axios.post(`${BACKEND_API_URL}/api/Job/create`, jobData);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating job:", error);
    throw error;
  }
};

export const getJobById = async (id) => {
  try {
    const response = await axios.get(`${BACKEND_API_URL}/api/Job/${id}`);
    
    console.log(response);
    return response.data;
  } catch (error) {
    console.error("Error fetching job:", error);
    throw error;
  }
};
export const deleteJob = async (id) => {
  try {
    
    const response = await axios.delete(`${BACKEND_API_URL}/api/Job/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting job:", error);
    throw error;
  }
};
export const updateJob = async (id, jobData) => {
  try {
    const response = await axios.put(`${BACKEND_API_URL}/api/Job/update/${id}`, jobData);
    return response.data;
  } catch (error) {
    console.error("Error updating job:", error);
    throw error;
  }
};


export const hideJob = async (id) => {
  try {
    const response = await axios.put(`${BACKEND_API_URL}/api/Job/hide/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error hiding job:", error);
    throw error;
  }
};

import axios from "axios";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

export const getPackages = async () => {
  try {
    const response = await axios.get(`${BACKEND_API_URL}/api/Package/getAll`);

    if (response.status !== 200) {
      throw new Error(response.data?.message || "Failed to fetch packages");
    }

    return response.data;
  } catch (error) {
    console.error("Package fetch error:", error);
    throw error.response?.data || error.message || "Failed to load packages";
  }
};

export const createPackage = async (packageData) => {
  try {
    const response = await axios.post(
      `${BACKEND_API_URL}/api/Package/add`,
      packageData
    );

    if (response.status !== 200) {
      throw new Error(response.data?.message || "Failed to create package");
    }

    return response.data;
  } catch (error) {
    console.error("Package creation error:", error);
    throw error.response?.data || error.message || "Package creation failed";
  }
};
export const updatePackage = async (packageData) => {
  try {
    const response = await axios.put(
      `${BACKEND_API_URL}/api/Package/${packageData.packageID}`,
      packageData
    );

    if (response.status !== 200) {
      throw new Error(response.data?.message || "Failed to update package");
    }

    return response.data;
  } catch (error) {
    console.error("Package update error:", error);
    throw error.response?.data || error.message || "Package update failed";
  }
};

export const deletePackage = async (packageId) => {
  try {
    const response = await axios.delete(
      `${BACKEND_API_URL}/api/Package/delete/${packageId}`
    );

    if (response.status !== 200) {
      throw new Error(response.data?.message || "Failed to delete package");
    }

    return response.data;
  } catch (error) {
    console.error("Package deletion error:", error);
    throw error.response?.data || error.message || "Package deletion failed";
  }
};

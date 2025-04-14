import axios from "axios";
import { toast } from "react-toastify";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL; // Thay thế bằng URL backend thật

const getAccessToken = () => {
  // Lấy token để Authorization
  const token = localStorage.getItem("accessToken");
  return token ? token.replace(/^"(.*)"$/, "$1") : null;
};

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
    toast.error("Error fetching candidates!");
    return [];
  }
};

export const fetchCandidatesProfile = async () => {
  try {
    const token = getAccessToken();
    if (!token) throw new Error("No Access Token Found!");

    const response = await axios.get(`${BACKEND_API_URL}/candidates/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = response.data;
    console.log("Data lấy được:", data);
    return {
      ...data,
      isPrivated: data.isPrivated ? "Yes" : "No", // Đổi qua kiểu boolean ở API
    };
  } catch (error) {
    console.error("Error fetching candidate profile:", error);
    throw error;
  }
};

//Form Information
export const updateCandidateProfile = async (profileData) => {
  try {
    const token = getAccessToken();
    if (!token) throw new Error("No access token found");

    // const updatedData = {
    //   ...profileData,
    //   isPrivated: profileData.isPrivated === "Yes" ? true : false, // Đổi qua kiểu boolean ở API
    // };
    console.log("Profile data gửi đi:", profileData);

    const res = await axios.put(
      `${BACKEND_API_URL}/candidates/edit-profile`,
      profileData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("response: ", res);
    if (localStorage.getItem("userLoginData")) {
      const userLoginData = JSON.parse(localStorage.getItem("userLoginData"));
      userLoginData.fullName = profileData?.fullName;
      // userLoginData.avatar = profileData?.avatar; // error
      localStorage.setItem("userLoginData", JSON.stringify(userLoginData));
    }

    return "Profile updated successfully!"; // or upload successfully
  } catch (error) {
    console.error("Error updating profile:", error);
    toast.error("Error updating profile!");
    throw error;
  }
};

//Form Address
export const updateCandidateAddress = async (addressData) => {
  try {
    const token = getAccessToken();
    if (!token) throw new Error("No access token found");
    console.log("Candidate data gửi đi:", addressData);

    await axios.put(`${BACKEND_API_URL}/candidates/edit-profile`, addressData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return "Address updated successfully!";
  } catch (error) {
    console.error("Error updating address:", error);
    toast.error("Error updating address!");
    throw error;
  }
};

export const updateImagesProfile = async (imageUrl) => {
  try {
    const token = getAccessToken();
    if (!token) throw new Error("No access token found");

    const updatedData = { avatar: imageUrl };
    console.log("Image data gửi đi:", updatedData);

    await axios.put(`${BACKEND_API_URL}/candidates/edit-profile`, updatedData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (localStorage.getItem("userLoginData")) {
      const userLoginData = JSON.parse(localStorage.getItem("userLoginData"));
      userLoginData.avatar = updatedData?.avatar; // error
      localStorage.setItem("userLoginData", JSON.stringify(userLoginData));
    }
    return "Image updated successfully!";
  } catch (error) {
    console.error("Error updating image:", error);
    toast.error("Error updating image!");
    throw error;
  }
};

export const uploadImagesProfile = async (imageFile) => {
  try {
    const token = getAccessToken();
    if (!token) throw new Error("No access token found");

    if (!imageFile) return;

    const formData = new FormData();
    formData.append("file", imageFile);

    console.log("Uploading image:", imageFile.name);

    const response = await axios.post(
      `${BACKEND_API_URL}/uploads/upload-image`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return response.data; // Trả về URL ảnh đã upload
  } catch (error) {
    console.error("Error uploading image:", error);
    // toast.error("Error uploading image!");
    throw error;
  }
};

export const deleteImagesProfile = async (imageUrl) => {
  try {
    const response = await axios.delete(
      `${BACKEND_API_URL}/uploads/delete-image`,
      {
        data: imageUrl, // Gửi URL ảnh trong body
        headers: { "Content-Type": "application/json" },
      }
    );
    if (localStorage.getItem("userLoginData")) {
      const userLoginData = JSON.parse(localStorage.getItem("userLoginData"));
      userLoginData.avatar = "";
      localStorage.setItem("userLoginData", JSON.stringify(userLoginData));
    }
    console.log(response.data);
  } catch (error) {
    console.error("Error deleting image:", error);
    toast.error("Error deleting image!");
  }
};
export const checkReportStatus = async (jobId) => {
  try {
    const token = getAccessToken();
    if (!token) throw new Error("No access token found");

    const response = await axios.get(
      `${BACKEND_API_URL}/candidates/check-report-status`,
      {
        params: { jobId },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.status;
  } catch (error) {
    console.error("Error checking report status:", error);
    return "None"; // Default to "None" if there's an error
  }
};

export const reportJob = async (jobData) => {
  try {
    const token = getAccessToken();
    if (!token) throw new Error("No access token found");
    console.log("Candidate data gửi đi:", jobData);

    const response = await axios.post(
      `${BACKEND_API_URL}/candidates/report-job`,
      jobData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating address:", error);
    toast.error("Error updating address!");
    throw error;
  }
};

export const getUserFavoriteJobsList = async (userId) => {
  try {
    const response = await axios.get(
      `${BACKEND_API_URL}/favoriteJob/user/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching favorite jobs:", error);
    throw error;
  }
};

export const getApplicationByUserOwnJob = async (userId) => {
  try {
    const response = await axios.get(
      `${BACKEND_API_URL}/api/Application/User/${userId}/applications/count`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching application by job:", error)
    throw error;
  }
}
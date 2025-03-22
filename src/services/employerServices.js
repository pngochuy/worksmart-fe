import axios from "axios";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL; // Thay thế bằng URL backend thật

const getAccessToken = () => {
  // Lấy token để Authorization
  const token = localStorage.getItem("accessToken");
  return token ? token.replace(/^"(.*)"$/, "$1") : null;
};

export const fetchCompanyProfile = async () => {
  try {
    const token = getAccessToken();
    if (!token) throw new Error("No Access Token Found!");

    const response = await axios.get(`${BACKEND_API_URL}/employers/profile`, {
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
export const updateCompanyProfile = async (profileData) => {
  try {
    const token = getAccessToken();
    if (!token) throw new Error("No access token found");

    const updatedData = {
      ...profileData,
      isPrivated: profileData.isPrivated === "Yes" ? true : false, // Đổi qua kiểu boolean ở API
    };
    console.log("Profile data gửi đi:", updatedData);

    await axios.put(`${BACKEND_API_URL}/employers/edit-profile`, updatedData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (localStorage.getItem("userLoginData")) {
      const userLoginData = JSON.parse(localStorage.getItem("userLoginData"));
      userLoginData.fullName = updatedData?.fullName;
      userLoginData.avatar = updatedData?.avatar; // error
      localStorage.setItem("userLoginData", JSON.stringify(userLoginData));
    }
    return "Profile updated successfully!";
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

//Form Address
export const updateCompanyAddress = async (addressData) => {
  try {
    const token = getAccessToken();
    if (!token) throw new Error("No access token found");
    console.log("Address data gửi đi:", addressData);

    await axios.put(`${BACKEND_API_URL}/employers/edit-profile`, addressData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return "Address updated successfully!";
  } catch (error) {
    console.error("Error updating address:", error);
    throw error;
  }
};

export const updateImagesProfile = async (imageUrl) => {
  try {
    const token = getAccessToken();
    if (!token) throw new Error("No access token found");

    const updatedData = { avatar: imageUrl };
    console.log("Image data gửi đi:", updatedData);

    await axios.put(`${BACKEND_API_URL}/employers/edit-profile`, updatedData, {
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
    throw error;
  }
};
export const updateAvatar = async (imageUrl) => {
  try {
    const token = getAccessToken();
    if (!token) throw new Error("No access token found");

    const updatedData = { avatar: imageUrl };
    console.log("Image data gửi đi:", updatedData);

    await axios.put(`${BACKEND_API_URL}/employers/edit-avatar`, updatedData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // Update avatar in localStorage
    if (localStorage.getItem("userLoginData")) {
      const userLoginData = JSON.parse(localStorage.getItem("userLoginData"));
      userLoginData.avatar = updatedData?.avatar; // Update avatar in local storage
      localStorage.setItem("userLoginData", JSON.stringify(userLoginData));
    }

    return "Avatar updated successfully!";
  } catch (error) {
    console.error("Error updating avatar:", error);
    throw error;
  }
};

export const uploadFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    console.log("Uploading file:", file.name);

    const response = await axios.post(
      `${BACKEND_API_URL}/uploads/upload-file`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return response.data; // Trả về URL file đã upload
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

export const uploadImagesProfile = async (imageFile) => {
  try {
    const token = getAccessToken();
    if (!token) throw new Error("No access token found");

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
  }
};

export const verifyTax = async (taxData) => {
  try {
    const token = getAccessToken();
    if (!token) throw new Error("No access token found!");

    console.log("Tax Data gửi đi:", taxData);

    const response = await axios.post(
      `${BACKEND_API_URL}/employers/verify-tax`,
      taxData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error verifying tax:", error);
    throw error;
  }
};

export const uploadBusinessLicense = async (fileUrl) => {
  try {
    const token = getAccessToken();
    if (!token) throw new Error("No access token found");

    console.log(fileUrl);
    const response = await axios.post(
      `${BACKEND_API_URL}/employers/upload-business-license`,
      { businessLicenseImageUrl: fileUrl },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data; // Trả về thông báo thành công từ API
  } catch (error) {
    console.error("Error uploading business license:", error);
    throw error;
  }
};

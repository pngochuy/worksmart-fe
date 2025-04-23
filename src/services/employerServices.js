import axios from "axios";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL; // Thay thế bằng URL backend thật

const getAccessToken = () => {
  // Lấy token để Authorization
  const token = localStorage.getItem("accessToken");
  return token ? token.replace(/^"(.*)"$/, "$1") : null;
};

export const checkActiveSubscription = async (userId) => {
  try {
    const token = getAccessToken();

    const response = await axios.get(
      `${BACKEND_API_URL}/subscriptions/has-active-subscription/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = response.data;
    return data;
  } catch (error) {
    console.error("Error checking subscription status:", error);
    throw error;
  }
};

export const fetchCompanyProfile = async () => {
  try {
    const token = getAccessToken();
    // if (!token) throw new Error("No Access Token Found!");

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

    // const updatedData = {
    //   ...profileData,
    //   isPrivated: profileData.isPrivated === "Yes" ? true : false, // Đổi qua kiểu boolean ở API
    // };
    // console.log("Profile data gửi đi:", updatedData);

    await axios.put(`${BACKEND_API_URL}/employers/edit-profile`, profileData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (localStorage.getItem("userLoginData")) {
      const userLoginData = JSON.parse(localStorage.getItem("userLoginData"));
      userLoginData.fullName = profileData?.fullName;
      userLoginData.avatar = profileData?.avatar; // error
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

// Fetch chi tiết của company và job của company đó
export const fetchCompanyDetails = async (companyName) => {
  console.log("companyName: ", companyName);
  try {
    const response = await axios.get(
      `${BACKEND_API_URL}/employers/company-list/${companyName}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching company details:", error);
    throw error;
  }
};

export const createPaymentLink = async (userId, packageId, role) => {
  try {
    const response = await axios.post(
      `${BACKEND_API_URL}/api/Payment/create-payment`,
      {
        userId,
        packageId,
        role,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error creating payment link:", error);
    throw error;
  }
};

export const getUserSubscription = async (userId) => {
  try {
    const response = await fetch(
      `/${BACKEND_API_URL}api/subscriptions/getByUserId/${userId}`
    );
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch subscription");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching subscription:", error);
    throw error;
  }
};

export const checkPaymentStatus = async (orderCode) => {
  try {
    const response = await axios.get(
      `${BACKEND_API_URL}/api/Payment/payment-status/${orderCode}`
    );
    return response.data;
  } catch (error) {
    console.error("Error checking payment status:", error);
    throw error;
  }
};

export const cancelPayment = async ({
  orderCode,
  code,
  id,
  cancel,
  status,
}) => {
  try {
    console.log("Query Params:", { orderCode, code, id, cancel, status });

    const response = await axios.get(
      `${BACKEND_API_URL}/api/Payment/payment-cancel`,
      {
        params: { orderCode, code, id, cancel, status },
      }
    );
    console.log("DATA SENDING:", response);
    return response.data;
  } catch (error) {
    console.error("Error canceling payment:", error);
    throw error;
  }
};

export const processPaymentReturn = async (
  orderCode,
  status,
  code,
  id,
  cancel
) => {
  try {
    const response = await axios.get(
      `${BACKEND_API_URL}/api/Payment/payment-return`,
      {
        params: {
          orderCode,
          status,
          code,
          id,
          cancel,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error processing payment return:", error);
    throw error;
  }
};
//

export const fetchCompanyList = async (searchName, page, pageSize) => {
  try {
    const response = await axios.get(
      `${BACKEND_API_URL}/employers/company-list?searchName=${searchName}&page=${page}&pageSize=${pageSize}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching company list:", error);
    throw error;
  }
};
// Thêm hàm mới để lấy danh sách gói dịch vụ
export const getPackages = async () => {
  try {
    const response = await axios.get(`${BACKEND_API_URL}/api/Package/getAll`);

    return response.data;
  } catch (error) {
    console.error("Error fetching packages:", error);
    throw new Error(error.response?.data?.message || "Error fetching packages");
  }
};

export const getEmployerSubscriptions = async (userId) => {
  try {
    const response = await axios.get(
      `${BACKEND_API_URL}/subscriptions/getByUserId/${userId}`
    );

    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log("No subscriptions found for user");
      return [];
    }
    throw error;
  }
};

export const getUserTransactions = async (userId) => {
  try {
    const response = await axios.get(
      `${BACKEND_API_URL}/transactions/getByUserId/${userId}`
    );

    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log("No transactions found for user");
      return [];
    }
    throw error;
  }
};

export const scanCVs = async (file) => {
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

import axios from "axios";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

export const fetchNotificationTags = async (userId) => {
  try {
    const response = await axios.get(
      `${BACKEND_API_URL}/notificationJobTag/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách notification tags:", error);
    return [];
  }
};

export const addNotificationTag = async (userId, tagId, email) => {
  try {
    const requestBody = { userId, tagId, email };
    await axios.post(`${BACKEND_API_URL}/notificationJobTag`, requestBody);
  } catch (error) {
    console.error("Lỗi khi thêm notification tag:", error);
  }
};

export const deleteNotificationTagByCategory = async (userId, categoryID) => {
  try {
    await axios.delete(
      `${BACKEND_API_URL}/notificationJobTag/delete/by-category/${userId}/${categoryID}`
    );
  } catch (error) {
    console.error("Lỗi khi xóa notification tag theo category:", error);
  }
};

export const deleteNotificationTagByCategoryAndEmail = async (
  userId,
  categoryID,
  email
) => {
  try {
    await axios.delete(
      `${BACKEND_API_URL}/notificationJobTag/delete/by-category-email/${userId}/${categoryID}/${email}`
    );
  } catch (error) {
    console.error(
      "Lỗi khi xóa notification tag theo category và email:",
      error
    );
  }
};
export const deleteNotificationTagByCategoryAndEmailAndTag = async (
  userId,
  categoryID,
  email,
  tagId
) => {
  try {
    await axios.delete(
      `${BACKEND_API_URL}/notificationJobTag/delete/by-category-email-tag/${userId}/${categoryID}/${email}/${tagId}`
    );
  } catch (error) {
    console.error(
      "Lỗi khi xóa notification tag theo category và email và tag:",
      error
    );
  }
};
export const GetTagByUserEmail = async (userId, email) => {
  try {
    const response = await axios.get(
      `${BACKEND_API_URL}/notificationJobTag/tagId/${userId}/${email}`
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi get user notification tag by email: ", error);
  }
};

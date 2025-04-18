import axios from "axios";

// Get the API URL from environment variables
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

/**
 * Fetch all messages for a user
 * @param {string} userId - The ID of the user to fetch messages for
 * @returns {Promise<Array>} - An array of messages
 */
export const fetchUserMessages = async (userId) => {
  try {
    // Get conversations to find all users this person is chatting with
    const conversationsResponse = await axios.get(
      `${BACKEND_API_URL}/api/Messages/conversations/${userId}`
    );
    
    const conversations = conversationsResponse.data;
    let allMessages = [];
    
    // For each conversation, fetch messages
    for (const conversation of conversations) {
      const otherUserId = conversation.userId;
      
      // Fetch messages between current user and the other user
      const messagesResponse = await axios.get(
        `${BACKEND_API_URL}/api/Messages/${userId}/${otherUserId}?pageNumber=1&pageSize=50`
      );
      
      // Add these messages to our collection
      if (messagesResponse.data && Array.isArray(messagesResponse.data)) {
        allMessages = [...allMessages, ...messagesResponse.data];
      }
    }
    
    return allMessages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

/**
 * Fetch total unread message count for a user
 * @param {string} userId - The ID of the user
 * @returns {Promise<number>} - The count of unread messages
 */
export const fetchUnreadMessagesCount = async (userId) => {
  try {
    const response = await axios.get(
      `${BACKEND_API_URL}/api/Messages/unread/${userId}`
    );
    return response.data.count;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return 0;
  }
};

/**
 * Send a message from one user to another
 * @param {Object} messageData - The message data containing senderId, receiverId, and content
 * @returns {Promise<Object>} - The sent message
 */
export const sendMessage = async (messageData) => {
  try {
    const response = await axios.post(
      `${BACKEND_API_URL}/api/Messages`, 
      messageData
    );
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

/**
 * Mark messages as read
 * @param {string} senderId - ID of the message sender
 * @param {string} receiverId - ID of the message receiver
 * @returns {Promise<void>}
 */
export const markMessagesAsRead = async (senderId, receiverId) => {
  try {
    await axios.put(
      `${BACKEND_API_URL}/api/Messages/read/${senderId}/${receiverId}`
    );
  } catch (error) {
    console.error("Error marking messages as read:", error);
    throw error;
  }
};
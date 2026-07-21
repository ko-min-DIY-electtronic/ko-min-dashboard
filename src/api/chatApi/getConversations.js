import axios from "../../axios";

export const getConversations = async (page = 1, limit = 10, search = "") => {
  try {
    let url = `/conversations?page=${page}&limit=${limit}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
};
export const markConversationAsRead = async (conversationId) => {
  try {
    const response = await axios.patch(`/conversations/${conversationId}/read`);
    return response.data;
  } catch (error) {
    console.error("Error marking conversation as read:", error);
    throw error;
  }
};

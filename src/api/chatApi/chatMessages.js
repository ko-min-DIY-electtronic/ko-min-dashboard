import axios from "../../axios";

export const getConversationMessages = async (
  conversationId,
  page = 1,
  limit = 50
) => {
  try {
    const response = await axios.get(
      `/conversations/${conversationId}/messages?page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching conversation messages:", error);
    throw error;
  }
};

export const sendMessage = async (conversationId, message) => {
  try {
    const formData = new FormData();
    formData.append("conversationId", conversationId);
    formData.append("message", message);

    const response = await axios.post(`/chat/message`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

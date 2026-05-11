import axios from "../../axios";
import { toast } from "sonner";

const getConversationsByUserId = async (userId) => {
  try {
    const response = await axios.get(`conversations?userId=${userId}`);

    if (response.data.success) {
      const conversations = response.data.data.conversations;

      if (conversations.length > 0) {
        return conversations[0]; // Return the first conversation
      } else {
        // No conversations found - return null to indicate new conversation needed
        return null;
      }
    } else {
      toast.error("Failed to retrieve conversations");
      return null;
    }
  } catch (error) {
    toast.error(
      `Failed to get conversation: ${error.response?.data?.message || error.message}`,
    );
    throw error;
  }
};

export default getConversationsByUserId;

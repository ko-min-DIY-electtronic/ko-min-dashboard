import axios from "../../axios";
import { toast } from "sonner";

const startNewConversation = async (userId, firstMessage = "Hello!") => {
  try {
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("message", firstMessage);

    const response = await axios.post("/chat/message", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data.success) {
      return response.data.data;
    } else {
      toast.error("Failed to start conversation");
      return null;
    }
  } catch (error) {
    toast.error(
      `Failed to start conversation: ${error.response?.data?.message || error.message}`,
    );
    throw error;
  }
};

export default startNewConversation;

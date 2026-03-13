import axios from "../../axios";
import { toast } from "sonner";

const updateUserBanStatus = async (userId, isBanned) => {
  console.log("Updating user ban status:", { userId, isBanned });
  
  const toastId = toast.loading("Updating user status...");
  try {
    const response = await axios.patch(`users/${userId}/ban-status`, { isBanned });
    toast.success(`User ${isBanned ? 'banned' : 'unbanned'} successfully!`, {
      id: toastId,
      autoClose: 500,
    });
    return response.data;
  } catch (error) {
    toast.error(`Failed to update user status: ${error.response?.data?.message || error.message}`, {
      id: toastId,
      autoClose: 500,
    });
    throw error;
  }
};

export default updateUserBanStatus;

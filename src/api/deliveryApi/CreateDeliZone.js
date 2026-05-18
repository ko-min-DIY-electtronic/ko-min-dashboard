import axios from "../../axios";
import { toast } from "sonner";

const createDeliZone = async (data) => {
  // console.log(data);
  const toastId = toast.loading("Creating deli zone...");
  try {
    const response = await axios.post(`delivery`, data);
    toast.success("Deli zone created successfully!", {
      id: toastId,
      autoClose: 500, // Auto-close the toast after 5 seconds
    });
    return response.data;
  } catch (error) {
    toast.error(`Failed to create deli zone: ${error.response.data.message}`, {
      id: toastId,
      autoClose: 500, // Auto-close the toast after 5 seconds
    });
  }
};

export default createDeliZone;

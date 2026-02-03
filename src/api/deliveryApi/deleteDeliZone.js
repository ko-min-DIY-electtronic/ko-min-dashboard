import axios from "../../axios";
import { toast } from "sonner";

const deleteDeliZone = async (id) => {
  console.log("Deleting delivery config:", id);
  const toastId = toast.loading("Deleting delivery configuration...");
  try {
    const response = await axios.delete(`api/v1/delivery/${id}`);
    toast.success("Delivery configuration deleted successfully!", {
      id: toastId,
      autoClose: 500,
    });
    return response.data;
  } catch (error) {
    toast.error(
      `Failed to delete delivery configuration: ${error.response?.data?.message || error.message}`,
      {
        id: toastId,
        autoClose: 500,
      },
    );
    throw error;
  }
};

export default deleteDeliZone;

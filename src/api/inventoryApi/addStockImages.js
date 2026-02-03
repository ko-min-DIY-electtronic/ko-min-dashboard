import axios from "../../axios";
import { toast } from "sonner";

const addStockImages = async (stockId, formData) => {
  const toastId = toast.loading("Adding images...");
  try {
    const response = await axios.post(`stocks/${stockId}/images`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    
    toast.success("Images added successfully!", {
      id: toastId,
      autoClose: 500, // Auto-close after 5 seconds
    });
    
    return response.data;
  } catch (error) {
    console.error("Error adding stock images:", error);
    toast.error(`Failed to add images: ${error.response?.data?.message || error.message}`, {
      id: toastId,
      autoClose: 500,
    });
    throw error;
  }
};

export default addStockImages;

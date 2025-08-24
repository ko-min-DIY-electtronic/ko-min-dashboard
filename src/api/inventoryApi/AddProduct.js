import axios from "../../axios";
import { toast } from "sonner";

const addProduct = async (data) => {
  const toastId = toast.loading("Adding product...");
  try {
    const response = await axios.post("stocks", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    if (response.status === 201) {
      toast.success("Product added successfully!", {
        id: toastId,
        autoClose: 500, // Auto-close the toast after 5 seconds
      });
    }
    return response.data;
  } catch (error) {
    toast.error(`Failed to add product: ${error.response.data.message}`, {
      id: toastId,
      autoClose: 500, // Auto-close the toast after 5 seconds
    });
  }
};

export default addProduct;

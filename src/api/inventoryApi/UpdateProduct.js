import axios from "../../axios";
import { toast } from "sonner";

const updateProduct = async ({ productId, data }) => {
  const toastId = toast.loading("Updating product...");
  try {
    const response = await axios.patch(`stocks/detail/${productId}`, data);
    if (response.status === 200) {
      toast.success("Product updated successfully!", {
        id: toastId,
        autoClose: 500, // Auto-close the toast after 5 seconds
      });
    }
    return response.data;
  } catch (error) {
    toast.error(`Failed to update product: ${error.response.data.message}`, {
      id: toastId,
      autoClose: 500, // Auto-close the toast after 5 seconds
    });
  }
};

export default updateProduct;

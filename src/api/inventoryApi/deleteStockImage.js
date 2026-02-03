import axios from "../../axios";
import { toast } from "sonner";

const deleteStockImage = async (stockId, spaceKey) => {
  try {
    const response = await axios.delete(`stocks/${stockId}/images`, {
      data: {
        spaceKey: spaceKey,
      },
    });
    return response.data;
  } catch (error) {
    toast.error("Failed to delete stock image");
    throw error;
  }
};

export default deleteStockImage;

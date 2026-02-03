import axios from "../../axios";
import { toast } from "sonner";

const getSalesReport = async (startDate, endDate) => {
  const toastId = toast.loading("Loading sales report...");
  try {
    const response = await axios.get(
      `report/sales?startDate=${startDate}&endDate=${endDate}`,
    );
    console.log("response", response);

    toast.success("Sales report loaded successfully!", {
      id: toastId,
      autoClose: 500,
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching sales report:", error);
    toast.error(
      `Failed to load sales report: ${error.response?.data?.message || error.message}`,
      {
        id: toastId,
        autoClose: 500,
      },
    );
    throw error;
  }
};

export default getSalesReport;

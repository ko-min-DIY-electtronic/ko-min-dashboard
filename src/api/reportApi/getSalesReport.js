import axios from "../../axios";
import { toast } from "sonner";

const getSalesReport = async (startDate, endDate, paymentMethod = "") => {
  const toastId = toast.loading("Loading sales report...");
  try {
    let url = `report/sales?status=confirmed`;
    const params = new URLSearchParams();
    if (startDate) {
      params.append("startDate", startDate);
    }
    if (endDate) {
      params.append("endDate", endDate);
    }
    if (paymentMethod) {
      params.append("paymentMethod", paymentMethod);
    }
    if (params.toString()) {
      url += `&${params.toString()}`;
    }

    const response = await axios.get(url);
    // console.log("response", response);

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

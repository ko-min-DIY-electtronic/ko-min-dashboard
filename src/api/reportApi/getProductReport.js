import axios from "../../axios";

const getProductReport = async (startDate, endDate) => {
  try {
    const response = await axios.get(`report/product?startDate=${startDate}&endDate=${endDate}&status=confirmed`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product report:", error);
    return error.response.data;
  }
};

export default getProductReport;

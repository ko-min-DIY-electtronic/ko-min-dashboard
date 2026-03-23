import axios from "../../axios";

const getAllOrders = async (startDate, endDate, status, paymentMethod) => {
  try {
    let url = `order`;
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    // if (status) params.append("status", status);
    if (paymentMethod) params.append("paymentMethod", paymentMethod);

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.log(error);
    return error.response.data;
  }
};

export default getAllOrders;

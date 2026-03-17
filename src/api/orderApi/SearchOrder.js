import axios from "../../axios";

const searchOrder = async (name) => {
  try {
    const response = await axios.get(`search/orders?query=${name}`);
    return response.data;
  } catch (error) {
    return error.response.data;
    console.log(error);
  }
};

export default searchOrder;

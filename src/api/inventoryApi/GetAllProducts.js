import axios from "../../axios";

const getAllProducts = async (category) => {
  try {
    const response = await axios.get(`stocks/categories?category=${category}`);
    return response.data;
  } catch (error) {
    console.log(error);
    return error.response.data;
  }
};

export default getAllProducts;

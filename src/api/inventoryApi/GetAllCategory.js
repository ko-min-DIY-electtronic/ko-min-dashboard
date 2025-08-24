import axios from "../../axios";

const getAllCategory = async () => {
  try {
    const response = await axios.get("stocks/overviews");
    return response.data;
  } catch (error) {
    console.log(error);
    return error.response.data;
  }
};

export default getAllCategory;

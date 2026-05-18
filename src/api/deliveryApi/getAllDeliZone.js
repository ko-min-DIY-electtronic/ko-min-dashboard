import axios from "../../axios";

const getAllDeliverZone = async () => {
  try {
    const response = await axios.get(`delivery`);

    return response.data;
  } catch (error) {
    // console.log(error);
    return error.response.data;
  }
};

export default getAllDeliverZone;

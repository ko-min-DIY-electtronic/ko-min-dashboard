import axios from "../../axios";

const getDeliverZone = async (id) => {
  try {
    const response = await axios.get(`delivery/${id}`);

    return response.data;
  } catch (error) {
    // console.log(error);
    return error.response.data;
  }
};

export default getDeliverZone;

import axios from "../../axios";

const deleteBanner = async (bannerId) => {
  try {
    const response = await axios.patch(`/banners/${bannerId}`);
    return response.data;
  } catch (error) {
    console.log(error);
    return error.response.data;
  }
};

export default deleteBanner;

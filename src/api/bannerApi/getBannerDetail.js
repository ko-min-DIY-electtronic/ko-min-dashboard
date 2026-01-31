import axios from "../../axios";

const getBannerDetail = async (bannerId) => {
  try {
    const response = await axios.get(`/banners/${bannerId}`);
    return response.data;
  } catch (error) {
    console.log(error);
    return error.response.data;
  }
};

export default getBannerDetail;

import axios from "../../axios";

export const switchesApi = {
  // Get all switches
  getSwitches: async () => {
    try {
      const response = await axios.get("switches");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update switch value
  updateSwitch: async (switchId, value) => {
    try {
      const response = await axios.patch(`switches/${switchId}`, {
        value,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

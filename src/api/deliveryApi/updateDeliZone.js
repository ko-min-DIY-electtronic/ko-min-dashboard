import axios from "../../axios";
import { toast } from "sonner";

const updateDeliZone = async (id, newData, originalData) => {
  console.log("Updating delivery config:", { id, newData, originalData });

  // Compare original and new data to find only changed fields
  const changedData = {};

  // Check each field and only include if it changed
  if (newData.city !== originalData.city) {
    changedData.city = newData.city;
  }

  if (newData.deliveryFee !== originalData.deliveryFee) {
    changedData.deliveryFee = newData.deliveryFee;
  }

  if (newData.additionalWeightCharge !== originalData.additionalWeightCharge) {
    changedData.additionalWeightCharge = newData.additionalWeightCharge;
  }

  if (newData.reachable !== originalData.reachable) {
    changedData.reachable = newData.reachable;
  }

  console.log("Changed fields only:", changedData);

  // If no changes, don't make API call
  if (Object.keys(changedData).length === 0) {
    toast.info("No changes detected");
    return { data: originalData };
  }

  const toastId = toast.loading("Updating delivery configuration...");
  try {
    const response = await axios.patch(`delivery/${id}`, changedData);
    toast.success("Delivery configuration updated successfully!", {
      id: toastId,
      autoClose: 500,
    });
    return response.data;
  } catch (error) {
    toast.error(
      `Failed to update delivery configuration: ${error.response?.data?.message || error.message}`,
      {
        id: toastId,
        autoClose: 500,
      },
    );
    throw error;
  }
};

export default updateDeliZone;

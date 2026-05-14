import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { switchesApi } from "../api/switchesApi/switchesApi";
import PaymentToggle from "../components/settings/PaymentToggle";
import kpay from "../assets/kpay.png";

const Settings = () => {
  const [switches, setSwitches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSwitches();
  }, []);

  const fetchSwitches = async () => {
    try {
      setLoading(true);
      const response = await switchesApi.getSwitches();
      if (response.status === "success") {
        setSwitches(response.data);
      }
    } catch (error) {
      console.error("Error fetching switches:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleChange = async (switchId, newValue) => {
    try {
      const response = await switchesApi.updateSwitch(switchId, newValue);
      if (response.status === "success") {
        // Update local state
        setSwitches((prevSwitches) =>
          prevSwitches.map((switch_) =>
            switch_._id === switchId
              ? { ...switch_, value: newValue }
              : switch_,
          ),
        );
        toast.success("Setting updated successfully");
      }
    } catch (error) {
      console.error("Error updating switch:", error);
      toast.error("Failed to update setting");
      // Revert the change on error
      fetchSwitches();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your application settings and preferences
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Payment Methods
        </h2>

        <div className="space-y-4">
          {switches
            .filter(
              (switch_) => switch_.name === "cod" || switch_.name === "kpay",
            )
            .map((switch_) => (
              <PaymentToggle
                key={switch_._id}
                switchData={switch_}
                onToggle={handleToggleChange}
                kpayImage={kpay}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;

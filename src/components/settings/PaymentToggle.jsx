import React from "react";
import { Switch } from "@mui/material";

const PaymentToggle = ({ switchData, onToggle, kpayImage }) => {
  const handleChange = (event) => {
    onToggle(switchData._id, event.target.checked);
  };

  const getDisplayName = (name) => {
    const nameMap = {
      cod: "Cash on Delivery",
      kpay: "KBZ Pay",
    };
    return nameMap[name] || name.toUpperCase();
  };

  const getIcon = (name) => {
    const iconMap = {
      cod: "💵",
      kpay: kpayImage || "📱",
    };
    return iconMap[name] || "💰";
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center space-x-3">
        {switchData.name === "kpay" && kpayImage ? (
          <img src={kpayImage} alt="KBZ Pay" className="w-8 h-8" />
        ) : (
          <span className="text-2xl">{getIcon(switchData.name)}</span>
        )}
        <div>
          <h3 className="font-medium text-gray-900">
            {getDisplayName(switchData.name)}
          </h3>
          <p className="text-sm text-gray-500 capitalize">{switchData.name}</p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <span
          className={`text-sm font-medium ${switchData.value ? "text-green-600" : "text-gray-400"}`}
        >
          {switchData.value ? "Enabled" : "Disabled"}
        </span>
        <Switch
          checked={switchData.value}
          onChange={handleChange}
          color="primary"
          size="medium"
        />
      </div>
    </div>
  );
};

export default PaymentToggle;

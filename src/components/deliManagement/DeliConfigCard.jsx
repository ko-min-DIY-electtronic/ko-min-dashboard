import React from "react";
import {
  Edit3,
  Trash2,
  MapPin,
  Truck,
  Weight,
  CheckCircle,
  XCircle,
} from "lucide-react";

export const DeliveryConfigCard = ({ config, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">{config.city}</h3>
            <p className="text-gray-600 font-medium">{config.township}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(config)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit configuration"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() =>
              config._id && onDelete(config._id, config.city, config.township)
            }
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete configuration"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-4">
        {/* Delivery Fee */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-1 bg-green-100 rounded">
              <Truck className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-sm font-semibold text-gray-700">
              Delivery Fee
            </span>
          </div>
          <span className="text-lg font-bold text-green-600">
            {config.deliveryFee} MMK
          </span>
        </div>

        {/* Additional Weight Charge */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-1 bg-orange-100 rounded">
              <Weight className="w-4 h-4 text-orange-600" />
            </div>
            <span className="text-sm font-semibold text-gray-700">
              Weight Charge
            </span>
          </div>
          <span className="text-lg font-bold text-orange-600">
            {config.additionalWeightCharge} MMK
          </span>
        </div>

        {/* Reachable Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div
              className={`p-1 rounded ${
                config.reachable ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {config.reachable ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
            </div>
            <span className="text-sm font-semibold text-gray-700">Status</span>
          </div>
          <span
            className={`text-sm font-bold px-3 py-1 rounded-full ${
              config.reachable
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {config.reachable ? "Reachable" : "Not Reachable"}
          </span>
        </div>
      </div>
    </div>
  );
};

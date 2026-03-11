import React, { useState } from "react";
import { createDeliveryConfig, createFormErrors } from "../../types/delivery";
import { Plus, Save, X } from "lucide-react";
import createDeliZone from "../../api/deliveryApi/CreateDeliZone";

export const DeliveryConfigForm = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing,
  refetch,
}) => {
  console.log(isEditing);
  const [formData, setFormData] = useState(() =>
    createDeliveryConfig(initialData),
  );

  const [errors, setErrors] = useState(createFormErrors());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = createFormErrors();

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (formData.deliveryFee < 0) {
      newErrors.deliveryFee = "Delivery fee must be 0 or greater";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).filter((key) => newErrors[key]).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // console.log(formData);
    const data = {
      city: formData.city,
      deliveryFee: formData.deliveryFee,
      additionalWeightCharge: formData.additionalWeightCharge,
      reachable: formData.reachable,
    };

    setIsSubmitting(true);

    if (isEditing) {
      // For editing, call the parent's onSubmit function
      await onSubmit(data);
    } else {
      // For creating new config, use createDeliZone API
      const response = await createDeliZone(data);
      if (response.status === "success") {
        onSubmit(response.data);
        setIsSubmitting(false);
        refetch();
      }
    }
    setIsSubmitting(false);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Plus className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-lg sm:text-2xl font-bold text-gray-800">
          {isEditing
            ? "Edit Delivery Configuration"
            : "Add New Delivery Configuration"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* City */}
          <div className="space-y-2">
            <label
              htmlFor="city"
              className="block text-sm font-semibold text-gray-700"
            >
              City *
            </label>
            <input
              type="text"
              id="city"
              value={formData.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.city
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              placeholder="Enter city name"
            />
            {errors.city && (
              <p className="text-sm text-red-600 font-medium">{errors.city}</p>
            )}
          </div>

          {/* Township */}
          <div className="space-y-2">
            <label
              htmlFor="township"
              className="block text-sm font-semibold text-gray-700"
            >
              Township (Read Only)
            </label>
            <input
              type="text"
              id="township"
              value={formData.township}
              readOnly
              className="w-full px-4 py-3 border rounded-lg font-medium bg-gray-100 text-gray-600 cursor-not-allowed"
              placeholder="Township will not be updated"
            />
            <p className="text-xs text-gray-500">
              Township cannot be modified during edit
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Delivery Fee */}
          <div className="space-y-2">
            <label
              htmlFor="deliveryFee"
              className="block text-sm font-semibold text-gray-700"
            >
              Delivery Fee *
            </label>
            <div className="relative flex items-center gap-2 border border-gray-300 rounded-lg ">
              <input
                type="number"
                id="deliveryFee"
                min="0"
                step="0.01"
                value={formData.deliveryFee}
                onChange={(e) =>
                  handleInputChange("deliveryFee", Number(e.target.value))
                }
                className={`w-full pl-8 pr-4 py-3 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.deliveryFee
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                placeholder="0.00"
              />
              <span className="left-3 top-3 text-gray-500 font-medium me-2">
                MMK
              </span>
            </div>
            {errors.deliveryFee && (
              <p className="text-sm text-red-600 font-medium">
                {errors.deliveryFee}
              </p>
            )}
          </div>

          {/* Additional Weight Charge */}
          <div className="space-y-2">
            <label
              htmlFor="additionalWeightCharge"
              className="block text-sm font-semibold text-gray-700"
            >
              Additional Weight Charge
            </label>
            <div className="relative flex items-center gap-2 border border-gray-300 rounded-lg ">
              <input
                type="number"
                id="additionalWeightCharge"
                min="0"
                step="0.01"
                value={formData.additionalWeightCharge}
                onChange={(e) =>
                  handleInputChange(
                    "additionalWeightCharge",
                    Number(e.target.value),
                  )
                }
                className="w-full pl-8 pr-4 py-3 font-medium transition-colors hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
              <span className="left-3 top-3 text-gray-500 font-medium me-2">
                MMK
              </span>
            </div>
          </div>
        </div>

        {/* Reachable Toggle */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">
            Delivery Status
          </label>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() =>
                handleInputChange("reachable", !formData.reachable)
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                formData.reachable ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.reachable ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium ${
                formData.reachable ? "text-green-600" : "text-gray-500"
              }`}
            >
              {formData.reachable ? "Reachable" : "Not Reachable"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? "Saving..." : isEditing ? "Update" : "Add"}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

import React from "react";
import { Plus, Trash2 } from "lucide-react";

export const ProductVariantManager = ({
  wholesalePrices,
  setWholesalePrices,
}) => {
  const addWholesalePrice = () => {
    setWholesalePrices((prev) => [
      ...prev,
      { id: Date.now(), qty: "", price: "" },
    ]);
  };

  const removeWholesalePrice = (id) => {
    if (wholesalePrices.length > 1) {
      setWholesalePrices((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleWholesaleChange = (id, field, value) => {
    setWholesalePrices((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900">
            Wholesale Price Tiers
          </h3>
          <p className="text-xs text-gray-500">
            Configure volume tier pricing for bulk orders
          </p>
        </div>
        <button
          type="button"
          onClick={addWholesalePrice}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          <Plus className="w-4 h-4" /> Add Tier
        </button>
      </div>

      <div className="space-y-3">
        {wholesalePrices.map((tier, idx) => (
          <div
            key={tier.id || idx}
            className="flex items-center gap-3 bg-gray-50/80 p-3 rounded-xl border border-gray-200"
          >
            <div className="flex-1">
              <label className="block text-[11px] text-gray-500 mb-1">
                Min Quantity
              </label>
              <input
                type="number"
                value={tier.qty}
                onChange={(e) =>
                  handleWholesaleChange(tier.id, "qty", e.target.value)
                }
                placeholder="e.g. 10"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[11px] text-gray-500 mb-1">
                Price per Unit
              </label>
              <input
                type="number"
                value={tier.price}
                onChange={(e) =>
                  handleWholesaleChange(tier.id, "price", e.target.value)
                }
                placeholder="0.00"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white"
              />
            </div>
            {wholesalePrices.length > 1 && (
              <button
                type="button"
                onClick={() => removeWholesalePrice(tier.id)}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg mt-4 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

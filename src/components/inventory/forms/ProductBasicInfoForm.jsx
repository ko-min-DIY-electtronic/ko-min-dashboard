import React from "react";
import { X } from "lucide-react";

export const ProductBasicInfoForm = ({
  formData,
  errors,
  categoryOptions,
  isCategoryDropdownOpen,
  setIsCategoryDropdownOpen,
  handleInputChange,
  handleBlur,
  setFormData,
  tagInput,
  setTagInput,
}) => {
  const handleTagAdd = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()],
        }));
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Title & Code */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="productName"
            value={formData.productName}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder="Enter product name"
            className={`w-full px-4 py-2.5 rounded-xl border ${
              errors.productName ? "border-red-500" : "border-gray-300"
            } focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm`}
          />
          {errors.productName && (
            <p className="text-red-500 text-xs mt-1">{errors.productName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="productCode"
            value={formData.productCode}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder="Enter product code / SKU"
            className={`w-full px-4 py-2.5 rounded-xl border ${
              errors.productCode ? "border-red-500" : "border-gray-300"
            } focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm`}
          />
          {errors.productCode && (
            <p className="text-red-500 text-xs mt-1">{errors.productCode}</p>
          )}
        </div>
      </div>

      {/* Category Dropdown */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category <span className="text-red-500">*</span>
        </label>
        <div
          onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
          className={`w-full px-4 py-2.5 rounded-xl border cursor-pointer flex justify-between items-center bg-white ${
            errors.productCategory ? "border-red-500" : "border-gray-300"
          } text-sm`}
        >
          <span className={formData.productCategory ? "text-gray-900" : "text-gray-400"}>
            {formData.productCategory || "Select Category"}
          </span>
          <span className="text-gray-400">▼</span>
        </div>

        {isCategoryDropdownOpen && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto py-1">
            {categoryOptions.map((cat, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setFormData((prev) => ({ ...prev, productCategory: cat }));
                  setIsCategoryDropdownOpen(false);
                }}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                {cat}
              </div>
            ))}
          </div>
        )}
        {errors.productCategory && (
          <p className="text-red-500 text-xs mt-1">{errors.productCategory}</p>
        )}
      </div>

      {/* Pricing & Stock Quantity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Retail Price <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="retailPrice"
            value={formData.retailPrice}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder="0.00"
            className={`w-full px-4 py-2.5 rounded-xl border ${
              errors.retailPrice ? "border-red-500" : "border-gray-300"
            } focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Quantity <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="totalQuantity"
            value={formData.totalQuantity}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder="0"
            className={`w-full px-4 py-2.5 rounded-xl border ${
              errors.totalQuantity ? "border-red-500" : "border-gray-300"
            } focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Weight (kg) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="weight"
            value={formData.weight}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder="e.g. 0.5"
            className={`w-full px-4 py-2.5 rounded-xl border ${
              errors.weight ? "border-red-500" : "border-gray-300"
            } focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm`}
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          rows={4}
          value={formData.description}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder="Product specifications, features, and detailed descriptions..."
          className={`w-full px-4 py-2.5 rounded-xl border ${
            errors.description ? "border-red-500" : "border-gray-300"
          } focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm`}
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags (Press Enter to add)
        </label>
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagAdd}
          placeholder="Type tag and press Enter"
          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
        />
        {formData.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.tags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

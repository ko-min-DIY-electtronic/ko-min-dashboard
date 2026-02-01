import { useEffect, useState } from "react";
import { X, Upload, Plus, Trash2 } from "lucide-react";
import addProduct from "../../api/inventoryApi/AddProduct";
import { useNavigate } from "react-router-dom";
import getAllCategory from "../../api/inventoryApi/GetAllCategory";

const ProductForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    productName: "",
    productCode: "",
    retailPrice: "",
    totalQuantity: "",
    weight: "",
    description: "",
    productType: "inStock",
    storeInventory: "sellProduct",
    productCategory: "",
  });

  const [errors, setErrors] = useState({});

  const [uploadedImages, setUploadedImages] = useState([]);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);

  const [wholesalePrices, setWholesalePrices] = useState([
    { id: 1, qty: "", price: "" },
  ]);

  const validateField = (name, value) => {
    const requiredFields = [
      "productName",
      "productCode",
      "retailPrice",
      "totalQuantity",
      "weight",
      "description",
      "productCategory",
    ];

    if (
      requiredFields.includes(name) &&
      (!value || value.toString().trim() === "")
    ) {
      return `${name
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())} is required`;
    }
    return "";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    if (error) {
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const getCategoryName = async () => {
    // setLoading(true);
    const response = await getAllCategory();
    if (response.success) {
      console.log(response.data);
      setCategoryOptions(
        response.data.items.map((category) => category.category),
      );
      // setCategory(response.data);
      // setLoading(false);
    } else if (response.success === false) {
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxImages = 3;

    if (uploadedImages.length + files.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images`);
      return;
    }

    files.forEach((file) => {
      if (file.size > 1 * 1024 * 1024) {
        // 10MB limit
        alert("File size must be less than 1MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImages((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            file: file,
            url: e.target.result,
            name: file.name,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (imageId) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    const requiredFields = [
      "productName",
      "productCode",
      "retailPrice",
      "totalQuantity",
      "weight",
      "description",
      "productCategory",
    ];

    requiredFields.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // console.log("Form submitted:", formData);

    const data = new FormData();
    data.append("name", formData.productName);
    data.append("productCode", formData.productCode);
    data.append("retailUnitPrice", formData.retailPrice);
    data.append("stockQuantity", formData.totalQuantity);
    data.append("unitWeight", formData.weight);
    data.append("description", formData.description);
    // data.append("productType", "regular");
    data.append("category", formData.productCategory);
    data.append(
      "onSale",
      formData.storeInventory === "sellProduct" ? true : false,
    );
    if (uploadedImages.length > 0) {
      uploadedImages.forEach((img) => {
        data.append("images", img.file);
      });
    }
    const validWholesalePrices = wholesalePrices.filter(
      (price) =>
        price.qty &&
        price.price &&
        price.qty.toString().trim() !== "" &&
        price.price.toString().trim() !== "",
    );
    console.log("validWholesalePrices", validWholesalePrices);
    validWholesalePrices.forEach((price, index) => {
      data.append(`wholeSale[${index}][wholeSaleQuantity]`, price.qty);
      data.append(`wholeSale[${index}][wholeSaleUnitPrice]`, price.price);
    });
    // console.log(data);

    const res = await addProduct(data);
    if (res.success) {
      navigate("/");
    }
  };

  const addWholesalePrice = () => {
    const newId = Math.max(...wholesalePrices.map((w) => w.id)) + 1;
    setWholesalePrices((prev) => [...prev, { id: newId, qty: "", price: "" }]);
  };

  const removeWholesalePrice = (id) => {
    if (wholesalePrices.length > 1) {
      setWholesalePrices((prev) => prev.filter((w) => w.id !== id));
    }
  };

  const handleWholesaleChange = (id, field, value) => {
    setWholesalePrices((prev) =>
      prev.map((w) => (w.id === id ? { ...w, [field]: value } : w)),
    );
  };

  const handleCategorySelect = (category) => {
    setFormData((prev) => ({
      ...prev,
      productCategory: category,
    }));
    setIsCategoryDropdownOpen(false);
  };

  const filteredCategories = categoryOptions.filter((category) =>
    category.toLowerCase().includes(formData.productCategory.toLowerCase()),
  );

  useEffect(() => {
    getCategoryName();
  }, []);

  return (
    <div className="mx-auto h-[calc(100vh-4px)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
        <h1 className="ml-8 lg:ml-0 text-xl font-semibold text-gray-900">
          Create New Product
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Product Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Information Section */}
            <div className="border border-gray-200 shadow-md p-4 rounded">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Product Information
              </h2>

              {/* Product Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="Enter Product Name"
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.productName ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.productName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.productName}
                  </p>
                )}
              </div>

              {/* Product Code and Retail Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Code
                  </label>
                  <input
                    type="text"
                    name="productCode"
                    value={formData.productCode}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Enter Product Code"
                    required
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.productCode ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.productCode && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.productCode}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Retail Price
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="retailPrice"
                      value={formData.retailPrice}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="Enter Retail Price"
                      required
                      className={`w-full px-3 py-2 pr-12 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.retailPrice
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    <span className="absolute right-3 top-2 text-sm text-gray-500">
                      MMK
                    </span>
                  </div>
                  {errors.retailPrice && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.retailPrice}
                    </p>
                  )}
                </div>
              </div>

              {/* Total Quantity and Weight */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Quantity
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="totalQuantity"
                      value={formData.totalQuantity}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="Enter Quantity"
                      required
                      className={`w-full px-3 py-2 pr-12 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.totalQuantity
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    <span className="absolute right-3 top-2 text-sm text-gray-500">
                      PCS
                    </span>
                  </div>
                  {errors.totalQuantity && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.totalQuantity}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="Enter Weight"
                      required
                      className={`w-full px-3 py-2 pr-12 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.weight ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    <span className="absolute right-3 top-2 text-sm text-gray-500">
                      KG
                    </span>
                  </div>
                  {errors.weight && (
                    <p className="mt-1 text-sm text-red-600">{errors.weight}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="Describe what this kind of product is"
                  rows={4}
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description}
                  </p>
                )}
              </div>
            </div>

            {/* Inventory Section */}
            <div className="border border-gray-200 shadow-md p-4 rounded">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Inventory
              </h2>

              <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
                {/* Product Type */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Product Type
                  </label>
                  <div className="flex gap-6">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="productType"
                        value="InStock"
                        checked
                        required
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        In Stock
                      </span>
                    </label>
                    {/* <label className="flex items-center">
                      <input
                        type="radio"
                        name="productType"
                        value="preOrder"
                        checked={formData.productType === "preOrder"}
                        onChange={handleInputChange}
                        required
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Pre Order
                      </span>
                    </label> */}
                  </div>
                </div>

                {/* Store in Inventory */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Store in Inventory
                  </label>
                  <div className="flex gap-6">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="storeInventory"
                        value="sellProduct"
                        checked={formData.storeInventory === "sellProduct"}
                        onChange={handleInputChange}
                        required
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Sell Product
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="storeInventory"
                        value="storeIn"
                        checked={formData.storeInventory === "storeIn"}
                        onChange={handleInputChange}
                        required
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Store In
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Product Category */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Category
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="productCategory"
                    value={formData.productCategory}
                    onChange={handleInputChange}
                    onFocus={() => setIsCategoryDropdownOpen(true)}
                    placeholder="Enter Product Category"
                    // required
                    className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.productCategory
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                    }
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {isCategoryDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredCategories.length > 0
                        ? filteredCategories.map((category, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleCategorySelect(category)}
                              className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                            >
                              {category}
                            </button>
                          ))
                        : null}
                    </div>
                  )}
                </div>
                {errors.productCategory && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.productCategory}
                  </p>
                )}
              </div>
            </div>

            {/* Wholesale Pricing Section */}
            <div className="border border-gray-200 shadow-md p-4 rounded">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  Wholesale Pricing
                </h2>
                <button
                  type="button"
                  onClick={addWholesalePrice}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-gray-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add <span className="hidden sm:inline">Wholesale Price</span>
                </button>
              </div>

              <div className="space-y-4">
                {wholesalePrices.map((wholesale, index) => (
                  <div
                    key={wholesale.id}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-200 rounded-lg relative"
                  >
                    {wholesalePrices.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeWholesalePrice(wholesale.id)}
                        className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Wholesale Qty - {index + 1}
                      </label>
                      <input
                        type="number"
                        value={wholesale.qty}
                        onChange={(e) =>
                          handleWholesaleChange(
                            wholesale.id,
                            "qty",
                            e.target.value,
                          )
                        }
                        placeholder="Eg - 10"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Wholesale Price - {index + 1}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={wholesale.price}
                          onChange={(e) =>
                            handleWholesaleChange(
                              wholesale.id,
                              "price",
                              e.target.value,
                            )
                          }
                          placeholder="Eg - 55000"
                          className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <span className="absolute right-3 top-2 text-sm text-gray-500">
                          MMK
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Product Images */}
          <div className="lg:col-span-1">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Product Images (Up to 3 Images)
              </h2>

              <div className="space-y-4">
                {/* Upload Area */}
                {uploadedImages.length < 3 ? (
                  <label className="block">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <Upload className="w-6 h-6 text-gray-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          Upload stock image
                        </p>
                        <p className="text-xs text-gray-500">
                          Please upload an image with file size less than 1mb.
                        </p>
                      </div>
                    </div>
                  </label>
                ) : null}

                {uploadedImages.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-700">
                      Uploaded Images:
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {uploadedImages.map((image) => (
                        <div
                          key={image.id}
                          className=" relative bg-red-500 md:h-64 lg:h-48"
                        >
                          <img
                            src={image.url || "/placeholder.svg"}
                            alt={image.name}
                            className="w-full h-full object-cover rounded"
                          />
                          {/* <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 truncate">
                              {image.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(image.file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div> */}
                          <button
                            type="button"
                            onClick={() => removeImage(image.id)}
                            className="p-1 text-red-500 bg-white hover:bg-red-200 hover:text-red-600 rounded absolute top-2 right-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            className="button bg-white border border-gray-200 hover:bg-gray-300 transition-all duration-300"
          >
            <span className="text-[14px]">Cancel</span>
          </button>
          <button
            type="submit"
            className="button bg-primary text-white hover:bg-primary/80 transition-all duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="16px"
              viewBox="0 -960 960 960"
              width="16px"
              fill="currentColor"
            >
              <path d="M640-640h120-120Zm-440 0h338-18 14-334Zm16-80h528l-34-40H250l-34 40Zm184 270 80-40 80 40v-190H400v190Zm182 330H200q-33 0-56.5-23.5T120-200v-499q0-14 4.5-27t13.5-24l50-61q11-14 27.5-21.5T250-840h460q18 0 34.5 7.5T772-811l50 61q9 11 13.5 24t4.5 27v196q-19-7-39-11t-41-4v-122H640v153q-35 20-61 49.5T538-371l-58-29-160 80v-320H200v440h334q8 23 20 43t28 37Zm138 0v-120H600v-80h120v-120h80v120h120v80H800v120h-80Z" />
            </svg>
            <span className="text-[14px]">Create Stock</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;

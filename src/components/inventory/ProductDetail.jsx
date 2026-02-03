import { useEffect, useState } from "react";
import { X, Upload, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import addProduct from "../../api/inventoryApi/AddProduct";
import { useNavigate } from "react-router-dom";
import getAllCategory from "../../api/inventoryApi/GetAllCategory";
import getAProducts from "../../api/inventoryApi/getAproduct";
import Loading from "../utli/Loading";
import { useParams } from "react-router-dom";
import { MdOutlineEdit } from "react-icons/md";
import deleteStock from "../../api/inventoryApi/DeleteStock";
import deleteStockImage from "../../api/inventoryApi/deleteStockImage";
import addStockImages from "../../api/inventoryApi/addStockImages";
import ConfirmModal from "../ui/ConfirmModal";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [porductId, setProductId] = useState(null);
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

  const [wholesalePrices, setWholesalePrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [isDeleteProductModalOpen, setIsDeleteProductModalOpen] =
    useState(false);
  const [newImages, setNewImages] = useState([]);
  const [isAddingImages, setIsAddingImages] = useState(false);

  const deleteProduct = async (productId) => {
    setIsDeleteProductModalOpen(true);
  };

  const confirmDeleteProduct = async () => {
    try {
      const response = await deleteStock(porductId);
      if (response.success) {
        toast.success("Product deleted successfully");
        navigate("/");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product. Please try again.");
    }
  };

  const deleteImage = async (image) => {
    setImageToDelete(image);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteImage = async () => {
    if (!imageToDelete) return;

    try {
      const response = await deleteStockImage(
        porductId,
        imageToDelete.spaceKey,
      );
      if (response.success) {
        // Update the uploadedImages state to remove the deleted image
        setUploadedImages((prev) =>
          prev.filter((img) => img._id !== imageToDelete._id),
        );
        toast.success("Image deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image. Please try again.");
    } finally {
      setImageToDelete(null);
    }
  };

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

  // const getCategoryName = async () => {
  //   // setLoading(true);
  //   const response = await getAllCategory();
  //   if (response.success) {
  //     console.log(response.data);
  //     setCategoryOptions(response.data.map((category) => category.category));
  //     // setCategory(response.data);
  //     // setLoading(false);
  //   } else if (response.success === false) {
  //   }
  // };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxImages = 3;

    if (uploadedImages.length + files.length > maxImages) {
      toast.error(`You can only upload up to ${maxImages} images`);
      return;
    }

    files.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        toast.error("File size must be less than 10MB");
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

  const handleNewImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxNewImages = 3 - uploadedImages.length;

    if (maxNewImages <= 0) {
      toast.error("Maximum number of images reached (3 images)");
      return;
    }

    if (files.length > maxNewImages) {
      toast.error(`You can only add up to ${maxNewImages} more images`);
      return;
    }

    files.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        toast.error("File size must be less than 10MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setNewImages((prev) => [
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

  const removeNewImage = (imageId) => {
    setNewImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const handleAddImages = async () => {
    if (newImages.length === 0) {
      toast.error("Please select images to add");
      return;
    }

    setIsAddingImages(true);
    const formData = new FormData();

    newImages.forEach((img) => {
      formData.append("images", img.file);
    });

    try {
      const response = await addStockImages(porductId, formData);
      if (response.success) {
        // Refresh product data to get updated images
        await getProduct();
        setNewImages([]);
        toast.success("Images added successfully!");
      }
    } catch (error) {
      console.error("Error adding images:", error);
    } finally {
      setIsAddingImages(false);
    }
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
    data.append("weight", formData.weight);
    data.append("description", formData.description);
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
    wholesalePrices.forEach((price, index) => {
      data.append(`wholeSale[${index}][wholeSaleQuantity]`, price.qty);
      data.append(`wholeSale[${index}][wholeSaleUnitPrice]`, price.price);
    });
    // console.log(data);
    const res = await addProduct(data);
    // console.log(res);
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

  const getProduct = async () => {
    setLoading(true);
    const response = await getAProducts(id);
    console.log(response);
    if (response.success) {
      // console.log(response.data);
      setFormData({
        productName: response.data.name,
        productCode: response.data.productCode,
        retailPrice: response.data.retailUnitPrice,
        totalQuantity: response.data.stockQuantity,
        unitWeight: response.data.unitWeight,
        description: response.data.description,
        productCategory: response.data.category,
        storeInventory: response.data.onSale,
        productType: response.data.saleType,
      });
      setWholesalePrices(response.data.wholeSale);
      setUploadedImages(response.data.images);
      setProductId(response.data._id);
      setLoading(false);
    } else if (response.success === false) {
      setLoading(false);
    }
  };
  // console.log(formData.productType);

  useEffect(() => {
    getProduct();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="mx-auto h-[calc(100vh-4px)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900">
          {formData.productName} Details
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
          <div className="lg:col-span-2 space-y-6 ">
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
                  readOnly
                  onBlur={handleBlur}
                  placeholder="Enter Product Name"
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none  ${
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
                    readOnly
                    onBlur={handleBlur}
                    placeholder="Enter Product Code"
                    required
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none  ${
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
                      readOnly
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="Enter Retail Price"
                      required
                      className={`w-full px-3 py-2 pr-12 border rounded-md focus:outline-none  ${
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
                      readOnly
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="Enter Quantity"
                      required
                      className={`w-full px-3 py-2 pr-12 border rounded-md focus:outline-none  ${
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
                      value={formData.unitWeight}
                      readOnly
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="Enter Weight"
                      required
                      className={`w-full px-3 py-2 pr-12 border rounded-md focus:outline-none  ${
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
                  readOnly
                  placeholder="Describe what this kind of product is"
                  rows={4}
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none  resize-none ${
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

              <div className="flex flex-col md:flex-row justify-between md:items-center">
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
                        value="inStock"
                        readOnly
                        checked={formData.productType === "regular"}
                        onChange={handleInputChange}
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
                        readOnly
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
                        readOnly
                        value="sellProduct"
                        checked={formData.storeInventory}
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
                        checked={!formData.storeInventory}
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
                    className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none  ${
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
              </div>

              <div className="space-y-4">
                {wholesalePrices.map((wholesale, index) => (
                  <div
                    key={wholesale._id}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-200 rounded-lg relative"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Wholesale Qty - {index + 1}
                      </label>
                      <input
                        type="number"
                        value={wholesale.wholeSaleQuantity}
                        readOnly
                        onChange={(e) =>
                          handleWholesaleChange(
                            wholesale.id,
                            "qty",
                            e.target.value,
                          )
                        }
                        placeholder="Eg - 10"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none "
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Wholesale Price - {index + 1}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={wholesale.wholeSaleUnitPrice}
                          readOnly
                          onChange={(e) =>
                            handleWholesaleChange(
                              wholesale.id,
                              "price",
                              e.target.value,
                            )
                          }
                          placeholder="Eg - 55000"
                          className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-md focus:outline-none"
                        />
                        <span className="absolute right-3 top-3 text-sm text-gray-500">
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
                {uploadedImages.length > 0 && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {uploadedImages.map((image) => (
                        <div
                          key={image._id}
                          className=" relative md:h-64 lg:h-48"
                        >
                          <img
                            src={image.url || "/placeholder.svg"}
                            alt={image.name}
                            className="w-full h-full object-cover rounded-xl"
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
                            onClick={() => deleteImage(image)}
                            className="p-1 text-red-500 bg-white hover:bg-red-200 hover:text-red-600 rounded absolute top-2 right-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add New Images Section */}
                {uploadedImages.length < 3 && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Add More Images ({uploadedImages.length}/3)
                    </h3>

                    {/* New Images Preview */}
                    {newImages.length > 0 && (
                      <div className="mb-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                          {newImages.map((image) => (
                            <div key={image.id} className="relative">
                              <img
                                src={image.url}
                                alt={image.name}
                                className="w-full h-20 object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => removeNewImage(image.id)}
                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Upload Controls */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleNewImageUpload}
                        className="hidden"
                        id="new-image-upload"
                      />
                      <label
                        htmlFor="new-image-upload"
                        className="flex-1 cursor-pointer bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 text-center transition-colors"
                      >
                        <Upload className="w-4 h-4 inline mr-2" />
                        Choose Images
                      </label>

                      {newImages.length > 0 && (
                        <button
                          type="button"
                          onClick={handleAddImages}
                          disabled={isAddingImages}
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
                        >
                          {isAddingImages
                            ? "Adding..."
                            : `Add ${newImages.length} Image${newImages.length > 1 ? "s" : ""}`}
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 mt-2">
                      Maximum 3 images total. Each image must be less than 10MB.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => deleteProduct(porductId)}
            type="button"
            className="button bg-danger text-red-500"
          >
            <span className="text-[14px]">Delete</span>
          </button>
          <button
            onClick={() => navigate(`/product-edit/${formData.productCode}`)}
            className="button bg-primary text-white"
          >
            <MdOutlineEdit className="w-4 h-4" />
            <span className="text-[14px]">Edit Product</span>
          </button>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setImageToDelete(null);
        }}
        onConfirm={confirmDeleteImage}
        title="Delete Image"
        message="Are you sure you want to delete this image? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Delete Product Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteProductModalOpen}
        onClose={() => setIsDeleteProductModalOpen(false)}
        onConfirm={confirmDeleteProduct}
        title="Delete Product"
        message={`Are you sure you want to delete "${formData.productName}"? This action cannot be undone and will permanently remove the product from inventory.`}
        confirmText="Delete Product"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default ProductDetail;

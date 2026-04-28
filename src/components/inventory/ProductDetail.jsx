import { useEffect, useState } from "react";
import { X, Upload, Trash2, ArrowBigLeftDashIcon, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import getAProducts from "../../api/inventoryApi/getAproduct";
import Loading from "../utli/Loading";
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
    tags: [],
    isDiscounted: false,
    discountPercentage: 0,
  });

  const [uploadedImages, setUploadedImages] = useState([]);
  const [wholesalePrices, setWholesalePrices] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [isDeleteProductModalOpen, setIsDeleteProductModalOpen] = useState(false);

  const [newImages, setNewImages] = useState([]);
  const [isAddingImages, setIsAddingImages] = useState(false);

  const deleteProduct = async () => {
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
      const response = await deleteStockImage(porductId, imageToDelete.spaceKey);
      if (response.success) {
        setUploadedImages((prev) =>
          prev.filter((img) => img._id !== imageToDelete._id)
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

  const getProduct = async () => {
    setLoading(true);
    const response = await getAProducts(id);
    if (response.success) {
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
        tags: response.data.tags || [],
        isDiscounted: response.data.isDiscounted || false,
        discountPercentage: response.data.discountPercentage || 0,
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
        <div className="flex items-center gap-2">
          <ArrowLeft className="w-6 h-6 cursor-pointer" onClick={() => navigate(-1)} />
          <h1 className="text-xl font-semibold text-gray-900">
            {formData.productName} Details
          </h1>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="p-6">
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
                  readOnly
                  placeholder="Enter Product Name"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none border-gray-300 bg-gray-50"
                />

                {/* Tags Display */}
                {formData.tags && formData.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-4 py-1.5 rounded-lg text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-100 shadow-sm hover:bg-blue-100 transition-colors"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>
                        {tag}
                      </span>
                    ))}
                  </div>
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
                    readOnly
                    placeholder="Enter Product Code"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none border-gray-300 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Retail Price {formData.isDiscounted && <span className="text-red-600 font-bold">({formData.discountPercentage}% OFF)</span>}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="retailPrice"
                      value={
                        formData.isDiscounted
                          ? `${(formData.retailPrice * (1 - formData.discountPercentage / 100)).toLocaleString()} MMK (Original: ${formData.retailPrice.toLocaleString()})`
                          : `${formData.retailPrice.toLocaleString()} MMK`
                      }
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none"
                    />
                  </div>
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
                      placeholder="Enter Quantity"
                      className="w-full px-3 py-2 pr-12 border rounded-md focus:outline-none border-gray-300 bg-gray-50"
                    />
                    <span className="absolute right-3 top-2 text-sm text-gray-500">
                      PCS
                    </span>
                  </div>
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
                      placeholder="Enter Weight"
                      className="w-full px-3 py-2 pr-12 border rounded-md focus:outline-none border-gray-300 bg-gray-50"
                    />
                    <span className="absolute right-3 top-2 text-sm text-gray-500">
                      KG
                    </span>
                  </div>
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
                  readOnly
                  placeholder="Describe what this kind of product is"
                  rows={4}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none resize-none border-gray-300 bg-gray-50"
                />
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
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        In Stock
                      </span>
                    </label>
                  </div>
                </div>

                {/* Store in Inventory */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Store in Inventory
                  </label>
                  <div className="flex gap-6">
                    {
                      formData.storeInventory ? (
                        <label className="flex items-center">

                          <input
                            type="radio"
                            name="storeInventory"
                            readOnly
                            value="sellProduct"
                            checked={formData.storeInventory}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Sell Product
                          </span>
                        </label>
                      ) :
                        (
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="storeInventory"
                              value="storeIn"
                              checked={!formData.storeInventory}
                              disabled
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              Store In
                            </span>
                          </label>
                        )
                    }
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
                    disabled
                    value={formData.productCategory}
                    onFocus={() => setIsCategoryDropdownOpen(true)}
                    placeholder="Enter Product Category"
                    className="w-full px-3 py-2 pr-10 border rounded-md focus:outline-none bg-gray-50"
                  />
                </div>

              </div>
            </div>

            {/* Wholesale Pricing Section */}
            {
              wholesalePrices.length > 0 ? (
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
                            placeholder="Eg - 10"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none bg-gray-50"
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
                              placeholder="Eg - 55000"
                              className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-md focus:outline-none bg-gray-50"
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
              ) : (
                <p className="text-center text-gray-500">
                  No wholesale prices available
                </p>
              )
            }
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
      </div>

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

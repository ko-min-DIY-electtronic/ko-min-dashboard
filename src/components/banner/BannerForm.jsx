import { useState } from "react";
import { X, Upload, Trash2 } from "lucide-react";
import ProductSelector from "./ProductSelector";
import createBanner from "../../api/bannerApi/createBanner";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const BannerForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventDate: "",
    eventTime: "",
  });

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateField = (name, value) => {
    const requiredFields = ["title", "description", "eventDate", "eventTime"];

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

  const handleProductSelect = (product) => {
    setSelectedProducts((prev) => {
      const exists = prev.find((p) => p._id === product._id);
      if (exists) {
        return prev.filter((p) => p._id !== product._id);
      } else {
        return [...prev, product];
      }
    });
    if (errors.product) {
      setErrors((prev) => ({
        ...prev,
        product: "",
      }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage({
        file: file,
        url: e.target.result,
        name: file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setUploadedImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const newErrors = {};
    const requiredFields = ["title", "description", "eventDate", "eventTime"];

    requiredFields.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    if (selectedProducts.length === 0) {
      newErrors.product = "Please select at least one product";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      selectedProducts.forEach((product, index) => {
        data.append(`stockIds[${index}]`, product._id);
      });
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("eventDate", formData.eventDate);
      data.append("eventTime", formData.eventTime);

      if (uploadedImage) {
        data.append("image", uploadedImage.file);
      }

      const response = await createBanner(data);

      if (response.status === "success") {
        toast.success("Banner created successfully!");
        navigate("/banners");
      } else {
        toast.error(response.message || "Failed to create banner");
      }
    } catch (error) {
      console.error("Error creating banner:", error);
      toast.error("An error occurred while creating the banner");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto h-[calc(100vh-4px)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900">
          Create New Banner
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
          {/* Left Column - Banner Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Banner Information Section */}
            <div className="border border-gray-200 shadow-md p-4 rounded">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Banner Information
              </h2>

              {/* Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="Enter banner title"
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
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
                  placeholder="Enter banner description"
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

            {/* Event Details Section */}
            <div className="border border-gray-200 shadow-md p-4 rounded">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Event Details
              </h2>

              {/* Event Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="eventDate"
                      value={formData.eventDate}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      required
                      className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.eventDate ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {/* <Calendar className="absolute right-3 top-2 w-4 h-4 text-gray-400" /> */}
                  </div>
                  {errors.eventDate && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.eventDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Time
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      name="eventTime"
                      value={formData.eventTime}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      required
                      className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.eventTime ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {/* <Clock className="absolute right-3 top-2 w-4 h-4 text-gray-400" /> */}
                  </div>
                  {errors.eventTime && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.eventTime}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Product Selection Section */}
            <div className="border border-gray-200 shadow-md p-4 rounded">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Featured Products
              </h2>
              <ProductSelector
                selectedProducts={selectedProducts}
                onProductSelect={handleProductSelect}
                error={errors.product}
              />
            </div>
          </div>

          {/* Right Column - Image Upload */}
          <div className="lg:col-span-1">
            <div className="border border-gray-200 shadow-md p-4 rounded">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Banner Image
              </h2>

              {/* Image Upload Area */}
              <div className="space-y-4">
                {!uploadedImage ? (
                  <label className="block">
                    <input
                      type="file"
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
                          Upload banner image
                        </p>
                        <p className="text-xs text-gray-500">
                          Please upload an image with file size less than 5MB.
                        </p>
                      </div>
                    </div>
                  </label>
                ) : (
                  <div className="relative">
                    <img
                      src={uploadedImage.url}
                      alt="Banner preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1 text-red-500 bg-white hover:bg-red-200 hover:text-red-600 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
            onClick={() => navigate(-1)}
            className="button bg-white border border-gray-200 hover:bg-gray-300 transition-all duration-300"
          >
            <span className="text-[14px]">Cancel</span>
          </button>
          <button
            type="submit"
            disabled={loading}
            className="button bg-primary text-white hover:bg-primary/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                <span className="text-[14px]">Creating...</span>
              </div>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="16px"
                  viewBox="0 -960 960 960"
                  width="16px"
                  fill="currentColor"
                >
                  <path d="M640-640h120-120Zm-440 0h338-18 14-334Zm16-80h528l-34-40H250l-34 40Zm184 270 80-40 80 40v-190H400v190Zm182 330H200q-33 0-56.5-23.5T120-200v-499q0-14 4.5-27t13.5-24l50-61q11-14 27.5-21.5T250-840h460q18 0 34.5 7.5T772-811l50 61q9 11 13.5 24t4.5 27v196q-19-7-39-11t-41-4v-122H640v153q-35 20-61 49.5T538-371l-58-29-160 80v-320H200v440h334q8 23 20 43t28 37Zm138 0v-120H600v-80h120v-120h80v120h120v80H800v120h-80Z" />
                </svg>
                <span className="text-[14px]">Create Banner</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BannerForm;

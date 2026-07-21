import React from "react";
import { Upload, X } from "lucide-react";

export const ProductImageUploader = ({
  uploadedImages,
  setUploadedImages,
  maxImages = 3,
}) => {
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    if (uploadedImages.length + files.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images`);
      return;
    }

    files.forEach((file) => {
      if (file.size > 1 * 1024 * 1024) {
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
            preview: e.target.result,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Product Images ({uploadedImages.length}/{maxImages})
        </label>
        <span className="text-xs text-gray-400">Max size 1MB each</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {uploadedImages.map((img) => (
          <div
            key={img.id}
            className="relative group aspect-square rounded-2xl overflow-hidden border border-gray-200 bg-gray-50"
          >
            <img
              src={img.preview || img.url}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => removeImage(img.id)}
              className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-90 group-hover:opacity-100 transition-opacity shadow-md"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {uploadedImages.length < maxImages && (
          <label className="border-2 border-dashed border-gray-300 hover:border-primary rounded-2xl p-4 aspect-square flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-blue-50/20">
            <Upload className="w-6 h-6 text-gray-400 mb-2" />
            <span className="text-xs text-gray-500 font-medium text-center">
              Upload Image
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>
  );
};

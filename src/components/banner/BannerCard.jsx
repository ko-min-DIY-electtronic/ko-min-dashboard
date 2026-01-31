import { useState } from "react";
import { EyeIcon, CalendarIcon, ClockIcon, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import deleteBanner from "../../api/bannerApi/deleteBanner";
import ConfirmModal from "../common/ConfirmModal";

const BannerCard = ({ banner, onBannerUpdate }) => {
  const [imageError, setImageError] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getImageUrl = () => {
    if (banner.useStockImage && banner.stockId?.images?.[0]?.url) {
      return banner.stockId.images[0].url;
    }
    return banner.image;
  };

  const imageUrl = getImageUrl();

  const handleDelete = async (e) => {
    e.stopPropagation(); // Prevent navigation to detail page
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    try {
      setDeleteLoading(true);
      const response = await deleteBanner(banner._id);

      if (response.status === "success") {
        toast.success("Banner deleted successfully");
        // Call the parent function to refresh the banner list
        if (onBannerUpdate) {
          onBannerUpdate();
        }
      } else {
        toast.error(response.message || "Failed to delete banner");
      }
    } catch (err) {
      console.error("Error deleting banner:", err);
      toast.error("An error occurred while deleting the banner");
    } finally {
      setDeleteLoading(false);
      setShowConfirmModal(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Image Section */}
      <div className="relative h-48 bg-gray-100">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl.url}
            alt={banner.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">📷</div>
              <p className="text-sm">No Image Available</p>
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              banner.softDeleted
                ? "bg-red-100 text-red-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {banner.softDeleted ? "Inactive" : "Active"}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {banner.title}
        </h3>

        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
          {banner.description}
        </p>

        {/* Product Info */}
        {banner.stockId && (
          <div className="mb-3 p-2 bg-gray-50 rounded">
            <p className="text-xs text-gray-500 mb-1">Featured Product:</p>
            <p className="text-sm font-medium text-gray-800">
              {banner.stockId.name}
            </p>
            <p className="text-xs text-gray-600">
              Code: {banner.stockId.productCode}
            </p>
          </div>
        )}

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <CalendarIcon className="w-4 h-4 mr-2" />
            <span>{formatDate(banner.eventDate)}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <ClockIcon className="w-4 h-4 mr-2" />
            <span>{banner.eventTime}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            Created: {formatDate(banner.createdAt)}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/banners/${banner._id}`)}
              className="flex items-center px-3 py-1 text-sm text-primary hover:text-primary-dark transition-colors"
            >
              <EyeIcon className="w-4 h-4 mr-1" />
              View Details
            </button>

            {!banner.softDeleted && (
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex items-center px-2 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete Banner"
              >
                {deleteLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmDelete}
        title="Delete Banner"
        message={`Are you sure you want to delete "${banner.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default BannerCard;

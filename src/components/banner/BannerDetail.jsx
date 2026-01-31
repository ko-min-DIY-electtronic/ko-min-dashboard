import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Package,
  Tag,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import getBannerDetail from "../../api/bannerApi/getBannerDetail";
import deleteBanner from "../../api/bannerApi/deleteBanner";

const BannerDetail = () => {
  const { bannerId } = useParams();
  const navigate = useNavigate();
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchBannerDetail = async () => {
      try {
        setLoading(true);
        const response = await getBannerDetail(bannerId);

        if (response.status === "success") {
          setBanner(response.data);
        } else {
          setError("Failed to fetch banner details");
        }
      } catch (err) {
        console.error("Error fetching banner detail:", err);
        setError("An error occurred while fetching banner details");
      } finally {
        setLoading(false);
      }
    };

    if (bannerId) {
      fetchBannerDetail();
    }
  }, [bannerId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US").format(price);
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this banner? This action cannot be undone.",
    );

    if (!confirmDelete) return;

    try {
      setDeleteLoading(true);
      const response = await deleteBanner(bannerId);

      if (response.status === "success") {
        alert("Banner deleted successfully");
        navigate("/banners");
      } else {
        alert(
          "Failed to delete banner: " + (response.message || "Unknown error"),
        );
      }
    } catch (err) {
      console.error("Error deleting banner:", err);
      alert("An error occurred while deleting the banner");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <button
            onClick={() => navigate("/banners")}
            className="button bg-primary text-white hover:bg-primary/80"
          >
            Back to Banners
          </button>
        </div>
      </div>
    );
  }

  if (!banner) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-500 mb-4">Banner not found</div>
          <button
            onClick={() => navigate("/banners")}
            className="button bg-primary text-white hover:bg-primary/80"
          >
            Back to Banners
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/banners")}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="header">Banner Details</h1>
            <p className="text-gray-600 mt-1">
              View banner information and associated products
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Banner Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Banner Image and Basic Info */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Banner Image */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Banner Image
                </h3>
                <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden">
                  {banner.image?.url ? (
                    <img
                      src={banner.image.url}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Banner Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Banner Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <p className="text-gray-900 font-medium">{banner.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <p className="text-gray-600">{banner.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Event Date
                      </label>
                      <p className="text-gray-900">
                        {formatDate(banner.eventDate)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Event Time
                      </label>
                      <p className="text-gray-900">{banner.eventTime}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Use Stock Image
                    </label>
                    <p className="text-gray-900">
                      {banner.useStockImage ? "Yes" : "No"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Associated Products */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              <Package className="w-5 h-5 inline mr-2" />
              Associated Products ({banner.stockIds?.length || 0})
            </h3>

            {banner.stockIds && banner.stockIds.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {banner.stockIds.map((stock) => (
                  <div
                    key={stock._id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {stock.images && stock.images.length > 0 ? (
                          <img
                            src={stock.images[0].url}
                            alt={stock.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {stock.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Code: {stock.productCode}
                        </p>

                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Retail Price:</span>
                            <span className="font-medium">
                              MMK {formatPrice(stock.retailUnitPrice)}
                            </span>
                          </div>

                          {stock.wholeSale && stock.wholeSale.length > 0 && (
                            <div className="text-sm">
                              <span className="text-gray-600">Wholesale:</span>
                              <div className="ml-4 mt-1">
                                {stock.wholeSale.map((ws, index) => (
                                  <div
                                    key={ws._id}
                                    className="text-xs text-gray-700"
                                  >
                                    {ws.wholeSaleQuantity}+ pcs: MMK{" "}
                                    {formatPrice(ws.wholeSaleUnitPrice)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Stock:</span>
                            <span className="font-medium">
                              {stock.stockQuantity} pcs
                            </span>
                          </div>

                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              <Tag className="w-3 h-3 inline mr-1" />
                              Category:
                            </span>
                            <span className="font-medium capitalize">
                              {stock.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  No products associated with this banner
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Additional Info */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Additional Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Banner ID
                </label>
                <p className="text-xs text-gray-600 font-mono bg-gray-50 p-2 rounded">
                  {banner._id}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Created Date
                </label>
                <p className="text-sm text-gray-900">
                  {formatDate(banner.createdAt)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <p className="text-sm">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      banner.softDeleted
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {banner.softDeleted ? "Deleted" : "Active"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerDetail;

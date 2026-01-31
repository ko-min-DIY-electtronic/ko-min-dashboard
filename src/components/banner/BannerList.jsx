import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";
import BannerCard from "./BannerCard";

const BannerList = ({ banners, loading, onBannerUpdate }) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"

  const totalPages = Math.ceil(banners.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBanners = banners.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="w-full mx-auto pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
            >
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="w-full mx-auto pt-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Banners Found
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first banner to get started.
          </p>
          <button
            onClick={() => navigate("/banners/create")}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/80 transition-colors"
          >
            Create Banner
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto pt-6">
      {/* View Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {banners.length} banner{banners.length !== 1 ? "s" : ""} found
          </span>
        </div>
      </div>

      {/* Banner Grid/List */}
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
        }
      >
        {currentBanners.map((banner, index) => (
          <BannerCard
            key={banner._id}
            banner={banner}
            index={startIndex + index}
            onBannerUpdate={onBannerUpdate}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">View</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="border border-gray-300 rounded px-1 lg:px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <span className="hidden lg:block text-sm text-gray-700">
              {startIndex + 1} - {Math.min(endIndex, banners.length)} of{" "}
              {banners.length} Banners
            </span>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="hidden lg:block">Previous</span>
                <span className="lg:hidden">
                  <MdArrowBackIosNew className="w-4 h-5" />
                </span>
              </button>

              <div className="flex space-x-1">
                {[...Array(Math.min(5, totalPages))].map((_, index) => {
                  const pageNum =
                    currentPage <= 3 ? index + 1 : currentPage - 2 + index;
                  if (pageNum > totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 text-sm border rounded ${
                        currentPage === pageNum
                          ? "bg-blue-500 text-white border-blue-500"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="hidden lg:block">Next</span>
                <span className="lg:hidden">
                  <MdArrowForwardIos />
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerList;

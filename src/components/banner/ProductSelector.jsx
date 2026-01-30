import { useState, useEffect } from "react";
import { Search, Package, Check, ChevronDown, X } from "lucide-react";
import getAllProducts from "../../api/inventoryApi/getAllProductsForSelect";

const ProductSelector = ({ selectedProducts, onProductSelect, error }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchAllProducts = async () => {
    setLoading(true);
    try {
      const response = await getAllProducts();
      if (response.success) {
        setAllProducts(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  // Filter products based on search query
  const filteredProducts = searchQuery.trim()
    ? allProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.productCode
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : allProducts; // Show all products when no search query

  const handleProductSelect = (product) => {
    onProductSelect(product);
    // Don't clear search query for multi-select
    setIsDropdownOpen(false);
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    setIsDropdownOpen(true);
  };

  const handleInputFocus = () => {
    setIsDropdownOpen(true);
  };

  const handleInputBlur = () => {
    // Delay closing to allow click on dropdown items
    setTimeout(() => setIsDropdownOpen(false), 200);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Featured Products
      </label>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder="Search products by name, code, or category..."
          className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            error ? "border-red-500" : "border-gray-300"
          }`}
        />

        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="absolute inset-y-0 right-0 flex items-center pr-3"
        >
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {loading && (
          <div className="absolute inset-y-0 right-0 pr-10 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {/* Selected Products Display */}
      {selectedProducts && selectedProducts.length > 0 && (
        <div className="mt-3 space-y-2">
          {selectedProducts.map((product) => (
            <div
              key={product._id}
              className="p-3 bg-green-50 border border-green-200 rounded-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-600">
                      Code: {product.productCode}
                    </p>
                    <p className="text-xs text-gray-500">
                      Price: {product.retailUnitPrice} MMK | Stock:{" "}
                      {product.stockQuantity}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onProductSelect(product)}
                  className="flex items-center text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dropdown */}
      {isDropdownOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <button
                key={product._id}
                type="button"
                onClick={() => handleProductSelect(product)}
                className="w-full px-4 py-3 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        Code: {product.productCode} | Category:{" "}
                        {product.category}
                      </p>
                      <p className="text-xs text-gray-500">
                        Price: {product.retailUnitPrice} MMK | Stock:{" "}
                        {product.stockQuantity}
                      </p>
                    </div>
                  </div>
                  {selectedProducts &&
                    selectedProducts.find((p) => p._id === product._id) && (
                      <Check className="w-4 h-4 text-green-600" />
                    )}
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-center text-gray-500">
              <Package className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No products found</p>
              <p className="text-xs">Try a different search term</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductSelector;

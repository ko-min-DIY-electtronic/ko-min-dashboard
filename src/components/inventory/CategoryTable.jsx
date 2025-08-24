import { EyeIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RiMoneyDollarCircleLine } from "react-icons/ri";

const CategoryTable = ({ category, loading }) => {
  console.log("category", category);

  const [selectedRows, setSelectedRows] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  // const role = JSON.parse(localStorage.getItem("uedc-user"))?.role;
  const navigate = useNavigate();
  const selectedCategory = "All";

  const handleRowSelect = (categoryId) => {
    const newSelectedRows = new Set(selectedRows);
    if (newSelectedRows.has(categoryId)) {
      newSelectedRows.delete(categoryId);
    } else {
      newSelectedRows.add(categoryId);
    }
    setSelectedRows(newSelectedRows);

    // Update select all state based on current selection
    setSelectAll(
      newSelectedRows.size === category.length && category.length > 0
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows(new Set());
      setSelectAll(false);
    } else {
      const allIds = new Set(category.map((item) => item.category));
      setSelectedRows(allIds);
      setSelectAll(true);
    }
  };

  const tabs = ["All Category"];

  const visibleTabs = tabs.slice(0, 6);

  return (
    <div className="w-full mx-auto pt-6">
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 rubik">
        {visibleTabs.map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors text-primary border-b-2 border-primary`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow overflow-y-auto w-[calc(100vw-70px)] lg:w-auto h-[calc(100vh-160px)]">
        <table className="w-full table-auto">
          <thead
            className="bg-gray-50 border-b border-gray-200"
            style={{ position: "sticky", top: 0 }}
          >
            <tr>
              <th className="px-4 py-4 text-left">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:none"
                />
              </th>
              <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-wider">
                No
              </th>
              <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                Total Products
              </th>
              <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                Stock Available
              </th>
              <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                Low Stock
              </th>
              <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                Out of Stock
              </th>
              <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          {loading ? (
            <tbody>
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  loading...
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {category.length > 0 &&
                category.map((product, index) => (
                  <tr
                    key={index}
                    className={
                      selectedRows.has(product.category) ? "bg-blue-50" : ""
                    }
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(product.category)}
                        onChange={() => handleRowSelect(product.category)}
                        className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:none"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.category}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.totalStockItems}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="piller bg-success text-successText">
                        <span>
                          {product.inStock}{" "}
                          {product.inStock > 1 ? "Products" : "Product"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="piller bg-warning text-warningText">
                          <span>
                            {product.lowStock}{" "}
                            {product.lowStock > 1 ? "Products" : "Product"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="piller bg-danger text-dangerText">
                        <span>
                          {product.outOfStock}{" "}
                          {product.outOfStock > 1 ? "Products" : "Product"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => getQuantityModal(product)}
                          className="button border border-primary text-primary hover:bg-primary hover:text-white"
                          title="Edit"
                        >
                          <RiMoneyDollarCircleLine className="w-4 h-4" />
                          <span>Edit Price</span>
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/all-products/${product.category}`)
                          }
                          className="button border border-primary text-primary hover:bg-primary hover:text-white"
                          title="View Stock"
                        >
                          <EyeIcon className="w-4 h-4" />
                          <span>View</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              {category.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No category found
                  </td>
                </tr>
              )}
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
};

export default CategoryTable;

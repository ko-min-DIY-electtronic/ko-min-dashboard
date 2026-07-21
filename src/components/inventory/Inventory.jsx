import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CategoryTable from "./CategoryTable";
import getAllCategory from "../../api/inventoryApi/GetAllCategory";
import BulkPriceModel from "./BulkPriceModel";

function Inventory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [bulkPriceModalOpen, setIsBulkPriceModalOpen] = useState(false);
  const [category, setCategory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const getCategory = async () => {
    setLoading(true);
    try {
      const response = await getAllCategory();
      if (response.success) {
        setCategory(response.data.items || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCategory();
  }, []);

  const getBulkPriceModal = async (stockIds) => {
    setSelectedId(stockIds);
    setIsBulkPriceModalOpen(true);
  };

  const filteredCategory = category.filter((item) =>
    item.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-50px)] overflow-y-auto w-full px-4 custom-scrollbar">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
        <h1 className="header ml-8 lg:ml-0">Inventory</h1>
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
          />
        </div>
      </div>
      <CategoryTable
        category={filteredCategory}
        loading={loading}
        sentBulkPriceModal={getBulkPriceModal}
      />

      <BulkPriceModel
        isOpen={bulkPriceModalOpen}
        stockIds={selectedId}
        onClose={() => {
          setIsBulkPriceModalOpen(false);
          getCategory();
        }}
        cancel={() => {
          setIsBulkPriceModalOpen(false);
        }}
      />
    </div>
  );
}

export default Inventory;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CategoryTable from "./CategoryTable";
import getAllCategory from "../../api/inventoryApi/GetAllCategory";
import BulkPriceModel from "./BulkPriceModel";

function Inventory() {
  const navigate = useNavigate();
  // const role = JSON.parse(localStorage.getItem("uedc-user"))?.role;
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [bulkPriceModalOpen, setIsBulkPriceModalOpen] = useState(false);
  const [category, setCategory] = useState([]);
  const getCategory = async () => {
    // console.log("getCategory");
    setLoading(true);
    const response = await getAllCategory();
    // console.log("response", response);
    if (response.success) {
      setCategory(response.data.items);
      setLoading(false);
    } else if (response.success === false) {
      setLoading(false);
    }
  };

  // console.log("category", category);

  useEffect(() => {
    getCategory();
  }, []);

  const getBulkPriceModal = async (stockIds) => {
    // console.log("stockIds", stockIds);
    setSelectedId(stockIds);
    setIsBulkPriceModalOpen(true);
  };

  return (
    <div className="w-full px-4">
      <div className="flex flex-col lg:flex-row items-center justify-between ">
        <h1 className="header ml-8 lg:ml-0">Inventory</h1>
      </div>
      <CategoryTable
        category={category}
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

import { useEffect, useState } from "react";
import SearchBar from "../utli/SearchBar";
import ProductTable from "./productTable";
import getAllProducts from "../../api/inventoryApi/GetAllProducts";
import QuantityModal from "./QuantityModal";
import { useNavigate } from "react-router-dom";
import searchProduct from "../../api/inventoryApi/SearchProduct";
import CategoryTable from "./CategoryTable";
import getAllCategory from "../../api/inventoryApi/GetAllCategory";
import { IoIosArrowForward } from "react-icons/io";
import { useParams } from "react-router-dom";

function GetAllProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const role = JSON.parse(localStorage.getItem("uedc-user"))?.role;
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantityModalOpen, setIsQuantityModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const getProducts = async () => {
    setLoading(true);
    const response = await getAllProducts(id);
    // console.log("response", response);
    if (response.status === "success") {
      setProducts(response.data);
      setLoading(false);
    } else if (response.status === "error") {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <div className="w-full px-4">
      <div className="flex flex-col lg:flex-row items-center justify-between ">
        <h1 className="header ml-8 lg:ml-0 flex items-center gap-2 cursor-pointer">
          <span onClick={() => navigate("/")}>Inventory</span>{" "}
          <IoIosArrowForward /> <span> {id} </span>
        </h1>
        {/* <div className="flex items-center gap-10">
          <div className="w-[400px]">
            <SearchBar
              onSearch={(name) => (!name ? getProducts() : null)}
              placeholder="Search Product with name or Product Code"
              // onClick={searchFunction}
            />
          </div>
        </div> */}
      </div>

      <ProductTable
        products={products}
        loading={loading}
        // sentQuantityModal={getQuantityModal}
      />

      {/* Quantity Modal */}
      {/* <QuantityModal
        isOpen={quantityModalOpen}
        product={selectedProduct}
        onClose={() => {
          setIsQuantityModalOpen(false);
          getProducts();
        }}
      /> */}
    </div>
  );
}

export default GetAllProduct;

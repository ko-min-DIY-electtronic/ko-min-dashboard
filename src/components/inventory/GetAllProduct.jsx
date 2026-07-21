import { useEffect, useState } from "react";
import ProductTable from "./productTable";
import getAllProducts from "../../api/inventoryApi/GetAllProducts";
import QuantityModal from "./QuantityModal";
import { useNavigate } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import { useParams } from "react-router-dom";

function GetAllProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  // const role = JSON.parse(localStorage.getItem("uedc-user"))?.role;
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantityModalOpen, setIsQuantityModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const getProducts = async () => {
    setLoading(true);
    const response = await getAllProducts(id);
    // console.log("response", response);
    if (response.success) {
      const filterDelete = response.data.filter(
        (product) => product.isDeleted === false,
      );
      setProducts(filterDelete);
      setLoading(false);
    } else if (response.success === false) {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  const getQuantityModal = async (product) => {
    // console.log("product", product);
    setSelectedProduct(product);
    setIsQuantityModalOpen(true);
  };

  return (
    <div className="h-[calc(100vh-40px)] overflow-y-auto w-full px-4 custom-scrollbar">
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
        sentQuantityModal={getQuantityModal}
        refresh={getProducts}
      />

      {/* Quantity Modal */}
      <QuantityModal
        isOpen={quantityModalOpen}
        product={selectedProduct}
        onClose={() => {
          setIsQuantityModalOpen(false);
          getProducts();
        }}
        cancel={() => {
          setIsQuantityModalOpen(false);
        }}
      />
    </div>
  );
}

export default GetAllProduct;

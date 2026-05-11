import { Route, Routes } from "react-router-dom";
import Navbar from "../components/Navbar";
import Inventory from "../components/inventory/Inventory";
import AddProduct from "../components/inventory/AddProduct";
import GetAllProduct from "../components/inventory/GetAllProduct";
import ProductDetail from "../components/inventory/ProductDetail";
import ProductEdit from "../components/inventory/ProductEdit";
import GetAllOrder from "../components/orderManagement/GetAllOrder";
import OrderDetail from "../components/orderManagement/OrderDetail";
import OrderDetails from "../components/orderManagement/OrderDetail";
import { DeliveryConfigManager } from "../components/deliManagement/DeliConfigManager";
import SalesReport from "./SalesReport";
import UserManagement from "./UserManagement";
import UserDetail from "./UserDetail";
import Accounts from "../components/accounts/Accounts";
import Banner from "../components/banner/Banner";
import BannerDetail from "../components/banner/BannerDetail";
import CreateBanner from "../components/banner/CreateBanner";
import Chat from "./Chat";
import ChatDetailPage from "./ChatDetail";
function Home() {
  return (
    <>
      <div className="flex bg-gray-50 min-h-screen">
        <Navbar />
        <div className="flex-1 ml-0 lg:ml-16 pt-20 lg:pt-4 px-4 pb-4">
          <Routes>
            <Route path="/" element={<Inventory />} />
            <Route path="/add-product" element={<AddProduct />} />
            <Route path="/all-products/:id" element={<GetAllProduct />} />
            <Route path="/product-detail/:id" element={<ProductDetail />} />
            <Route path="/product-edit/:id" element={<ProductEdit />} />
            <Route path="/orders" element={<GetAllOrder />} />
            <Route path="/order/:id" element={<OrderDetails />} />
            <Route path="/delivery" element={<DeliveryConfigManager />} />
            <Route path="/sales-report" element={<SalesReport />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/user/:id" element={<UserDetail />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/banners" element={<Banner />} />
            <Route path="/banners/:bannerId" element={<BannerDetail />} />
            <Route path="/banners/create" element={<CreateBanner />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/chat/:id" element={<ChatDetailPage />} />
            <Route path="/chat/user/:userId" element={<ChatDetailPage />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

export default Home;

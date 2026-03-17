import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import getAllOrders from "../../api/orderApi/getAllOrders";
import OrderTable from "./OrderTable";
import OrderInfo from "./OrderInfo";
import { DateRangePicker } from "../utli/DateRangePicker";
import { MdRefresh } from "react-icons/md";
// import io from "socket.io-client";
import SearchBar from "../utli/SearchBar";
import searchOrder from "../../api/orderApi/SearchOrder";
import { startOfDay, endOfDay } from "date-fns";
import Loading from "../utli/Loading";
// const socket = io.connect(import.meta.env.VITE_APP_API, {
//   transports: ["websocket"],
//   secure: true,
// });

function GetAllOrder() {
  // Initialize dates to today
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [paymentMethod, setPaymentMethod] = useState("");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState("confirmed");
  const [activePage, setActivePage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleDateRangeChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  };

  const formatDateForAPI = (date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getOrders = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const startDateStr = formatDateForAPI(startDate);
      const endDateStr = formatDateForAPI(endDate);
      
      const response = await getAllOrders(startDateStr, endDateStr, activeTab, paymentMethod);
      if (response.success) {
        setOrders(response.data.orders);
      } else if (response.success === false) {
        navigate("/unauthorized");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
        setRefreshing(false);
      }, 500);
    }
  };

  // console.log("orders", orders);

  const passOrder = (orderId) => {
    if (selectedOrder === orderId) {
      setSelectedOrder(null);
    } else {
      setSelectedOrder(orderId);
    }
  };

  const passTab = (tab) => {
    if (tab === "Pending Orders") {
      setActiveTab("pending");
    } else if (tab === "Confirm Orders") {
      setActiveTab("confirmed");
    } else if (tab === "Cancel Orders") {
      setActiveTab("cancelled");
    }
  };

  const passPage = (page) => {
    setActivePage(page);
  };

  const searchFunction = (name) => {
    setSearchTerm(name);
  };

  const filteredOrders = orders.filter((order) => {
    const customerName = order?.userId?.userName || "";
    return customerName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  useEffect(() => {
    getOrders();
  }, [activeTab, startDate, endDate, paymentMethod]);

  // useEffect(() => {
  //   // Connection established
  //   socket.on("connect", () => {
  //     console.log("Connected to socket.io server");
  //   });

  //   socket.on("orderStatusUpdated", (data) => {
  //     // console.log("data", data);
  //     if (activeTab === "pending") {
  //       const handleRemove = (value) => {
  //         setOrders((prev) => prev.filter((item) => item._id !== value));
  //       };
  //       handleRemove(data.orderId);
  //     }
  //   });

  //   socket.on("orderSoftDeleted", (data) => {
  //     // console.log("data", data);
  //     if (activeTab === "cancelled") {
  //       const handleRemove = (value) => {
  //         setOrders((prev) => prev.filter((item) => item._id !== value));
  //       };
  //       handleRemove(data.orderId);
  //     }
  //   });

  //   // Cleanup
  //   return () => {
  //     socket.off("orderStatusUpdated");
  //     socket.off("orderSoftDeleted");
  //   };
  // }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="px-4">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-4">
        <h1 className="header ml-8 lg:ml-0">Order Management</h1>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <SearchBar
            onSearch={(name) => searchFunction(name)}
            placeholder="Search Customer Name"
            onClick={searchFunction}
          />
          
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={handleDateRangeChange}
          />

          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-10 bg-white"
          >
            <option value="">All Payments</option>
            <option value="k-pay">K-Pay</option>
            <option value="cash-on-delivery">Cash on Delivery</option>
          </select>

          <button
            onClick={() => getOrders(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 h-10"
          >
            <MdRefresh
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "..." : "Refresh"}
          </button>
        </div>
      </div>


      <div className="flex">
        <div
          className={`transition-all duration-300 ${
            selectedOrder ? "w-2/3" : "w-full"
          }`}
        >
          <OrderTable
            orders={filteredOrders}
            passOrder={passOrder}
            activeOrder={selectedOrder}
            passTab={passTab}
            loading={loading}
            passPage={passPage}
            refreshOrders={() => {
              getOrders();
              setSelectedOrder(null);
            }}
          />
        </div>

        {/* <div
          className={`transition-all duration-300 ${
            selectedOrder ? "w-1/3" : "w-0"
          }`}
        >
          {selectedOrder && (
            <OrderInfo
              selectedOrder={selectedOrder}
              refreshOrders={() => {
                getOrders();
                setSelectedOrder(null);
              }}
              handleClose={() => setSelectedOrder(null)}
            />
          )}
        </div> */}
      </div>
    </div>
  );
}

export default GetAllOrder;

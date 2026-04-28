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
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState("");
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
      setLoading(false);
      setRefreshing(false);
      setIsInitialLoad(false);
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

  if (isInitialLoad && loading) {
    return <Loading />;
  }

  return (
    <div className="px-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
        <h1 className="header ml-8 lg:ml-0 w-full lg:w-auto text-left">Order Management</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row items-stretch lg:items-center gap-3 w-full lg:w-auto">
          <div className="w-full lg:w-auto">
            <SearchBar
              onSearch={(name) => searchFunction(name)}
              placeholder="Search Customer Name"
              onClick={searchFunction}
            />
          </div>



          <div className="w-full lg:w-auto grid grid-cols-2 gap-3">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full lg:w-36 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-10 bg-white capitalize"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="on-delivery">On Delivery</option>
              <option value="success">Success</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full lg:w-40 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-10 bg-white"
            >
              <option value="">All Payments</option>
              <option value="k-pay">K-Pay</option>
              <option value="cash-on-delivery">Cash on Delivery</option>
            </select>
          </div>
          <div className="w-full lg:w-auto flex gap-2">
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onChange={handleDateRangeChange}
            />
          </div>

          <button
            onClick={() => getOrders(true)}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 h-10"
          >
            <MdRefresh
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "..." : "Refresh"}
          </button>

        </div>
      </div>


      <div className="flex relative w-full overflow-hidden">
        <div
          className={`transition-all duration-300 w-full ${selectedOrder ? "lg:w-2/3" : "lg:w-full"
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

        {/* Desktop Sidebar */}
        <div
          className={`hidden lg:block transition-all duration-300 ${selectedOrder ? "w-1/3" : "w-0 overflow-hidden"
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
        </div>

        {/* Mobile Off-canvas Sidebar */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
            <div
              className="absolute inset-0 bg-black/50 transition-opacity"
              onClick={() => setSelectedOrder(null)}
            ></div>
            <div className="relative w-[90%] max-w-sm bg-white h-full shadow-xl overflow-y-auto">
              <OrderInfo
                selectedOrder={selectedOrder}
                refreshOrders={() => {
                  getOrders();
                  setSelectedOrder(null);
                }}
                handleClose={() => setSelectedOrder(null)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GetAllOrder;

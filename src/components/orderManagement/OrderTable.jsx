import { useEffect, useState } from "react";
import { generatePDF } from "./PdfGenerator";
import { Printer, Download, Eye, Trash2 } from "lucide-react";
import getAOrder from "../../api/orderApi/getAOrder";
import { useNavigate } from "react-router-dom";
import chgOrderStatus from "../../api/orderApi/chgOrderStatus";
import deleteOrder from "../../api/orderApi/DeleteOrder";
import { startOfDay, endOfDay } from "date-fns";
import { format } from "date-fns";
import { DateRange } from "react-date-range";
import { FaCalendarAlt } from "react-icons/fa";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
// import DeleteConfirmationModal from "../accounts/DeleteModal";

const OrderTable = ({
  orders,
  passOrder,
  activeOrder,
  refreshOrders,
  passTab,
  loading,
}) => {
  // const role = JSON.parse(localStorage.getItem("uedc-user"))?.role;
  const today = new Date();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Pending Orders");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deleteModal, setDeleteModal] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [deleteOrderId, setDeleteOrderId] = useState(null);

  const tabs = ["Pending Orders", "Confirm Orders", "Cancel Orders"];

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(
    sessionStorage.getItem("startDate") || startOfDay(today),
  );
  const [endDate, setEndDate] = useState(
    sessionStorage.getItem("endDate") || endOfDay(today),
  );

  const handleDateRangeChange = (ranges) => {
    setDateRange([
      {
        ...ranges.selection,
        startDate: startOfDay(ranges.selection.startDate),
        endDate: endOfDay(ranges.selection.endDate),
      },
    ]);
  };
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      key: "selection",
    },
  ]);

  // const totalPages = Math.ceil(orders.length / itemsPerPage);
  // const startIndex = (currentPage - 1) * itemsPerPage;
  // const endIndex = startIndex + itemsPerPage;
  // const currentOrders = orders.slice(startIndex, endIndex);

  const handleView = (id) => {
    navigate(`/order/${id}`);
    // console.log("Edit product:", id);
  };

  const handleDelete = async (orderId) => {
    const res = await deleteOrder(orderId);

    if (res.code === 200) {
      refreshOrders();
      setDeleteModal(false);
    }
  };

  return (
    <div className="w-full mx-auto pt-6">
      {/* Tabs */}
      {/* <div className="flex mb-10 justify-between flex-wrap gap-1">
        <div>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                passTab(tab);
              }}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors rubik ${
                activeTab === tab
                  ? "  text-primary border-b-2 border-primary"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setShowDatePicker(!showDatePicker);
            // console.log(showDatePicker);
          }}
          className="button text-white bg-primary border border-primary transition-all duration-300 w-auto"
        >
          <FaCalendarAlt className="text-color" />
          {format(startDate, "MMMM d,yyyy") == format(endDate, "MMMM d,yyyy")
            ? format(startDate, "dd-MM-yyyy")
            : `${format(startDate, "dd-MM-yyyy")} - ${format(
                endDate,
                "dd-MM-yyyy"
              )}`}
        </button>
      </div> */}

      {showDatePicker && (
        <div className="mb-4 bg-white rounded-lg shadow-md absolute right-0 z-10">
          <DateRange
            editableDateInputs={true}
            onChange={handleDateRangeChange}
            moveRangeOnFirstSelection={false}
            ranges={dateRange}
            className="p-4"
          />
          <div className="flex items-center justify-end gap-2 p-4">
            <button
              className="flex items-center w-24 justify-center py-3 button-color text-color  rounded-xl"
              onClick={() => {
                setShowDatePicker(false);
                setDateRange([
                  {
                    ...dateRange[0],
                    startDate: startOfDay(startDate),
                    endDate: endOfDay(endDate),
                  },
                ]);
              }}
            >
              Cancel
            </button>

            <button
              className="flex items-center w-24 justify-center py-3 bg-primary text-white rounded-xl"
              onClick={() => ApplyDate()}
            >
              <p>OK</p>
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="w-[calc(100vw-70px)] lg:w-auto overflow-x-auto bg-white rounded-lg shadow overflow-y-auto h-[calc(100vh-100px)]">
        <table className="w-full table-auto">
          <thead
            className="bg-gray-50 border-b border-gray-200"
            style={{ position: "sticky", top: 0 }}
          >
            <tr>
              <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-wider">
                No
              </th>
              <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                Customer
              </th>
              <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                Address
              </th>
              <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                Township
              </th>
              {/* <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                Qty
              </th> */}
              <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                Total
              </th>
              <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          {loading ? (
            <tbody>
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  loading...
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order, index) => (
                  <tr
                    key={order._id}
                    className={`${activeOrder === order._id ? "bg-primary/10" : ""
                      }`}
                  >
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order?.userId?.userName}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order?.address}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span>{order?.delivery?.township}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span>{order?.totalAmount?.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span>{order?.status}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => navigate(`/order/${order._id}`)}
                        className="button border border-primary text-primary"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          )}
        </table>
      </div>

      {/* Pagination */}
      {/* <div className="flex items-center justify-between mt-6">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">View</span>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-700">
            {startIndex + 1} - {Math.min(endIndex, orders.length)} of{" "}
            {orders.length} Orders
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
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
              Next
            </button>
          </div>
        </div>
      </div> */}

      {deleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black opacity-50"
          // onClick={onClose}
          ></div>
          <div className="h-screen flex justify-center items-center z-100">
            <div className="bg-white p-6 rounded-lg w-[500px] absolute z-100 opacity-100">
              <div className="text-red-600 font-bold text-sm uppercase mb-2">
                Danger Zone
              </div>
              <h2 className="text-2xl font-bold mb-4">Deleting is permanent</h2>
              <p className="text-gray-700 mb-4">
                Deleting the order will permanently erase all associated data
                from the Inventory.
              </p>
              <p className="text-gray-700 mb-6">
                To confirm this action, please type the order name{" "}
                <span className="font-bold text-red-600">
                  {selectedOrder?.snapshotData.customerName}
                </span>
              </p>
              <input
                type="text"
                placeholder="Enter Order Name for confirmation"
                className="w-full p-3 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setDeleteModal(false)}
                  className="px-5 py-2.5 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Never mind
                </button>
                <button
                  onClick={() => handleDelete(deleteOrderId)}
                  disabled={
                    inputValue !== selectedOrder?.snapshotData.customerName
                  }
                  className={`px-5 py-2.5 rounded-lg flex items-center space-x-2 transition-colors duration-200 ${inputValue !== selectedOrder?.snapshotData.customerName
                      ? "bg-red-300 cursor-not-allowed"
                      : "bg-red-600 text-white hover:bg-red-700"
                    }`}
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Delete Order</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTable;

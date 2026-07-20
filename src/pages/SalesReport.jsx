import { useEffect, useState } from "react";
import getSalesReport from "../api/reportApi/getSalesReport";
import getProductReport from "../api/reportApi/getProductReport";
import Loading from "../components/utli/Loading";
import { DateRangePicker } from "../components/utli/DateRangePicker";
import { MdRefresh } from "react-icons/md";
import SalesOverview from "../components/reportManagement/SalesOverview";
import ProductSalesReport from "../components/reportManagement/ProductSalesReport";

// Helper function to get today's date
const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

export default function SalesReport() {
  const [salesReport, setSalesReport] = useState(null);
  const [productReport, setProductReport] = useState(null);
  const [activeReportTab, setActiveReportTab] = useState("overview"); // 'overview' or 'products'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [startDate, setStartDate] = useState(getToday());
  const [endDate, setEndDate] = useState(getToday());
  const [paymentMethod, setPaymentMethod] = useState("");
  const [status, setStatus] = useState("confirmed");

  const formatDateForAPI = (date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fetchSalesReport = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const startDateStr = formatDateForAPI(startDate);
      const endDateStr = formatDateForAPI(endDate);
      const response = await getSalesReport(
        startDateStr,
        endDateStr,
        paymentMethod,
        status,
      );
      setSalesReport(response);
    } catch (error) {
      console.error("Error fetching sales report:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchProductReport = async (isRefresh = false) => {
    // console.log("fetchProductReport", startDate, endDate);
    if (!startDate || !endDate) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const startDateStr = formatDateForAPI(startDate);
      const endDateStr = formatDateForAPI(endDate);
      const response = await getProductReport(startDateStr, endDateStr);
      setProductReport(response);
    } catch (error) {
      console.error("Error fetching product report:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (activeReportTab === "overview") {
      fetchSalesReport();
    } else {
      fetchProductReport();
    }
  }, [activeReportTab, startDate, endDate, paymentMethod]);

  const handleDateRangeChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleRefresh = () => {
    if (activeReportTab === "overview") {
      fetchSalesReport(true);
    } else {
      fetchProductReport(true);
    }
  };

  const formatCurrency = (amount) => {
    return amount?.toLocaleString() || "0";
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="h-[calc(100vh-50px)] overflow-y-auto overflow-x-hidden px-5 py-6">
      <div className="overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6 font-primary">
          <button
            onClick={() => setActiveReportTab("overview")}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeReportTab === "overview"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveReportTab("products")}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeReportTab === "products"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Product Sales
          </button>
        </div>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 font-primary">
              Sales Report
            </h1>
            <p className="text-gray-600">
              Last updated: {new Date().toLocaleString()}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
            {/* Status Filter - Only show for Overview */}
            {activeReportTab === "overview" && (
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 w-full sm:w-auto sm:min-w-[160px]"
              >
                <option value="confirmed">Confirmed</option>
                <option value="success">Success</option>
                <option value="cancelled">Cancelled</option>
              </select>
            )}

            {/* Payment Method Filter - Only show for Overview */}
            {activeReportTab === "overview" && (
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 w-full sm:w-auto sm:min-w-[160px]"
              >
                <option value="">All Payment Methods</option>
                <option value="cash-on-delivery">Cash on Delivery</option>
                <option value="k-pay">K Pay</option>
              </select>
            )}

            {/* Date Range Picker */}
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onChange={handleDateRangeChange}
            />

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 h-10"
            >
              <MdRefresh
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {activeReportTab === "overview" ? (
          <SalesOverview
            salesReport={salesReport}
            formatCurrency={formatCurrency}
            startDate={startDate}
            endDate={endDate}
          />
        ) : (
          <ProductSalesReport
            productReport={productReport}
            formatCurrency={formatCurrency}
            startDate={startDate}
            endDate={endDate}
          />
        )}
      </div>
    </div>
  );
}

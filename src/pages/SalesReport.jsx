import { useEffect, useState } from "react";
import getAnalytics from "../api/reportApi/getAnalytics";
import getSalesReport from "../api/reportApi/getSalesReport";
import Loading from "../components/utli/Loading";
import { DateRangePicker } from "../components/utli/DateRangePicker";
import {
  MdTrendingUp,
  MdShoppingCart,
  MdLocalShipping,
  MdPersonAdd,
  MdRefresh,
  MdCalendarToday,
  MdCalendarViewWeek,
  MdCalendarViewMonth,
  MdPayment,
  MdCheckCircle,
  MdPending,
  MdCancel,
} from "react-icons/md";

// Helper function to get today's date
const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

export default function SalesReport() {
  const [analytics, setAnalytics] = useState(null);
  const [salesReport, setSalesReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // Initialize dates to last 30 days
  const [startDate, setStartDate] = useState(() => {
    const thirtyDaysAgo = new Date(getToday());
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return thirtyDaysAgo;
  });
  const [endDate, setEndDate] = useState(getToday());
  const [paymentMethod, setPaymentMethod] = useState("");

  const formatDateForAPI = (date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fetchAnalytics = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await getAnalytics();
      setAnalytics(response);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchSalesReport = async (isRefresh = false) => {
    if (!startDate || !endDate) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const startDateStr = formatDateForAPI(startDate);
      const endDateStr = formatDateForAPI(endDate);
      console.log("Fetching sales report with params:", {
        startDateStr,
        endDateStr,
        paymentMethod,
      });
      const response = await getSalesReport(startDateStr, endDateStr, paymentMethod);
      console.log("res", response);
      setSalesReport(response);
    } catch (error) {
      console.error("Error fetching sales report:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // fetchAnalytics();
    fetchSalesReport();
  }, []);

  useEffect(() => {
    console.log("useEffect triggered with dates:", { startDate, endDate, paymentMethod });
    if (startDate && endDate) {
      fetchSalesReport();
    }
  }, [startDate, endDate, paymentMethod]);

  const handleDateRangeChange = (start, end) => {
    console.log("Date range changed:", { start, end });
    setStartDate(start);
    setEndDate(end);
  };

  const handleRefresh = () => {
    // fetchAnalytics(true);
    fetchSalesReport(true);
  };

  const formatCurrency = (amount) => {
    return amount?.toLocaleString() || "0";
  };

  const StatCard = ({ title, value, icon: Icon, color = "bg-gray-100" }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-gray-700" />
        </div>
      </div>
    </div>
  );

  const TimePeriodCard = ({ period, data, icon: Icon, periodLabel }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gray-100 rounded-lg">
          <Icon className="w-5 h-5 text-gray-700" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{periodLabel}</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Orders</p>
          <p className="text-xl font-bold text-gray-900">{data.orderCount}</p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">New Customers</p>
          <p className="text-xl font-bold text-gray-900">{data.newCustomers}</p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Total Sales</p>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(data.totalSale)} MMK
          </p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Delivery Fees</p>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(data.totalDeliveryFee)} MMK
          </p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="h-[calc(100vh-50px)] overflow-y-auto px-5 py-6">
      <div className="">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Sales Report
            </h1>
            <p className="text-gray-600">
              Last updated:{" "}
              {new Date(
                salesReport?.data?.overview?.byDate?.[0]?.date || Date.now(),
              ).toLocaleString()}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Payment Method Filter */}
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 min-w-[160px]"
            >
              <option value="">All Payment Methods</option>
              <option value="cash-on-delivery">Cash on Delivery</option>
              <option value="k-pay">K Pay</option>
            </select>

            {/* Date Range Picker */}
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onChange={handleDateRangeChange}
            />

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <MdRefresh
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Sales Report Overview */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Sales Overview (
            {startDate ? startDate.toLocaleDateString() : "Start"} to{" "}
            {endDate ? endDate.toLocaleDateString() : "End"})
          </h2>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Sales"
              value={`${formatCurrency(salesReport?.data?.overview?.totalSales || 0)} MMK`}
              icon={MdTrendingUp}
              color="bg-green-100"
            />
            <StatCard
              title="Total Orders"
              value={salesReport?.data?.overview?.totalOrders || 0}
              icon={MdShoppingCart}
              color="bg-blue-100"
            />
            <StatCard
              title="Pending Orders"
              value={
                salesReport?.data?.overview?.byStatusObject?.pending?.count || 0
              }
              icon={MdCalendarToday}
              color="bg-yellow-100"
            />
            <StatCard
              title="Cash on Delivery"
              value={
                salesReport?.data?.overview?.byPaymentMethodObject?.[
                  "cash-on-delivery"
                ]?.count || 0
              }
              icon={MdLocalShipping}
              color="bg-purple-100"
            />
          </div>

          {/* Detailed Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 mt-4">
            {/* By Payment Method */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <MdPayment className="w-5 h-5 text-indigo-700" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Payment Methods
                </h3>
              </div>
              <div className="space-y-4">
                {salesReport?.data?.overview?.byPaymentMethod?.map((method, idx) => (
                  <div key={idx} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900 capitalize">
                        {method.paymentMethod.replace(/-/g, " ")}
                      </span>
                      <span className="font-bold text-gray-900">
                        {formatCurrency(method.totalAmount)} MMK
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 mb-3">
                      <span>{method.count} Orders</span>
                      <span>Avg: {formatCurrency(method.avgOrderValue || 0)} MMK</span>
                    </div>

                    {/* Progress Bar for Success Rate */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                      <div
                        className={`h-2 rounded-full ${method.successRate > 75 ? 'bg-green-500' : method.successRate > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${method.successRate || 0}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Success Rate</span>
                      <span>{method.successRate || 0}%</span>
                    </div>
                  </div>
                ))}
                {!salesReport?.data?.overview?.byPaymentMethod?.length && (
                  <p className="text-center text-gray-500 py-4">No data available</p>
                )}
              </div>
            </div>

            {/* By Status */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MdTrendingUp className="w-5 h-5 text-blue-700" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Order Status
                </h3>
              </div>
              <div className="space-y-4">
                {salesReport?.data?.overview?.byStatus?.map((statusObj, idx) => {
                  const isConfirmed = statusObj.status === "confirmed" || statusObj.status === "delivered";
                  const isPending = statusObj.status === "pending";

                  return (
                    <div key={idx} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${isConfirmed ? 'bg-green-100 text-green-700' : isPending ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {isConfirmed ? <MdCheckCircle className="w-5 h-5" /> : isPending ? <MdPending className="w-5 h-5" /> : <MdCancel className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 capitalize">{statusObj.status}</p>
                          <p className="text-sm text-gray-500">{statusObj.count} Orders</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatCurrency(statusObj.totalAmount)}</p>
                        <p className="text-xs text-gray-500">MMK</p>
                      </div>
                    </div>
                  )
                })}
                {!salesReport?.data?.overview?.byStatus?.length && (
                  <p className="text-center text-gray-500 py-4">No data available</p>
                )}
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}

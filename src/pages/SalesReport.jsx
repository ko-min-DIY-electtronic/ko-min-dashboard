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
      console.log("Fetching sales report with dates:", {
        startDateStr,
        endDateStr,
      });
      const response = await getSalesReport(startDateStr, endDateStr);
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
    fetchAnalytics();
    fetchSalesReport();
  }, []);

  useEffect(() => {
    console.log("useEffect triggered with dates:", { startDate, endDate });
    if (startDate && endDate) {
      fetchSalesReport();
    }
  }, [startDate, endDate]);

  const handleDateRangeChange = (start, end) => {
    console.log("Date range changed:", { start, end });
    setStartDate(start);
    setEndDate(end);
  };

  const handleRefresh = () => {
    fetchAnalytics(true);
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
              title="Cash Down Payments"
              value={
                salesReport?.data?.overview?.byPaymentMethodObject?.[
                  "cash-down"
                ]?.count || 0
              }
              icon={MdLocalShipping}
              color="bg-purple-100"
            />
          </div>

          {/* Sales by Date */}

          {/* Recent Orders */}
        </div>

        {/* Performance Summary */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Performance Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TimePeriodCard
              period="today"
              data={analytics?.today}
              period={analytics?.performanceSummary?.today}
              data={analytics?.performanceSummary?.today || {}}
              icon={MdCalendarToday}
              periodLabel="Today"
            />
            <TimePeriodCard
              period={analytics?.performanceSummary?.week}
              data={analytics?.performanceSummary?.week || {}}
              icon={MdCalendarViewWeek}
              periodLabel="This Week"
            />
            <TimePeriodCard
              period={analytics?.performanceSummary?.month}
              data={analytics?.performanceSummary?.month || {}}
              icon={MdCalendarViewMonth}
              periodLabel="This Month"
            />
          </div>
        </div>

        {/* Product Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Most Sold Product */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <MdTrendingUp className="w-5 h-5 text-green-700" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Most Sold Product
              </h3>
            </div>

            {analytics?.mostSoldProduct ? (
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900">
                    {analytics.mostSoldProduct.name}
                  </p>
                  <span className="text-sm text-green-600 font-medium">
                    {analytics.mostSoldProduct.totalSold} sold
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Category: {analytics.mostSoldProduct.category}
                </p>
                <p className="text-sm text-gray-600">
                  Product Code: {analytics.mostSoldProduct.productCode}
                </p>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <MdShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No sales data available</p>
              </div>
            )}
          </div>

          {/* Least Sold Product */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-100 rounded-lg">
                <MdTrendingUp className="w-5 h-5 text-red-700 rotate-180" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Least Sold Product
              </h3>
            </div>

            {analytics?.leastSoldProduct ? (
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900">
                    {analytics.leastSoldProduct.name}
                  </p>
                  <span className="text-sm text-red-600 font-medium">
                    {analytics.leastSoldProduct.totalSold} sold
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Category: {analytics.leastSoldProduct.category}
                </p>
                <p className="text-sm text-gray-600">
                  Product Code: {analytics.leastSoldProduct.productCode}
                </p>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <MdShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No sales data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        {/* <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Quick Stats
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Orders (All Time)"
              value={formatCurrency(
                (analytics?.performanceSummary?.today?.orderCount || 0) +
                  (analytics?.performanceSummary?.week?.orderCount || 0) +
                  (analytics?.performanceSummary?.month?.orderCount || 0)
              )}
              icon={MdShoppingCart}
              color="bg-blue-100"
            />
            <StatCard
              title="Total Sales (All Time)"
              value={`${formatCurrency(
                (analytics?.performanceSummary?.today?.totalSale || 0) +
                  (analytics?.performanceSummary?.week?.totalSale || 0) +
                  (analytics?.performanceSummary?.month?.totalSale || 0)
              )} MMK`}
              icon={MdTrendingUp}
              color="bg-green-100"
            />
            <StatCard
              title="Total Delivery Fees"
              value={`${formatCurrency(
                (analytics?.performanceSummary?.today?.totalDeliveryFee || 0) +
                  (analytics?.performanceSummary?.week?.totalDeliveryFee || 0) +
                  (analytics?.performanceSummary?.month?.totalDeliveryFee || 0)
              )} MMK`}
              icon={MdLocalShipping}
              color="bg-purple-100"
            />
            <StatCard
              title="New Customers"
              value={formatCurrency(
                (analytics?.performanceSummary?.today?.newCustomers || 0) +
                  (analytics?.performanceSummary?.week?.newCustomers || 0) +
                  (analytics?.performanceSummary?.month?.newCustomers || 0)
              )}
              icon={MdPersonAdd}
              color="bg-orange-100"
            />
          </div>
        </div> */}
      </div>
    </div>
  );
}

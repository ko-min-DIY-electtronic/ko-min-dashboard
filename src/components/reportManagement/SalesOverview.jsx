import {
  MdTrendingUp,
  MdShoppingCart,
  MdPayment,
  MdLocalShipping,
  MdHistory,
  MdOutlinePendingActions,
  MdAttachMoney,
} from "react-icons/md";

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

export default function SalesOverview({
  salesReport,
  formatCurrency,
  startDate,
  endDate,
}) {
  const overview = salesReport?.data?.overview;
  const orders = salesReport?.data?.orders || [];

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Sales Overview ({startDate ? startDate.toLocaleDateString() : "Start"}{" "}
        to {endDate ? endDate.toLocaleDateString() : "End"})
      </h2>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Sales"
          value={`${formatCurrency(overview?.totalSales || 0)} MMK`}
          icon={MdTrendingUp}
          color="bg-green-100"
        />
        <StatCard
          title="Products Cost"
          value={`${formatCurrency(overview?.totalProductsCost || 0)} MMK`}
          icon={MdAttachMoney}
          color="bg-blue-100"
        />
        <StatCard
          title="Delivery Cost"
          value={`${formatCurrency(overview?.totalDeliveryCost || 0)} MMK`}
          icon={MdLocalShipping}
          color="bg-purple-100"
        />
        <StatCard
          title="Total Orders"
          value={overview?.totalOrders || 0}
          icon={MdShoppingCart}
          color="bg-indigo-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* By Status */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MdOutlinePendingActions className="w-5 h-5 text-blue-700" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Order Status Breakdown
            </h3>
          </div>
          <div className="space-y-4">
            {overview?.byStatus?.map((status, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {status.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {status.count} Orders
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    {formatCurrency(status.totalAmount)} MMK
                  </p>
                </div>
              </div>
            ))}
            {!overview?.byStatus?.length && (
              <p className="text-center text-gray-500 py-4">
                No status data available
              </p>
            )}
          </div>
        </div>

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
            {overview?.byPaymentMethod?.map((method, idx) => (
              <div
                key={idx}
                className="border border-gray-100 rounded-lg p-4 bg-gray-50"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-900 capitalize">
                    {method.paymentMethod.replace(/-/g, " ")}
                  </span>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(method.totalAmount)} MMK
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mb-3">
                  <span>
                    {method.count} Total ({method.successfulOrders} Success)
                  </span>
                  <span>
                    Avg: {formatCurrency(method.avgOrderValue || 0)} MMK
                  </span>
                </div>

                {/* Progress Bar for Success Rate */}
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                  <div
                    className={`h-1.5 rounded-full ${method.successRate > 75 ? "bg-green-500" : method.successRate > 40 ? "bg-yellow-500" : "bg-red-500"}`}
                    style={{ width: `${method.successRate || 0}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Success Rate</span>
                  <span>{method.successRate || 0}%</span>
                </div>
              </div>
            ))}
            {!overview?.byPaymentMethod?.length && (
              <p className="text-center text-gray-500 py-4">
                No payment data available
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <MdHistory className="w-5 h-5 text-gray-700" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Orders in Period
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Payment</th>
                <th className="px-6 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      #{order.orderId.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : order.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                      {order.paymentMethod.replace(/-/g, " ")}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                      {formatCurrency(order.finalAmount)} MMK
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No orders found for this period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

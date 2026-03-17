import {
  MdTrendingUp,
  MdShoppingCart,
  MdPayment,
  MdLocalShipping,
  MdCheckCircle,
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

export default function SalesOverview({ salesReport, formatCurrency, startDate, endDate }) {
  return (
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
          title="K-Pay Orders"
          value={
            salesReport?.data?.overview?.byPaymentMethodObject?.["k-pay"]
              ?.count || 0
          }
          icon={MdPayment}
          color="bg-orange-100"
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
      <div className="grid grid-cols-1 gap-6 mb-8 mt-4">
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
      </div>
    </div>
  );
}

import {
  MdInventory,
  MdAttachMoney,
  MdShoppingCart,
  MdLayers,
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

export default function ProductSalesReport({ productReport, formatCurrency, startDate, endDate }) {
  return (
    <div className="pb-10">
      {/* Product Sale Overview */}
      <h2 className="text-xl font-semibold text-gray-900 mb-6 font-primary">
        Product Sales Overview ({startDate?.toLocaleDateString()} to{" "}
        {endDate?.toLocaleDateString()})
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Quantity Sold"
          value={productReport?.data?.summary?.totalQuantitySold || 0}
          icon={MdInventory}
          color="bg-blue-100"
        />
        <StatCard
          title="Total Revenue"
          value={`${formatCurrency(productReport?.data?.summary?.totalRevenue || 0)} MMK`}
          icon={MdAttachMoney}
          color="bg-green-100"
        />
        <StatCard
          title="Total Orders"
          value={productReport?.data?.summary?.totalOrders || 0}
          icon={MdShoppingCart}
          color="bg-purple-100"
        />
        <StatCard
          title="Unique Products"
          value={productReport?.data?.summary?.totalUniqueProducts || 0}
          icon={MdLayers}
          color="bg-orange-100"
        />
      </div>

      {/* Product Wise Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Product Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Product</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase text-center">Price</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase text-center">Qty Sold</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase text-center">Orders</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {productReport?.data?.products?.map((product, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{product.productName}</span>
                      <span className="text-xs text-gray-500">{product.productCode} • {product.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700">
                    {formatCurrency(product.unitPrice)} MMK
                  </td>
                  <td className="px-6 py-4 text-center font-semibold text-gray-900">
                    {product.totalQuantitySold}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">
                    {product.orderCount}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">
                    {formatCurrency(product.totalRevenue)} MMK
                  </td>
                </tr>
              ))}
              {(!productReport?.data?.products || productReport.data.products.length === 0) && (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                    No product sales found for this period
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

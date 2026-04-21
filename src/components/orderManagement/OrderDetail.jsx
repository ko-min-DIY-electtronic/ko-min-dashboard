// import { Download, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import getAOrder from "../../api/orderApi/getAOrder";
import { useParams, useNavigate } from "react-router-dom";
import getReceiptImage from "../../api/receipt/getReceiptIamge";
import UpdateModel from "./UpdateModel";
import chgOrderStatus from "../../api/orderApi/chgOrderStatus";
import { MdArrowBack, MdOutlinePhone, MdLocalShipping, MdCheckCircle, MdCheck, MdCancel } from "react-icons/md";
import Loading from "../utli/Loading";
import avatar from "../../assets/Oval.png";

export default function OrderDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const [isGenerating, setIsGenerating] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const getOrder = async () => {
    setLoading(true);
    const response = await getAOrder(id);
    // console.log(response);

    if (response.success) {
      setOrder(response.data);
    } else if (response.code === 403) {
      navigate("/unauthorized");
    }
    setLoading(false);
  };
  console.log(order);

  const handlePrintClick = (voucherImageUrl) => {
    // console.log(voucherImageUrl);

    // Create a new window
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      // Popup blocked
      console.warn("Popup blocked. Unable to open print window.");
      // Optional: provide user feedback or fallback
      return;
    }

    // Create the HTML content for the new window
    const htmlContent = `
    
    <html> <head> <title>Print Voucher</title> <style> body { margin: 0; } img { max-width: 100%; height: auto; display: block; } </style> </head> <body> <img src="${voucherImageUrl}" onload="window.print(); window.close();" /> </body> </html> `;

    setTimeout(() => {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }, 500);

    // No need to call print() here; the onload handler will print automatically
    // printWindow.print();
    // printWindow.close(); // Will be called by onload after printing
  };

  const chgStatus = async (status) => {
    const orderId = id;
    const data = {
      status,
    };
    const res = await chgOrderStatus({ orderId, data });
    // console.log(res);
    if (res.success) {
      getOrder();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    getOrder();
  }, []);

  const handlePrintPDF = async () => {
    const res = await getReceiptImage(id);
    console.log(res);
    if (res.code === 201) {
      handlePrintClick(res.data.receiptImage.cdnUrl);
    }
  };

  if (loading || !order) {
    return <Loading />;
  }

  return (
    <div className="h-[calc(100vh-50px)] overflow-y-auto px-3 sm:px-5">
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 border-b border-gray-200 pb-4 gap-4">
          <div className="flex gap-2 items-center">
            <button
              className="cursor-pointer hidden sm:block"
              onClick={() => navigate("/orders")}
            >
              <MdArrowBack size={24} />
            </button>
            <h1 className="header text-xl sm:text-2xl">Order Details</h1>
          </div>
          {/* <div className="flex gap-2 items-center"> */}
          {/* <div className="flex gap-2 items-center"></div> */}

          <div className="flex flex-wrap gap-2 items-center">
            {order.status !== "cancelled" && order.status !== "success" && (
              <button
                className="flex items-center gap-2 border border-primary px-4 py-3 rounded-3xl text-primary hover:bg-primary/10 transition-all duration-300 text-[15px] font-medium"
                onClick={() => chgStatus("cancelled")}
              >
                <MdCancel size={20} />
                Order Cancel
              </button>
            )}

            {order.status === "pending" && (
              <button
                className="flex items-center gap-2 border border-primary px-5 py-3 rounded-3xl text-white bg-primary hover:bg-primary/90 transition-all duration-300 text-[15px] font-medium shadow-sm hover:shadow-md"
                onClick={() => chgStatus("confirmed")}
              >
                <MdCheck size={20} />
                Confirm Order
              </button>
            )}

            {order.status === "confirmed" && (
              <button
                className="flex items-center gap-2 border border-primary px-5 py-3 rounded-3xl text-white bg-primary hover:bg-primary/90 transition-all duration-300 text-[15px] font-medium shadow-sm hover:shadow-md"
                onClick={() => chgStatus("on-delivery")}
              >
                <MdLocalShipping size={20} />
                On Delivery
              </button>
            )}

            {order.status === "on-delivery" && (
              <button
                className="flex items-center gap-2 border border-primary px-5 py-3 rounded-3xl text-white bg-primary hover:bg-primary/90 transition-all duration-300 text-[15px] font-medium shadow-sm hover:shadow-md"
                onClick={() => chgStatus("success")}
              >
                <MdCheckCircle size={20} />
                Mark as Success
              </button>
            )}
          </div>
          {/* </div> */}
        </div>

        <div>
          <form className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-20">
              <div className="space-y-6 w-full">
                <div className="py-4 px-3 sm:px-5 border rounded-lg">
                  <h1 className="font-semibold text-xl sm:text-[24px] mb-6">
                    Customer
                  </h1>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 lg:gap-20">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <img
                        src={avatar}
                        alt=""
                        className="w-16 h-16 sm:w-20 sm:h-20"
                      />
                      <div className="flex-1 sm:flex-none">
                        <p className="font-bold text-lg sm:text-[24px] break-words">
                          {order?.userId?.userName}
                        </p>
                        <span className="font-bold flex items-center gap-2 text-sm sm:text-base">
                          <MdOutlinePhone /> {order?.userId?.phoneNumber}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto">
                      <div>
                        <p className="font-semibold text-[14px] sm:text-[16px] mb-2">
                          Customer Status
                        </p>
                        <div>
                          <span className="px-3 sm:px-4 py-2 text-[12px] rounded-full bg-primary text-white">
                            Regular
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="font-semibold text-[14px] sm:text-[16px] mb-2">
                          Order Status
                        </p>
                        <div>
                          <span className="px-3 sm:px-4 py-2 text-[12px] rounded-full bg-[#FFF1C2] text-[#522504]">
                            {order?.status}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="font-semibold text-[14px] sm:text-[16px] mb-2">
                          Payment Method
                        </p>
                        <div>
                          <span className="px-3 sm:px-4 py-2 text-[12px] rounded-full bg-[#E8F5E8] text-[#2E7D32] capitalize">
                            {order?.paymentMethod?.replace("-", " ")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="py-4 px-3 sm:px-5 border rounded-lg">
                  <h1 className="font-semibold text-xl sm:text-[24px] mb-6">
                    Delivery Address
                  </h1>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {/* city */}
                    <div>
                      <label htmlFor="city" className="label">
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        readOnly
                        value={order?.delivery?.city}
                        className="input-box"
                      />
                    </div>

                    {/* Township */}
                    <div>
                      <label htmlFor="Township" className="label">
                        Township
                      </label>
                      <input
                        type="text"
                        id="Township"
                        name="Township"
                        readOnly
                        value={order?.delivery?.township}
                        className="input-box"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:gap-6 mt-4 sm:mt-6">
                    {/* Address */}
                    <div>
                      <label htmlFor="address" className="label">
                        Detail Address
                      </label>
                      <textarea
                        id="address"
                        name="address"
                        readOnly
                        value={order?.address}
                        className="input-box"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* <div className="w-full">
                <label className="label">Payment ScreenShot</label>

               

                <div className="mt-4 w-full">
                  <div className="rounded-lg overflow-hidden bg-gray-100">
                    <img
                        src={order.paymentImage.url || "/placeholder.svg"}
                        alt="paymentImage"
                        className="w-full max-h-[600px]"
                      />
                  </div>
                </div>
              </div> */}
            </div>
          </form>

          {/* Order Section */}
          <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 mt-6 sm:mt-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 gap-4">
              <div className="flex items-center gap-4">
                <h2 className="header text-xl sm:text-2xl">Order Receipt</h2>
                {/* <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    order.deliveryStatus === "Delivered"
                      ? "bg-green-100 text-green-800"
                      : order.deliveryStatus === "Pending"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {order.deliveryStatus}
                </span> */}
              </div>

              {/* Print Button */}
              {/* <button
                className="bg-primary hover:bg-primary/80 text-white font-medium py-3 px-4 rounded-3xl flex items-center justify-center gap-2 transition-colors"
                onClick={() => {
                  handlePrintPDF();
                }}
              >
                {isGenerating ? (
                  <>
                    <Download className="w-4 h-4" />
                    <span className="myanmar-text">Waiting...</span>
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 -960 960 960"
                      width="24px"
                      fill="#e3e3e3"
                    >
                      <path d="M80-160v-200q0-50 35-85t85-35h40v-320h480v320h40q50 0 85 35t35 85v200H80Zm240-320h320v-240H320v240ZM160-240h640v-120q0-17-11.5-28.5T760-400H200q-17 0-28.5 11.5T160-360v120Zm560-40q17 0 28.5-11.5T760-320q0-17-11.5-28.5T720-360q-17 0-28.5 11.5T680-320q0 17 11.5 28.5T720-280ZM160-400h640-640Z" />
                    </svg>
                    <span className="myanmar-text">Print Receipt</span>
                  </>
                )}
              </button> */}
            </div>

            <div className="w-full h-auto mx-auto font-sans relative">
              {/* Header - Hidden on mobile, shown on desktop */}
              <div className="hidden sm:grid grid-cols-5 gap-2 sm:gap-4 pb-4 mb-6 border-b border-gray-200">
                <div className="label text-xs sm:text-sm">Items</div>
                <div className="label text-center text-xs sm:text-sm">
                  Category
                </div>
                <div className="label text-center text-xs sm:text-sm">
                  Quantity
                </div>
                <div className="label text-center text-xs sm:text-sm">
                  Weight
                </div>
                <div className="label text-right text-xs sm:text-sm">Price</div>
              </div>

              {/* Item Rows - Mobile: Card layout, Desktop: Table layout */}
              {order?.products?.map((item, index) => (
                <div key={item.stockId}>
                  {/* Mobile Card Layout */}
                  <div className="sm:hidden bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm mb-1">
                            {item.name}
                          </h3>
                          <p className="text-xs text-gray-600">
                            Category: {item.category}
                          </p>
                        </div>
                        <div className="text-right">
                          {item.isDiscounted ? (
                            <>
                              <div className="flex flex-col items-end">
                                <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded mb-1">
                                  -{item.discountPercentage}%
                                </span>
                                <p className="text-xs text-gray-400 line-through">
                                  {item.unitPrice.toLocaleString()} MMK
                                </p>
                                <p className="font-semibold text-primary text-sm">
                                  {(
                                    item.unitPrice *
                                    (1 - item.discountPercentage / 100)
                                  ).toLocaleString()}{" "}
                                  MMK
                                </p>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                Qty: {item.quantity} ={" "}
                                {(
                                  item.unitPrice *
                                  (1 - item.discountPercentage / 100) *
                                  item.quantity
                                ).toLocaleString()}{" "}
                                MMK
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="font-semibold text-gray-900 text-sm">
                                {item.unitPrice.toLocaleString()} MMK
                              </p>
                              <p className="text-xs text-gray-500">
                                Qty: {item.quantity} ={" "}
                                {(
                                  item.unitPrice * item.quantity
                                ).toLocaleString()}{" "}
                                MMK
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Qty: {item.quantity}</span>
                        <span>
                          Weight: {item.unitWeight} {item.weightUnit}
                        </span>
                        <span>Sale Type: {item.sale}</span>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Table Row */}
                  <div className="hidden sm:grid grid-cols-5 gap-2 sm:gap-4 mb-6 items-center">
                    <div className="text-gray-900 text-sm font-medium">
                      {item.name}
                    </div>
                    <div className="text-gray-900 text-sm text-center">
                      {item.category}
                    </div>
                    <div className="text-gray-900 text-sm text-center">
                      {item.quantity}
                    </div>
                    <div className="text-gray-900 text-sm text-center">
                      {item.unitWeight} {item.weightUnit}
                    </div>
                    <div className="text-gray-900 text-sm text-right">
                      {item.isDiscounted ? (
                        <div className="flex flex-col items-end">
                          <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded mb-1">
                            -{item.discountPercentage}%
                          </span>
                          <span className="text-xs text-gray-400 line-through">
                            {item.unitPrice.toLocaleString()} MMK
                          </span>
                          <span className="font-semibold text-primary">
                            {(
                              item.unitPrice *
                              (1 - item.discountPercentage / 100)
                            ).toLocaleString()}{" "}
                            MMK
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            Qty: {item.quantity} ={" "}
                            {(
                              item.unitPrice *
                              (1 - item.discountPercentage / 100) *
                              item.quantity
                            ).toLocaleString()}{" "}
                            MMK
                          </div>
                        </div>
                      ) : (
                        <>
                          {item.unitPrice.toLocaleString()} MMK
                          <div className="text-xs text-gray-500">
                            Qty: {item.quantity} ={" "}
                            {(item.unitPrice * item.quantity).toLocaleString()}{" "}
                            MMK
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <div className="border-t border-gray-200 pt-4 mb-6">
                {/* Mobile Layout for Fees */}
                <div className="sm:hidden space-y-4">
                  {/* Subtotal */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900 text-sm font-medium">
                        Subtotal
                      </span>
                      <span className="text-gray-900 text-sm font-semibold">
                        {order?.subTotal.toLocaleString()} MMK
                      </span>
                    </div>
                  </div>

                  {/* Tax - show if > 0 */}
                  {order?.tax > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-900 text-sm font-medium">
                          Tax
                        </span>
                        <span className="text-gray-900 text-sm font-semibold">
                          {order?.tax.toLocaleString()} MMK
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Discount - show if > 0 */}
                  {order?.discount > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-center text-red-600">
                        <span className="text-sm font-medium">
                          Discount
                        </span>
                        <span className="text-sm font-semibold">
                          -{order?.discount.toLocaleString()} MMK
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Delivery Fee */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900 text-sm font-medium">
                        Delivery Fee
                      </span>
                      <span className="text-gray-900 text-sm font-semibold">
                        {order?.delivery.calculatedDeliveryFee.toLocaleString()}{" "}
                        MMK
                      </span>
                    </div>
                  </div>

                  {/* Only show Additional Kilo Fee if weight > 2kg */}
                  {order?.delivery.totalWeight > 2 && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="space-y-2">
                        <div className="text-gray-900 text-sm font-medium">
                          Additional Weight Fee
                        </div>
                        <div className="text-xs text-gray-500">
                          (1000 MMK Per Kilo for weight over 2kg)
                        </div>
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-gray-900 text-sm">
                            {order?.delivery.totalWeight} kg
                          </span>
                          <span className="text-gray-900 text-sm font-semibold">
                            {order?.delivery.additionalWeightCharge.toLocaleString()}{" "}
                            MMK
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Desktop Layout for Fees */}
                <div className="hidden sm:block space-y-4">
                  {/* Subtotal */}
                  <div className="grid grid-cols-5 gap-2 sm:gap-4">
                    <div className="text-gray-900 text-sm font-medium col-span-4">
                      Subtotal
                    </div>
                    <div className="text-gray-900 text-sm text-right">
                      {order?.subTotal.toLocaleString()} MMK
                    </div>
                  </div>

                  {/* Tax */}
                  {order?.tax > 0 && (
                    <div className="grid grid-cols-5 gap-2 sm:gap-4">
                      <div className="text-gray-900 text-sm font-medium col-span-4">
                        Tax
                      </div>
                      <div className="text-gray-900 text-sm text-right">
                        {order?.tax.toLocaleString()} MMK
                      </div>
                    </div>
                  )}

                  {/* Discount */}
                  {order?.discount > 0 && (
                    <div className="grid grid-cols-5 gap-2 sm:gap-4 text-red-600">
                      <div className="text-sm font-medium col-span-4">
                        Discount
                      </div>
                      <div className="text-sm text-right font-semibold">
                        -{order?.discount.toLocaleString()} MMK
                      </div>
                    </div>
                  )}

                  {/* Additional Weight Charge */}
                  {order?.delivery?.totalWeight > 2 && (
                    <div className="flex flex-col gap-4 border-b pb-5">
                      <div className="grid grid-cols-5 gap-2 sm:gap-4">
                        <div className="text-gray-900 text-sm font-medium col-span-4">
                          Additional Weight Charge
                        </div>
                        <div className="text-gray-900 text-sm text-right">
                          {order?.delivery.additionalWeightCharge.toLocaleString()} MMK
                        </div>
                      </div>

                      <div className="grid grid-cols-5 gap-2 sm:gap-4">
                        <div className="text-gray-900 text-sm font-medium col-span-4">
                          Delivery Fee
                        </div>
                        <div className="text-gray-900 text-sm text-right">
                          {order?.delivery.baseDeliveryFee.toLocaleString()} MMK
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Delivery Fee */}
                  <div className="grid grid-cols-5 gap-2 sm:gap-4">
                    <div className="text-gray-900 text-sm font-medium col-span-4">
                      {order?.delivery?.totalWeight > 2 ? "Total Delivery Fee" : "Delivery Fee"}
                    </div>
                    <div className="text-gray-900 text-sm text-right">
                      {order?.delivery.calculatedDeliveryFee.toLocaleString()} MMK
                    </div>
                  </div>
                </div>
              </div>

              <div>
                {/* Total Section */}
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-200">
                    <div className="flex justify-between items-center">
                      <div className="text-gray-900 text-lg sm:text-xl font-bold">
                        Total
                      </div>
                      <div className="text-gray-900 text-lg sm:text-xl font-bold">
                        {(order?.finalAmount).toLocaleString()}
                        MMK
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isOpen && (
        <UpdateModel
          isOpen={isOpen}
          isEditOpen={isEditOpen}
          onClose={handleClose}
          product={product}
          orderId={id}
          onSubmit={getOrder}
        />
      )}
    </div>
  );
}

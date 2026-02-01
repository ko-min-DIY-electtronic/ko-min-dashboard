// import { Download, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import getAOrder from "../../api/orderApi/getAOrder";
import { useParams, useNavigate } from "react-router-dom";
import getReceiptImage from "../../api/receipt/getReceiptIamge";
import UpdateModel from "./UpdateModel";
import chgOrderStatus from "../../api/orderApi/chgOrderStatus";
import { MdArrowBack, MdOutlinePhone } from "react-icons/md";
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

          {/* <div className="flex gap-2 items-center">
              {order.status !== "cancelled" && (
                <button
                  className="flex items-center gap-2 mr-4 border border-primary px-4 py-3 rounded-3xl text-primary hover:bg-primary/20 transition-colors duration-300 text-[16px]"
                  onClick={() => {
                    chgStatus("cancelled");
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="18px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="currentColor"
                  >
                    <path d="m760-183-85 84-56-56 84-85-84-85 56-56 85 84 85-84 56 56-84 85 84 85-56 56-85-84ZM240-80q-50 0-85-35t-35-85v-120h120v-560h600v415q-19-7-39-10.5t-41-3.5v-321H320v480h214q-7 19-10.5 39t-3.5 41H200v40q0 17 11.5 28.5T240-160h294q8 23 20 43t28 37H240Zm120-520v-80h360v80H360Zm0 120v-80h360v80H360Zm174 320H200h334Z" />
                  </svg>
                  Order Cancel
                </button>
              )}

              {order.status !== "confirmed" && (
                <button
                  className="flex items-center gap-2 mr-4 border border-primary px-4 py-3 rounded-3xl text-white bg-primary hover:bg-primary/80 transition-colors duration-300 text-[16px]"
                  onClick={() => {
                    chgStatus("confirmed");
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="18px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="currentColor"
                  >
                    <path d="m760-183-85 84-56-56 84-85-84-85 56-56 85 84 85-84 56 56-84 85 84 85-56 56-85-84ZM240-80q-50 0-85-35t-35-85v-120h120v-560h600v415q-19-7-39-10.5t-41-3.5v-321H320v480h214q-7 19-10.5 39t-3.5 41H200v40q0 17 11.5 28.5T240-160h294q8 23 20 43t28 37H240Zm120-520v-80h360v80H360Zm0 120v-80h360v80H360Zm174 320H200h334Z" />
                  </svg>
                  Confirm Order
                </button>
              )}

              <button
                className="flex items-center gap-2 mr-4 bg-primary px-4 py-3 rounded-lg text-white hover:bg-primary/80"
                onClick={() => {
                  setIsOpen(true);
                  setIsEditOpen(true);
                  setProduct(order);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="#fff"
                >
                  <path d="M480-240Zm-320 80v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q37 0 73 4.5t72 14.5l-67 68q-20-3-39-5t-39-2q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32h240v80H160Zm400 40v-123l221-220q9-9 20-13t22-4q12 0 23 4.5t20 13.5l37 37q8 9 12.5 20t4.5 22q0 11-4 22.5T903-340L683-120H560Zm300-263-37-37 37 37ZM620-180h38l121-122-18-19-19-18-122 121v38Zm141-141-19-18 37 37-18-19ZM480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm0-80q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Z" />
                </svg>
                Edit Customer Info
              </button>
            </div> */}
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
                          <p className="font-semibold text-gray-900 text-sm">
                            {(item.unitPrice * item.quantity).toLocaleString()}{" "}
                            MMK
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Qty: {item.quantity}</span>
                        <span>
                          Weight: {item.unitWeight} {item.weightUnit}
                        </span>
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
                      {(item.unitPrice * item.quantity).toLocaleString()} MMK
                    </div>
                  </div>
                </div>
              ))}

              <div className="border-t border-gray-200 pt-4 mb-6">
                {/* Mobile Layout for Fees */}
                <div className="sm:hidden space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900 text-sm font-medium">
                        Delivery Fee
                      </span>
                      <span className="text-gray-900 text-sm font-semibold">
                        {order?.delivery.baseDeliveryFee.toLocaleString()} MMK
                      </span>
                    </div>
                  </div>

                  {/* Only show Additional Kilo Fee if weight > 2kg */}
                  {order?.delivery.totalWeight > 2 && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="space-y-2">
                        <div className="text-gray-900 text-sm font-medium">
                          Additional Kilo Fee
                        </div>
                        <div className="text-xs text-gray-500">
                          (1000 MMK Per Kilo for weight over 2kg)
                        </div>
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-gray-900 text-sm">
                            {order?.delivery.totalWeight} kg
                          </span>
                          <span className="text-gray-900 text-sm font-semibold">
                            {(
                              order?.delivery.additionalWeightCharge *
                              order?.delivery.totalWeight
                            ).toLocaleString()}{" "}
                            MMK
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Desktop Layout for Fees */}
                <div className="hidden sm:block">
                  <div className="grid grid-cols-5 gap-2 sm:gap-4 mb-8">
                    <div className="text-gray-900 text-sm font-medium col-span-4">
                      Delivery Fee
                    </div>
                    <div className="text-gray-900 text-sm text-right">
                      {order?.delivery.baseDeliveryFee.toLocaleString()}
                      MMK
                    </div>
                  </div>
                  {/* Only show Additional Kilo Fee if weight > 2kg */}
                  {/* {order?.delivery.totalWeight > 2 && (
                    <div className="grid grid-cols-5 gap-2 sm:gap-4 mb-8">
                      <div className="text-gray-900 text-sm font-medium col-span-3">
                        Additional Kilo Fee <br />{" "}
                        <span className="text-xs text-gray-500">
                          (1000 MMK Per Kilo for weight over 2kg)
                        </span>
                      </div>
                      <div className="text-gray-900 text-sm text-center">
                        {order?.delivery.totalWeight}
                        kg
                      </div>
                      <div className="text-gray-900 text-sm text-right">
                        {(
                          order?.delivery.additionalWeightCharge *
                          order?.delivery.totalWeight
                        ).toLocaleString()}
                        MMK
                      </div>
                    </div>
                  )} */}
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
                        {(
                          order?.totalAmount +
                          order.delivery.calculatedDeliveryFee
                        ).toLocaleString()}
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

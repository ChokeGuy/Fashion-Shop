"use client";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { ErrorMessage, Field, Form, Formik, setIn } from "formik";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import LoadingButton from "@mui/lab/LoadingButton";
import CircularProgress from "@mui/material/CircularProgress";
import { useAppDispatch, useAppSelector } from "@/src/lib/redux/hooks";
import {
  getAllOrdersAsync,
  resetOrderStatus,
  selectOrders,
  selectOrderStatus,
  setOrders,
} from "@/src/lib/features/order/orderSlice";
import { formatPrice } from "@/src/utilities/price-format";
import EmptyOrder from "./emptyOrder";
import WarningIcon from "@mui/icons-material/Warning";
import Popup from "../Popup";
import { CartItem, Order, OrderItem } from "@/src/models";
import Image from "next/image";
import CircleLoading from "../Loading";
import { orderApi } from "../../apis/orderApi";
import { showToast } from "@/src/lib/toastify";
import { debounce } from "lodash";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { OrderStatus } from "@/src/constants/orderStatus";
import FeedBack from "./feedback";
import { setCheckOutItems } from "@/src/lib/features/checkout/checkoutSlice";
import { setCookie } from "cookies-next";
import { sessionOptions } from "@/src/config/session";
import Link from "next/link";

const OrderTrackingPage = ({
  orderSearchs,
}: {
  orderSearchs: Order[] | undefined;
}) => {
  const pathName = usePathname();
  const { replace, push } = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState<string>("");
  const [loading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  const [isOpenCancelOrder, setIsOpenCancelOrder] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState(-1);

  const [isOpenRatingDialog, setIsOpenRatingDialog] = useState(false);

  const orders = useAppSelector(selectOrders);
  const [ordersDetail, setOrdersDetail] = useState<OrderItem[]>([]);
  const [orderId, setOrderId] = useState(-1);
  const [orderFeedBackId, setOrderFeedBackId] = useState(-1);
  const [isRated, setIsRated] = useState(false);

  const dispatch = useAppDispatch();
  const [orderStatus, setOrderStatus] = useState(0);
  const handleChange = (_event: React.ChangeEvent<{}>, orderStatus: number) => {
    dispatch(resetOrderStatus());
    setOrderStatus(orderStatus);
    setSearchInput("");
    const inputParams = new URLSearchParams(searchParams);
    inputParams.delete("orderKeyword");
    replace(`${pathName}?${inputParams.toString()}`, {
      scroll: false,
    });
  };

  // useEffect(() => {
  //   if (orderApiStatus === "idle") {
  //     dispatch(getAllOrdersAsync());
  //   }
  // }, [dispatch, orderApiStatus]);

  useEffect(() => {
    if (orderSearchs) {
      const inputParams = searchParams.get("orderKeyword");
      setSearchInput(inputParams ?? "");
      dispatch(setOrders(orderSearchs));
    } else {
      dispatch(getAllOrdersAsync());
      setSearchInput("");
    }
  }, [orderSearchs]);

  const handleOpenDetail = async (orderId: number) => {
    setOrderId(orderId);
    setLoadingDetail(true);
    setIsOpenDetail(true);
    await handleGetOrdersDetail(orderId);
    setLoadingDetail(false);
  };

  const handleGetOrdersDetail = async (orderId: number) => {
    const response = await orderApi.getOrdersById({ orderId });
    if (response?.statusCode !== 200) {
      showToast("Có lỗi xảy ra", "error");
      return;
    }
    setOrdersDetail(response?.result.orderItems);
    return response;
  };

  const order = orders.find((value) => value.orderId == orderId);

  const handleSetOrdersDetail = async (orderId: number, isRated: boolean) => {
    await handleGetOrdersDetail(orderId);
    setOrderFeedBackId(orderId);
    setIsRated(isRated);
  };

  const getTotalAmount = (ordersDetail: OrderItem[]): number => {
    return ordersDetail.reduce((total, order) => total + order.amount, 0);
  };

  const handleGetOrderStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "WAITING_FOR_PAYMENT":
        return "bg-text-light-color";
      case "PENDING":
        return "bg-text-color";
      case "PROCESSING":
        return "bg-yellow-400";
      case "SHIPPING":
        return "bg-blue-400";
      case "DELIVERED":
        return "bg-primary-color";
      case "CANCELLED":
        return "bg-red-400";
      default:
        return "bg-primary-color";
    }
  };

  const handleSearchOrder = useCallback(
    debounce((keyword: string) => {
      try {
        const inputParams = new URLSearchParams(searchParams);
        if (keyword) {
          inputParams.set("orderKeyword", keyword);
        } else {
          inputParams.delete("orderKeyword");
        }
        replace(`${pathName}?${inputParams.toString()}`, {
          scroll: false,
        });
      } catch (error) {}
    }, 300),
    [searchParams]
  );

  const handleOpenCancelOrder = (orderId: number) => {
    setIsOpenCancelOrder(true);
    setCancelOrderId(orderId);
  };

  const handleCancelOrder = async () => {
    setIsCanceling(true);
    const response = await orderApi.cancelOrders(cancelOrderId);
    if (
      response?.message ==
      "Only orders with statuses WAITING_FOR_PAYMENT or PENDING can be cancel"
    ) {
      showToast(
        "Chỉ có đơn hàng chờ xác nhận hoặc chờ thanh toán mới được hủy",
        "error"
      );
      setIsCanceling(false);
      return;
    } else if (response?.statusCode !== 200) {
      showToast("Có lỗi xảy ra, vui lòng thử lại", "error");
      setIsCanceling(false);
      return;
    }
    // Find the order with the cancelOrderId and update its status
    const updatedOrders: Order[] = orders.map((order) =>
      order.orderId === cancelOrderId
        ? { ...order, status: "CANCELLED" }
        : order
    );

    // Update the orders in the state
    dispatch(setOrders(updatedOrders));

    showToast("Hủy đơn hàng thành công", "success");
    setIsOpenCancelOrder(false);
    setIsCanceling(false);
    setCancelOrderId(-1);
  };

  const handleRePayoutOrder = async (orderId: number) => {
    const response = await handleGetOrdersDetail(orderId);
    const checkoutItems =
      response?.result.orderItems.map((value) => ({
        ...value,
        price: value.unitPrice,
        promotionalPrice: value.unitPrice,
      })) || [];
    const checkoutData = {
      promotionPrice: response?.result.order.voucherDiscountAmount || 0,
      voucherId: response?.result.order.voucherId || -1,
      allCheckOutItems: checkoutItems,
    };
    dispatch(setCheckOutItems(checkoutData));
    setCookie("orderId", orderId, sessionOptions(600));
    setCookie("isRepayout", true, sessionOptions(600));
    push("/checkout");
  };

  return (
    <>
      <div className="col-span-full md:col-span-8 lg:col-span-8 flex flex-col">
        <div className="bg-white w-full rounded-sm mb-4 border border-border-color shadow-sm">
          <Tabs
            className="text-sm md:text-base"
            variant="fullWidth"
            value={orderStatus}
            onChange={handleChange}
            scrollButtons={true}
            // variant="scrollable"
            allowScrollButtonsMobile
          >
            <Tab
              className="hover:opacity-55 transition-opacity duration-500"
              label="Tất cả"
            />
            <Tab
              className="hover:opacity-55 transition-opacity duration-500 text-[15px] whitespace-nowrap"
              label="Chờ thanh toán"
            />
            <Tab
              className="hover:opacity-55 transition-opacity duration-500 whitespace-nowrap"
              label="Chờ xác nhận"
            />
            <Tab
              className="hover:opacity-55 transition-opacity duration-500"
              label="Đang xử lý"
            />
            <Tab
              className="hover:opacity-55 transition-opacity duration-500"
              label="Vận chuyển"
            />
            <Tab
              className="hover:opacity-55 transition-opacity duration-500"
              label="Hoàn thành"
            />
            <Tab
              className="hover:opacity-55 transition-opacity duration-500"
              label="Đã hủy"
            />
          </Tabs>
        </div>
        {
          /* Search form */
          orderStatus === 0 && (
            <div className="text-sm">
              <Formik
                initialValues={{
                  search: "",
                }}
                validateOnBlur={false}
                validateOnChange={false}
                // validate={(values) => {
                //   const errors: {
                //     search: string;
                //   } = { search: "" };

                //   if (!values.search) {
                //     errors.search = "Nhâp mã đơn hàng hoặc tên sản phẩm";
                //     return errors;
                //   }
                // }}
                onSubmit={function (
                  values,
                  { setSubmitting }
                ): void | Promise<any> {}}
              >
                {({ submitForm, errors, isSubmitting, dirty }) => (
                  <Form className="flex flex-col gap-y-1 pb-1 relative">
                    <Field
                      value={searchInput}
                      onChange={(e: { target: { value: string } }) => {
                        setSearchInput(e.target.value);
                        handleSearchOrder(e.target.value);
                      }}
                      disabled={loading}
                      className={`rounded-sm bg-white text-base !border-border-color w-full px-3 py-2 flex-1 mb-3 ${
                        loading && "opacity-55"
                      } ${
                        errors.search && "border-red-500"
                      } bg-background transition-all`}
                      type="text"
                      placeholder="Nhập mã đơn hàng hoặc tên sản phẩm..."
                    />
                    <LoadingButton
                      loading={false}
                      loadingIndicator={
                        <CircularProgress className="text-black" size={20} />
                      }
                      disabled={loading || !dirty}
                      onClick={submitForm}
                      className={`absolute -right-2 top-2 cursor-pointer ${
                        !dirty && "opacity-55"
                      }`}
                    >
                      <SearchIcon />
                    </LoadingButton>
                  </Form>
                )}
              </Formik>
            </div>
          )
        }
        <div
          className="bg-white w-full rounded-xl border border-border-color
         shadow-sm h-[465px] overflow-auto"
        >
          {orderStatus === 0 && (
            <>
              {orders && orders.length > 0 ? (
                orders.map((order, index) => {
                  return (
                    <div
                      key={order.orderId}
                      className={`p-6 ${
                        (index !== orders.length - 1 || orders.length > 1) &&
                        "border-b border-border-color"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 text-text-color font-semibold mb-2 flex-wrap">
                            <span className="text-xl w-fit">
                              #{order.orderId}
                            </span>
                            {order.status && (
                              <div
                                className={`${handleGetOrderStatusColor(
                                  order.status
                                )}  text-white w-[136px] whitespace-nowrap text-center`}
                              >
                                {order.status === "WAITING_FOR_PAYMENT" &&
                                  "Chờ thanh toán"}
                                {order.status === "PENDING" && "Chờ xác nhận"}
                                {order.status === "PROCESSING" && "Đang xử lý"}
                                {order.status === "SHIPPING" && "Vận chuyển"}
                                {order.status === "DELIVERED" && "Hoàn thành"}
                                {order.status === "CANCELLED" && "Đã hủy"}
                              </div>
                            )}
                            {order.status == "WAITING_FOR_PAYMENT" &&
                              order.paymentMethod == "E_WALLET" && (
                                <div className="bg-yellow-500 flex items-center text-white px-2 py-1 whitespace-nowrap">
                                  <WarningIcon />
                                  Chưa thanh toán
                                </div>
                              )}
                          </div>
                          <div className="text-lg font-semibold text-primary-color">
                            {order.totalAmount &&
                              formatPrice(order.totalAmount) + " VNĐ"}
                          </div>
                          <div className="text-text-color">
                            PTTT:{" "}
                            {order.paymentMethod == "COD"
                              ? "Thanh toán khi nhận"
                              : "Ví Vnpay"}
                          </div>
                          <div className="text-text-color">
                            Người nhận: {order.fullName}
                          </div>
                          <div className="text-text-color">
                            Số điện thoại: {order.phone}
                          </div>
                          <div className="text-text-color">
                            Địa chỉ: {order.address}
                          </div>
                          <div className="text-text-color">
                            Phí vận chuyển:{" "}
                            {order.shippingCost === 0
                              ? "Miễn phí"
                              : order.shippingCost &&
                                formatPrice(order.shippingCost) + " VNĐ"}
                          </div>
                        </div>
                        <div className="flex flex-col gap-y-2">
                          <button
                            onClick={() => {
                              handleOpenDetail(order.orderId);
                            }}
                            className={`${"bg-primary-color"}  text-white px-4 py-2 w-[136px] rounded-xl text-center hover:opacity-55`}
                          >
                            Chi tiết
                          </button>
                          {order.status == "WAITING_FOR_PAYMENT" &&
                            order.paymentMethod == "E_WALLET" && (
                              <button
                                onClick={() => {
                                  handleRePayoutOrder(order.orderId);
                                }}
                                className={`${"bg-yellow-500"}  text-white px-4 py-2 w-[136px] whitespace-nowrap rounded-xl text-center hover:opacity-55`}
                              >
                                Thanh toán lại
                              </button>
                            )}

                          {order.status === "DELIVERED" && (
                            <button
                              onClick={async () => {
                                await handleSetOrdersDetail(
                                  order.orderId,
                                  order.isRated
                                );
                                setIsOpenRatingDialog(true);
                              }}
                              className={`${"bg-primary-color"}  text-white px-4 py-2 w-[136px] whitespace-nowrap rounded-xl text-center cursor-pointer hover:opacity-55`}
                            >
                              {order.isRated ? "Xem đánh giá" : "Đánh giá"}
                            </button>
                          )}
                          {(order.status === "PENDING" ||
                            order.status === "WAITING_FOR_PAYMENT") && (
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenCancelOrder(order.orderId)
                              }
                              className={`${"bg-red-400"}  text-white px-4 py-2 rounded-xl text-center hover:opacity-55`}
                            >
                              Hủy
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <EmptyOrder />
              )}
            </>
          )}
          {orderStatus === 1 && (
            <>
              {orders.filter((order) => order.status == "WAITING_FOR_PAYMENT")
                .length > 0 ? (
                orders &&
                orders
                  .filter((order) => order.status == "WAITING_FOR_PAYMENT")
                  .map((order, index) => {
                    return (
                      <div
                        key={order.orderId}
                        className={`p-6 ${
                          index !==
                            orders.filter(
                              (order) => order.status == "WAITING_FOR_PAYMENT"
                            ).length -
                              1 && "border-b border-border-color"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-x-2 text-text-color font-semibold mb-2">
                              <span className="text-xl">#{order.orderId}</span>
                              {order.status && (
                                <div
                                  className={`${"bg-text-light-color"} w-[136px] text-center text-white`}
                                >
                                  Chờ thanh toán
                                </div>
                              )}
                              {order.status == "WAITING_FOR_PAYMENT" &&
                                order.paymentMethod == "E_WALLET" && (
                                  <div className="bg-yellow-500 flex items-center text-white px-2 py-1 whitespace-nowrap">
                                    <WarningIcon />
                                    Chưa thanh toán
                                  </div>
                                )}
                            </div>
                            <div className="text-lg font-semibold text-primary-color">
                              {order.totalAmount &&
                                formatPrice(order.totalAmount) + " VNĐ"}
                            </div>
                            <div className="text-text-color">
                              PTTT:{" "}
                              {order.paymentMethod == "COD"
                                ? "Thanh toán khi nhận"
                                : "Ví Vnpay"}
                            </div>
                            <div className="text-text-color">
                              Người nhận: {order.fullName}
                            </div>
                            <div className="text-text-color">
                              Số điện thoại: {order.phone}
                            </div>
                            <div className="text-text-color">
                              Địa chỉ: {order.address}
                            </div>
                            <div className="text-text-color">
                              Phí vận chuyển:{" "}
                              {order.shippingCost === 0
                                ? "Miễn phí"
                                : order.shippingCost &&
                                  formatPrice(order.shippingCost) + " VNĐ"}
                            </div>
                          </div>
                          <div className="flex flex-col gap-y-2">
                            <button
                              onClick={() => {
                                handleOpenDetail(order.orderId);
                              }}
                              className={`${"bg-primary-color"}  text-white px-4 py-2 w-[136px] rounded-xl text-center hover:opacity-55`}
                            >
                              Chi tiết
                            </button>

                            {order.status == "WAITING_FOR_PAYMENT" &&
                              order.paymentMethod == "E_WALLET" && (
                                <button
                                  onClick={() => {
                                    handleRePayoutOrder(order.orderId);
                                  }}
                                  className={`${"bg-yellow-500"}  text-white px-4 py-2 w-[136px] whitespace-nowrap rounded-xl text-center hover:opacity-55`}
                                >
                                  Thanh toán lại
                                </button>
                              )}

                            <button
                              type="button"
                              onClick={() =>
                                handleOpenCancelOrder(order.orderId)
                              }
                              className={`${"bg-red-400"}  text-white px-4 py-2 rounded-xl text-center hover:opacity-55`}
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <EmptyOrder />
              )}
            </>
          )}
          {orderStatus === 2 && (
            <>
              {orders.filter((order) => order.status == "PENDING").length >
              0 ? (
                orders &&
                orders
                  .filter((order) => order.status == "PENDING")
                  .map((order, index) => {
                    return (
                      <div
                        key={order.orderId}
                        className={`p-6 ${
                          index !==
                            orders.filter((order) => order.status == "PENDING")
                              .length -
                              1 && "border-b border-border-color"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-x-2 text-text-color font-semibold mb-2">
                              <span className="text-xl">#{order.orderId}</span>
                              {order.status && (
                                <div
                                  className={`${"bg-text-color"} w-[136px] text-center text-white`}
                                >
                                  Chờ xác nhận
                                </div>
                              )}
                              {/* {order.status == "PENDING" &&
                                order.paymentMethod == "E_WALLET" && (
                                  <div className="bg-yellow-500 flex items-center text-white px-2 py-1 whitespace-nowrap">
                                    <WarningIcon />
                                    Chưa thanh toán
                                  </div>
                                )} */}
                            </div>
                            <div className="text-lg font-semibold text-primary-color">
                              {order.totalAmount &&
                                formatPrice(order.totalAmount) + " VNĐ"}
                            </div>
                            <div className="text-text-color">
                              PTTT:{" "}
                              {order.paymentMethod == "COD"
                                ? "Thanh toán khi nhận"
                                : "Ví Vnpay"}
                            </div>
                            <div className="text-text-color">
                              Người nhận: {order.fullName}
                            </div>
                            <div className="text-text-color">
                              Số điện thoại: {order.phone}
                            </div>
                            <div className="text-text-color">
                              Địa chỉ: {order.address}
                            </div>
                            <div className="text-text-color">
                              Phí vận chuyển:{" "}
                              {order.shippingCost === 0
                                ? "Miễn phí"
                                : order.shippingCost &&
                                  formatPrice(order.shippingCost) + " VNĐ"}
                            </div>
                          </div>
                          <div className="flex flex-col gap-y-2">
                            <button
                              onClick={() => {
                                handleOpenDetail(order.orderId);
                              }}
                              className={`${"bg-primary-color"}  text-white px-4 py-2 w-[136px] rounded-xl text-center hover:opacity-55`}
                            >
                              Chi tiết
                            </button>
                            {/* {order.status == "PENDING" &&
                              order.paymentMethod == "E_WALLET" && (
                                <button
                                  onClick={() => {
                                    handleRePayoutOrder(order.orderId);
                                  }}
                                  className={`${"bg-yellow-500"}  text-white px-4 py-2 w-[136px] whitespace-nowrap rounded-xl text-center hover:opacity-55`}
                                >
                                  Thanh toán lại
                                </button>
                              )} */}
                            {order.status === "PENDING" && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenCancelOrder(order.orderId)
                                }
                                className={`${"bg-red-400"}  text-white px-4 py-2 rounded-xl text-center hover:opacity-55`}
                              >
                                Hủy
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <EmptyOrder />
              )}
            </>
          )}
          {orderStatus === 3 && (
            <>
              {orders.filter((order) => order.status == "PROCESSING").length >
              0 ? (
                orders &&
                orders
                  .filter((order) => order.status == "PROCESSING")
                  .map((order, index) => {
                    return (
                      <div
                        key={order.orderId}
                        className={`p-6 ${
                          index !==
                            orders.filter(
                              (order) => order.status == "PROCESSING"
                            ).length -
                              1 && "border-b border-border-color"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-x-2 text-text-color font-semibold mb-2">
                              <span className="text-xl">#{order.orderId}</span>
                              {order.status && (
                                <div
                                  className={`${"bg-yellow-400"} w-[136px] text-center  text-white`}
                                >
                                  Đang xử lý
                                </div>
                              )}
                            </div>
                            <div className="text-lg font-semibold text-primary-color">
                              {order.totalAmount &&
                                formatPrice(order.totalAmount) + " VNĐ"}
                            </div>
                            <div className="text-text-color">
                              PTTT:{" "}
                              {order.paymentMethod == "COD"
                                ? "Thanh toán khi nhận"
                                : "Ví Vnpay"}
                            </div>
                            <div className="text-text-color">
                              Người nhận: {order.fullName}
                            </div>
                            <div className="text-text-color">
                              Số điện thoại: {order.phone}
                            </div>
                            <div className="text-text-color">
                              Địa chỉ: {order.address}
                            </div>
                            <div className="text-text-color">
                              Phí vận chuyển:{" "}
                              {order.shippingCost === 0
                                ? "Miễn phí"
                                : order.shippingCost &&
                                  formatPrice(order.shippingCost) + " VNĐ"}
                            </div>
                          </div>
                          <div className="flex flex-col gap-y-2">
                            <button
                              onClick={() => {
                                handleOpenDetail(order.orderId);
                              }}
                              className={`${"bg-primary-color"}  text-white px-4 py-2 w-[136px] rounded-xl text-center hover:opacity-55`}
                            >
                              Chi tiết
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <EmptyOrder />
              )}
            </>
          )}
          {orderStatus === 4 && (
            <>
              {orders.filter((order) => order.status == "SHIPPING").length >
              0 ? (
                orders &&
                orders
                  .filter((order) => order.status == "SHIPPING")
                  .map((order, index) => {
                    return (
                      <div
                        key={order.orderId}
                        className={`p-6 ${
                          index !==
                            orders.filter((order) => order.status == "SHIPPING")
                              .length -
                              1 && "border-b border-border-color"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-x-2 text-text-color font-semibold mb-2">
                              <span className="text-xl">#{order.orderId}</span>
                              {order.status && (
                                <div
                                  className={`${"bg-blue-400"} w-[136px] text-center text-white whitespace-nowrap`}
                                >
                                  Vận chuyển
                                </div>
                              )}
                            </div>
                            <div className="text-lg font-semibold text-primary-color">
                              {order.totalAmount &&
                                formatPrice(order.totalAmount) + " VNĐ"}
                            </div>
                            <div className="text-text-color">
                              PTTT:{" "}
                              {order.paymentMethod == "COD"
                                ? "Thanh toán khi nhận"
                                : "Ví Vnpay"}
                            </div>
                            <div className="text-text-color">
                              Người nhận: {order.fullName}
                            </div>
                            <div className="text-text-color">
                              Số điện thoại: {order.phone}
                            </div>
                            <div className="text-text-color">
                              Địa chỉ: {order.address}
                            </div>
                            <div className="text-text-color">
                              Phí vận chuyển:{" "}
                              {order.shippingCost === 0
                                ? "Miễn phí"
                                : order.shippingCost &&
                                  formatPrice(order.shippingCost) + " VNĐ"}
                            </div>
                          </div>
                          <div className="flex flex-col gap-y-2">
                            <button
                              onClick={() => {
                                handleOpenDetail(order.orderId);
                              }}
                              className={`${"bg-primary-color"}  text-white px-4 py-2 w-[136px] rounded-xl text-center hover:opacity-55`}
                            >
                              Chi tiết
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <EmptyOrder />
              )}
            </>
          )}
          {orderStatus === 5 && (
            <>
              {orders.filter((order) => order.status == "DELIVERED").length >
              0 ? (
                orders &&
                orders
                  .filter((order) => order.status == "DELIVERED")
                  .map((order, index) => {
                    return (
                      <div
                        key={order.orderId}
                        className={`p-6 ${
                          index !==
                            orders.filter(
                              (order) => order.status == "DELIVERED"
                            ).length -
                              1 && "border-b border-border-color"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-x-2 text-text-color font-semibold mb-2">
                              <span className="text-xl">#{order.orderId}</span>
                              {order.status && (
                                <div
                                  className={`${"bg-primary-color"} w-[136px] text-center  text-white whitespace-nowrap`}
                                >
                                  Hoàn thành
                                </div>
                              )}
                            </div>
                            <div className="text-lg font-semibold text-primary-color">
                              {order.totalAmount &&
                                formatPrice(order.totalAmount) + " VNĐ"}
                            </div>
                            <div className="text-text-color">
                              PTTT:{" "}
                              {order.paymentMethod == "COD"
                                ? "Thanh toán khi nhận"
                                : "Ví Vnpay"}
                            </div>
                            <div className="text-text-color">
                              Người nhận: {order.fullName}
                            </div>
                            <div className="text-text-color">
                              Số điện thoại: {order.phone}
                            </div>
                            <div className="text-text-color">
                              Địa chỉ: {order.address}
                            </div>
                            <div className="text-text-color">
                              Phí vận chuyển:{" "}
                              {order.shippingCost === 0
                                ? "Miễn phí"
                                : order.shippingCost &&
                                  formatPrice(order.shippingCost) + " VNĐ"}
                            </div>
                          </div>
                          <div className="flex flex-col gap-y-2">
                            <button
                              onClick={() => {
                                handleOpenDetail(order.orderId);
                              }}
                              className={`${"bg-primary-color"}  text-white px-4 py-2 rounded-xl w-[136px] text-center hover:opacity-55`}
                            >
                              Chi tiết
                            </button>

                            <button
                              onClick={async () => {
                                await handleSetOrdersDetail(
                                  order.orderId,
                                  order.isRated
                                );
                                setIsOpenRatingDialog(true);
                              }}
                              className={`${"bg-primary-color"}  text-white whitespace-nowrap px-4 py-2 rounded-xl w-[136px] cursor-pointer text-center hover:opacity-55`}
                            >
                              {order.isRated ? "Xem đánh giá" : "Đánh giá"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <EmptyOrder />
              )}
            </>
          )}
          {orderStatus === 6 && (
            <>
              {orders.filter((order) => order.status == "CANCELLED").length >
              0 ? (
                orders &&
                orders
                  .filter((order) => order.status == "CANCELLED")
                  .map((order, index) => {
                    return (
                      <div
                        key={order.orderId}
                        className={`p-6 ${
                          index !==
                            orders.filter(
                              (order) => order.status == "CANCELLED"
                            ).length -
                              1 && "border-b border-border-color"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-x-2 text-text-color font-semibold mb-2">
                              <span className="text-xl">#{order.orderId}</span>
                              {order.status && (
                                <div
                                  className={`${"bg-red-400"} w-[136px] text-center text-white`}
                                >
                                  Đã hủy
                                </div>
                              )}
                            </div>
                            <div className="text-lg font-semibold text-primary-color">
                              {order.totalAmount &&
                                formatPrice(order.totalAmount) + " VNĐ"}
                            </div>
                            <div className="text-text-color">
                              PTTT:{" "}
                              {order.paymentMethod == "COD"
                                ? "Thanh toán khi nhận"
                                : "Ví Vnpay"}
                            </div>
                            <div className="text-text-color">
                              Người nhận: {order.fullName}
                            </div>
                            <div className="text-text-color">
                              Số điện thoại: {order.phone}
                            </div>
                            <div className="text-text-color">
                              Địa chỉ: {order.address}
                            </div>
                            <div className="text-text-color">
                              Phí vận chuyển:{" "}
                              {order.shippingCost === 0
                                ? "Miễn phí"
                                : order.shippingCost &&
                                  formatPrice(order.shippingCost) + " VNĐ"}
                            </div>
                          </div>
                          <div className="flex flex-col gap-y-2">
                            <button
                              onClick={() => {
                                handleOpenDetail(order.orderId);
                              }}
                              className={`${"bg-primary-color"}  text-white px-4 py-2 w-[136px] rounded-xl text-center hover:opacity-55`}
                            >
                              Chi tiết
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <EmptyOrder />
              )}
            </>
          )}
        </div>
      </div>

      <FeedBack
        isRated={isRated}
        orderFeedBackId={orderFeedBackId}
        setOrderFeedBackId={setOrderFeedBackId}
        orderItems={ordersDetail}
        isOpenRatingDialog={isOpenRatingDialog}
        setIsOpenRatingDialog={setIsOpenRatingDialog}
      />
      <Popup
        closeButton={{
          top: "10px",
          right: "10px",
        }}
        open={isOpenCancelOrder}
        onClose={() => {
          setIsOpenCancelOrder(false);
          setTimeout(() => {
            setCancelOrderId(-1);
          }, 150);
        }}
        type="alert"
        title={"Bạn có chắc chắn muốn hủy đơn hàng này?"}
        content={
          <div className="p-4 text-red-500">
            {orders.find((order) => order.orderId === cancelOrderId)?.status ===
            "WAITING_FOR_PAYMENT"
              ? null
              : orders.find((order) => order.orderId === cancelOrderId)
                  ?.paymentMethod === "E_WALLET"
              ? "Nếu bạn đã thanh toán thì hệ thống sẽ xử lý hoàn tiền cho bạn trong vòng 2 tới 3 ngày, xác nhận hủy ?"
              : null}
          </div>
        }
        actions={
          <>
            <button
              type="button"
              className="mt-2 px-4 py-1 rounded-md w-24
                      bg-red-500 text-white self-end  hover:opacity-70 mr-3"
              onClick={() => {
                setIsOpenCancelOrder(false);
                setCancelOrderId(-1);
              }}
            >
              Hủy
            </button>
            <LoadingButton
              type="submit"
              size="small"
              className={`mt-2 px-4 py-1 rounded-md w-24
                    bg-red-500 text-white self-end  hover:opacity-70 ${
                      isCanceling && "opacity-55"
                    } transition-all`}
              loading={isCanceling}
              loadingIndicator={
                <CircularProgress className="text-white" size={16} />
              }
              disabled={isCanceling}
              variant="outlined"
              onClick={handleCancelOrder}
            >
              <span className={`${isCanceling && "text-red-500"}`}>Đồng ý</span>
            </LoadingButton>
          </>
        }
      />
      <Popup
        closeButton={{
          top: "10px",
          right: "10px",
        }}
        open={isOpenDetail}
        onClose={() => {
          setIsOpenDetail(false);
          setTimeout(() => {
            setOrderId(-1);
          }, 300);
        }}
        title={"Chi tiết đơn hàng"}
        content={
          loadingDetail ? (
            <div className="grid place-items-center w-full h-[328px]">
              <CircleLoading />
            </div>
          ) : (
            <div className="max-h-[40rem]">
              <div className="flex flex-col py-4">
                {ordersDetail &&
                  ordersDetail?.map((order) => {
                    return (
                      <div
                        key={order.orderItemId}
                        className="flex gap-x-4 px-6 py-4"
                      >
                        <div className="w-28 rounded-md">
                          <Image
                            width={100}
                            height={100}
                            src={order.image}
                            alt="order-detail-img"
                            className="w-full h-32 object-center object-cover border border-border-color"
                          />
                        </div>
                        <div className="w-5/6">
                          <Link
                            replace={true}
                            href={`/product/${order.productId}`}
                            className="text-primary-color text-md font-semibold hover:underline"
                          >
                            {order.productName}
                          </Link>
                          <div className="text-text-color text-sm">
                            Số lượng: {order.quantity}
                          </div>
                          <div className="text-text-color text-sm">
                            Giá:{" "}
                            {order.unitPrice && formatPrice(order.unitPrice)}{" "}
                            VNĐ
                          </div>
                          <div className="text-text-color text-sm">
                            Thành tiền:{" "}
                            <span className="text-md font-semibold text-secondary-color">
                              {order.amount && formatPrice(order.amount)} VNĐ
                            </span>
                          </div>
                          <div className="text-text-color text-sm">
                            Phân loại: {order.styleValues.join(", ")}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
              <div className="text-text-color text-lg font-semibold w-full px-6 py-4 pb-1 flex items-center justify-between border-t border-border-color">
                <span>Tổng tiền hàng: </span>
                <span className="text-secondary-color">
                  {ordersDetail &&
                    ordersDetail.length > 0 &&
                    formatPrice(getTotalAmount(ordersDetail))}{" "}
                  VNĐ
                </span>
              </div>

              {order && order.voucherDiscountAmount > 0 ? (
                <div className="text-lg font-semibold w-full px-6 py-1 flex items-center justify-between text-yellow-500">
                  <span>Giảm giá: </span>
                  <span className="">
                    {formatPrice(order?.voucherDiscountAmount || 0) + " VNĐ"}
                  </span>
                </div>
              ) : null}
              <div className="text-text-color text-lg font-semibold w-full px-6 pt-1 pb-1 flex items-center justify-between ">
                <span>Phí vận chuyển: </span>
                <span className="text-secondary-color">
                  {formatPrice(order?.shippingCost || 0)} VNĐ{" "}
                </span>
              </div>
              <div className="text-text-color text-lg font-semibold w-full px-6 py-4 pt-1 flex items-center justify-between">
                <span>Tổng cộng: </span>
                <span className="text-secondary-color">
                  {orders && orders.find((value) => value.orderId == orderId)
                    ? orders.find((value) => value.orderId == orderId)
                        ?.totalAmount &&
                      formatPrice(
                        orders.find((value) => value.orderId == orderId)
                          ?.totalAmount!
                      ) + " VNĐ"
                    : null}{" "}
                </span>
              </div>
            </div>
          )
        }
      />
    </>
  );
};

export default OrderTrackingPage;

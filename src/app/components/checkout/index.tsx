"use client";
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useAppDispatch, useAppSelector } from "@/src/lib/redux/hooks";
import {
  getUserProfileAsync,
  selectUser,
  selectUserStatus,
} from "@/src/lib/features/user/userSlice";
import Popup from "../Popup";
import Box from "@mui/material/Box";
import { ErrorMessage, Field, FieldProps, Form, Formik } from "formik";
import CircularProgress from "@mui/material/CircularProgress";
import {
  CartItem,
  CreateAddress,
  InstantBuyRequest,
  OrderItem,
  OrderRequest,
  Prediction,
  ProductItem,
} from "@/src/models";
import { debounce, set } from "lodash";
import { addressApi } from "../../apis/addressApi";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ErrorIcon from "@mui/icons-material/Error";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import Image from "next/image";
import Paper from "@mui/material/Paper";
import {
  getAllCheckOutItems,
  selectCheckOuts,
  selectCheckOutStatus,
} from "@/src/lib/features/checkout/checkoutSlice";
import { formatPrice, totalPrice } from "@/src/utilities/price-format";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import CircleLoading from "../Loading";
import { orderApi } from "../../apis/orderApi";
import LoadingButton from "@mui/lab/LoadingButton";
import { PayMentMethod } from "@/src/constants/paymentMethod";
import { showToast } from "@/src/lib/toastify";
import { sessionOptions } from "@/src/config/session";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";

import {
  createUserAddressAsync,
  getUserAddressAsync,
  selectAddresses,
  selectAddressesStatus,
  updateUserAddressAsync,
} from "@/src/lib/features/address/addressSlice";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { replaceSubstring } from "@/src/utilities/replace-sub-string";
import { PROVINCES } from "@/src/constants/provine";
import { productItemApi } from "../../apis/productItemApi";
import {
  getAllPromotionsAsync,
  selectPromotions,
} from "@/src/lib/features/promotion/promotionSlice";
import dayjs from "dayjs";

const CheckOutComponent = ({ isInstantBuy }: { isInstantBuy?: boolean }) => {
  const { push, replace } = useRouter();
  // Implement the CheckOut component logic here
  const promotions = useAppSelector(selectPromotions);
  const addresses = useAppSelector(selectAddresses);
  const addressStatus = useAppSelector(selectAddressesStatus);
  const checkoutItems = useAppSelector(selectCheckOuts);
  const checkoutStatus = useAppSelector(selectCheckOutStatus);
  const dispatch = useAppDispatch();
  const [addressDialog, setAddressDialog] = useState(false);
  const [addingNewAddress, setAddingNewAddress] = useState(false);
  const [haveCheckoutItems, setHaveCheckoutItems] = useState(true);
  const [isOrdering, setIsOrdering] = useState(false);
  const [isChangeAddressLoading, setIsChangeAddressLoading] = useState(false);
  const [isChangeInfoLoading, setIsChangeInfoLoading] = useState(false);
  const [isHidden, setIsHidden] = useState(true);
  const [address, setAddress] = useState("");
  const [addressSuggest, setAddressSuggest] = useState<Prediction[]>([]);
  const [updateAddress, setUpdateAddress] = useState<CreateAddress | null>(
    null
  );
  const [isUpdate, setIsUpdate] = useState(false);
  const [addressDetail, setAddressDetail] = useState<string[]>([]);
  const [updateId, setUpdateId] = useState(-1);

  const [paymentMethod, setPaymentMethod] = useState("Thanh toán khi nhận");
  const [addressError, setAddressError] = useState(false);
  const [addressErrorMessage, setAddressErrorMessage] = useState("");
  const [shippingCost, setShippingCost] = useState(0);
  const [maxQuantity, setMaxQuantity] = useState(0);

  const [fullname, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [buyNowQuantity, setBuyNowQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [promotionPrice, setPromotionPrice] = useState<number>(0);
  const [voucherId, setVoucherId] = useState<number>(-1);
  const [voucherCode, setVoucherCode] = useState<string>("");

  const [loadingVoucher, setLoadingVoucher] = useState(false);
  const [textPromotionLoading, setTextPromotionLoading] = useState(false);
  const [selectPromotionLoading, setSelectPromotionLoading] = useState(false);
  const [isOpenPromotion, setIsOpenPromotion] = useState(false);

  const addressFocusRef = useRef<HTMLInputElement | null>(null);
  const addressButtonRef = useRef<HTMLButtonElement | null>(null);
  const provincesFocusRef = useRef<HTMLInputElement | null>(null);
  const districtsFocusRef = useRef<HTMLInputElement | null>(null);
  const wardsFocusRef = useRef<HTMLInputElement | null>(null);
  const promotionCodeFocusRef = useRef<HTMLInputElement | null>(null);

  const recipientNameFocusRef = useRef<HTMLInputElement | null>(null);
  const phoneFocusRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const getAllAddress = async () => {
      const response = await addressApi.getAllUserAddresses();
      if (response?.result.content) {
        for (let address of response?.result.content) {
          if (address.defaultAddress) {
            setAddress(address.detail);
            setFullName(address.recipientName || "");
            setPhone(address.phone || "");
          }
        }
        return;
      } else {
        setAddress("");
        setFullName("");
        setPhone("");
      }
    };
    getAllAddress();
  }, []);

  useEffect(() => {
    const checkOutItems: string = isInstantBuy
      ? "instantCheckoutItems"
      : "checkoutItems";
    dispatch(getAllCheckOutItems({ itemName: checkOutItems }));
  }, [checkoutStatus]);

  useEffect(() => {
    if (isInstantBuy) {
      const instantCheckOutItems = getCookie("instantCheckoutItems");
      const promotionPrice = getCookie("instant-promotionPrice");

      if (instantCheckOutItems == undefined) {
        setHaveCheckoutItems(true);
        replace("/");
        return;
      }

      setBuyNowQuantity(JSON.parse(instantCheckOutItems)[0].quantity);
      setPrice(JSON.parse(instantCheckOutItems)[0].promotionalPrice);
      setPromotionPrice(+promotionPrice!);
    } else {
      const checkOutItems = getCookie("checkoutItems");
      const promotionPrice = getCookie("promotionPrice");
      const voucherId = getCookie("voucherId");

      const isRepayout = getCookie("isRepayout");
      if (checkOutItems == undefined) {
        setHaveCheckoutItems(true);
        replace("/cart");
        return;
      }
      if (isRepayout) {
        setPaymentMethod("Ví VNPay");
      }
      setPromotionPrice(+promotionPrice!);
      setVoucherId(+voucherId!);
    }
    setHaveCheckoutItems(false);
  }, []);

  useEffect(() => {
    async function getShippingCost(value: string) {
      if (value.trim() !== "") {
        const _address = value.trim();
        const result = await addressApi.getCordinate(_address);
        if (result) {
          const currCornidate = result;
          const shippingKm = await addressApi.getShippingKm(currCornidate);
          console.log("SHIPPINGKM", shippingKm);
          if (shippingKm) caculateShippingCost(shippingKm);
        }
      }
    }
    getShippingCost(address);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  useEffect(() => {
    const getMaxQuantity = async () => {
      const instantCheckoutItems = getCookie("instantCheckoutItems");
      if (instantCheckoutItems == undefined) {
        replace("/");
        return;
      }
      const _instantCheckoutItems = JSON.parse(instantCheckoutItems)[0];
      const response = await productItemApi.getProductItemByProductItemId(
        _instantCheckoutItems.productItemId
      );
      setMaxQuantity(response?.result.quantity! - response?.result.sold!);
    };
    if (isInstantBuy === true) {
      getMaxQuantity();
    }
  }, []);

  const convertPaymentMethod = (paymentMethod: string): PayMentMethod => {
    if (paymentMethod == "Thanh toán khi nhận") return "COD";
    else if (paymentMethod == "Ví VNPay") return "E_WALLET";
    return "COD";
  };

  const handleBlur = () => {
    // Logic để ẩn thẻ khi focus ra khỏi input
    setIsHidden(true);
  };

  const handleFocus = () => {
    // Logic khi focus vào input, có thể làm gì đó tại đây nếu cần
    setIsHidden(false);
  };

  // Function to increase or decrease cartItems quantity
  const handleQuantityChange = useCallback(
    debounce(async (value?: number, setValues?: any) => {
      const instantCheckoutItems = getCookie("instantCheckoutItems");
      if (!instantCheckoutItems) {
        replace("/");
        return;
      }
      const _instantCheckoutItems = JSON.parse(instantCheckoutItems!)[0];
      const response = await productItemApi.getProductItemByProductItemId(
        _instantCheckoutItems.productItemId
      );
      const _maxQuantity = response?.result.quantity! - response?.result.sold!;
      setMaxQuantity(_maxQuantity);
      if (value && value > _maxQuantity) {
        setValues({
          quantity: _maxQuantity,
        });
      }
    }, 500),
    [voucherId]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handlChangeAddressDebounced = useCallback(
    debounce(async function handleGetAddressSuggest(value: string) {
      if (value.trim().length > 0) {
        const result = await addressApi.getAddressSuggest(value);
        if (result) {
          setAddressSuggest(result.predictions);
        } else setAddressSuggest([]);
      } else setAddressSuggest([]);
    }, 500),
    []
  );

  const caculateShippingCost = (shippingKm: number) => {
    // const shippingKm =
    if (shippingKm <= 40) setShippingCost(0);
    if (shippingKm > 40 && shippingKm <= 100) {
      setShippingCost(20000);
    }
    if (shippingKm > 100) {
      setShippingCost(30000);
    }
  };

  const handleChangeAddress = (newAddress: string) => {
    setAddress(newAddress);
  };

  const handleShowUpdateForm = (address: any) => {
    const addressParts = address.detail.split(",");
    console.log(addressParts);
    setUpdateId(address.addressId);
    setAddressDetail(addressParts);
    setUpdateAddress(address);
    setIsUpdate(true);
  };

  const handleGetVoucher = async () => {
    setLoadingVoucher(true);
    setIsOpenPromotion(true);
    await dispatch(getAllPromotionsAsync(buyNowQuantity * price));
    setLoadingVoucher(false);
  };

  const handleApplyPromotionForCode = async (
    voucherId: number,
    quantity: number,
    setFieldError?: any
  ) => {
    const result = await orderApi.applyVoucher({
      voucherId,
      amount: quantity * price,
    });
    if (
      result?.message == "Amount must greater than or equal min order amount"
    ) {
      setFieldError(
        "promotionCode",
        `Đơn hàng tối thiểu ${formatPrice(
          (result.result as any).minOrderAmount
        )} VNĐ để áp dụng mã giảm giá này`
      );
      showToast(
        `Voucher bị hủy vì đơn hàng thấp hơn  ${formatPrice(
          (result.result as any).minOrderAmount
        )} VNĐ`,
        "error",
        "top-right",
        3000
      );
      setVoucherId(-1);
      setPromotionPrice(0);
      setVoucherCode("");
      setIsOpenPromotion(false);
      return;
    } else if (result?.statusCode != 200) {
      showToast("Mã giảm giá không hợp lệ", "error");
      return;
    }
    setPromotionPrice(result?.result || 0);
    // Call api to apply promotion
    setIsOpenPromotion(false);
  };

  const handleSubmitOrder = async () => {
    //If user doesn't have address, show error
    if (!address || (address && address.length <= 0)) {
      setAddressError(true);
      setAddressErrorMessage("Chưa có địa chỉ, vui lòng tạo mới");
      window.scrollTo(300, 0);
      addressButtonRef.current?.focus();
      return;
    } else if (fullname == "" || phone == "") {
      setAddressError(true);
      setAddressErrorMessage("Chưa có tên và số điện thoại người nhận");
      window.scrollTo(300, 0);
      addressButtonRef.current?.focus();
      return;
    }

    setAddressError(false);

    //Prevent user from spamming the button
    if (isOrdering) return;

    setIsOrdering(true);

    //Get payment method and cart item ids
    const _paymentMethod = convertPaymentMethod(paymentMethod);
    const _cartItemIds = checkoutItems
      .map((item) => {
        if ("cartItemId" in item) {
          return item.cartItemId;
        }
        return null;
      })
      .filter((id) => id !== null) as number[];
    //Get the order request
    const orderRequest: OrderRequest = {
      cartItemIds: _cartItemIds,
      fullName: fullname,
      phone: phone,
      address: address,
      shippingCost: shippingCost,
      paymentMethod: _paymentMethod,
      voucherId: voucherId == -1 ? null : voucherId,
    };

    //Loic xử lý chức năng thanh toán lại đơn hàng E_WALLET đã hủy ở đây
    // debugger;
    const isRePayout = getCookie("isRepayout");
    const orderId = getCookie("orderId");
    if (isRePayout && orderId && !isInstantBuy) {
      const rePayoutrequest: Omit<OrderRequest, "cartItemIds" | "voucherId"> = {
        fullName: orderRequest.fullName,
        phone: orderRequest.phone,
        address: orderRequest.address,
        shippingCost: orderRequest.shippingCost,
        paymentMethod: orderRequest.paymentMethod,
      };
      const repayOut = await orderApi.rePayoutOrder(+orderId, rePayoutrequest);
      if (repayOut?.statusCode == 400) {
        showToast("Số lượng sản phẩm không đủ trong kho", "error", "top-right");
        deleteCookie("instantCheckoutItems");
        setIsOrdering(false);
        replace("/cart");
        return;
      } else if (repayOut?.statusCode == 404) {
        showToast(
          "Sản phẩm đã bị vô hiệu hóa, vui lòng chọn sản phẩm khác",
          "error",
          "top-right"
        );
        deleteCookie("instantCheckoutItems");
        setIsOrdering(false);
        replace("/cart");
        return;
      }

      if (repayOut?.statusCode !== 200) {
        showToast("Có lỗi xảy ra, vui lòng thử lại", "error", "top-right");
        setIsOrdering(false);
        deleteCookie("checkoutItems");
        replace("/cart");
        return;
      }

      await navigateBaseOnMethod(+orderId, _paymentMethod);
      deleteCookie("orderId");
      deleteCookie("isRepayout");
      setIsOrdering(false);
      return;
    }

    //Loic xử lý chức năng mua ngay ở đây
    // debugger;
    if (isInstantBuy == true) {
      const instantBuyRequest: InstantBuyRequest = {
        productItemId: checkoutItems[0].productItemId,
        quantity: buyNowQuantity,
        promotionalPrice: price,
        fullName: fullname,
        phone: phone,
        address: address,
        shippingCost: shippingCost,
        voucherId: voucherId == -1 ? null : voucherId,
        paymentMethod: _paymentMethod,
      };
      const instantBuyOrder = await orderApi.instantBuy(instantBuyRequest);
      if (instantBuyOrder?.statusCode == 400) {
        showToast("Số lượng sản phẩm không đủ trong kho", "error", "top-right");
        deleteCookie("instantCheckoutItems");
        setIsOrdering(false);
        replace("/");
        return;
      } else if (instantBuyOrder?.statusCode == 404) {
        showToast(
          "Sản phẩm đã bị vô hiệu hóa, vui lòng chọn sản phẩm khác",
          "error",
          "top-right"
        );
        deleteCookie("instantCheckoutItems");
        deleteCookie("instant-promotionPrice");
        setIsOrdering(false);
        replace("/");
        return;
      } else if (
        instantBuyOrder?.message ==
        "The promotional price has changed. Please review the price and try again"
      ) {
        showToast(
          "Giá của sản phẩm này đã bị thay đổi, vui lòng thử lại",
          "error",
          "top-right"
        );
        deleteCookie("instantCheckoutItems");
        deleteCookie("instant-promotionPrice");
        setIsOrdering(false);
        replace("/");
        return;
      }
      if (instantBuyOrder?.statusCode !== 200) {
        showToast("Có lỗi xảy ra, vui lòng thử lại", "error", "top-right");
        setIsOrdering(false);
        deleteCookie("instantCheckoutItems");
        deleteCookie("instant-promotionPrice");
        replace("/");
        return;
      }
      await navigateBaseOnMethod(
        instantBuyOrder.result.content.orderId,
        _paymentMethod
      );
      setIsOrdering(false);
      return;
    }

    // Logic xử lý đặt hàng bình thường ở đây
    const response = await orderApi.makeAnOrder(orderRequest);
    if (response?.statusCode == 400) {
      showToast("Số lượng sản phẩm không đủ trong kho", "error", "top-right");
      setIsOrdering(false);
      replace("/cart");
      return;
    } else if (response?.statusCode == 404) {
      showToast(
        "Sản phẩm đã bị vô hiệu hóa, vui lòng chọn sản phẩm khác",
        "error",
        "top-right"
      );
      deleteCookie("instantCheckoutItems");
      setIsOrdering(false);
      replace("/cart");
      return;
    }
    if (response?.statusCode !== 200) {
      showToast("Có lỗi xảy ra, vui lòng thử lại", "error", "top-right");
      setIsOrdering(false);
      // replace("/cart");
      return;
    }
    await navigateBaseOnMethod(response.result.content.orderId, _paymentMethod);

    setIsOrdering(false);
  };

  const handleUpdateAddress = async (request: {
    addressId: number;
    address: string;
    phone: string;
    recipientName: string;
  }) => {
    await dispatch(updateUserAddressAsync(request));

    addresses.forEach((item) => {
      if (item.addressId == request.addressId) {
        setAddress(request.address);
        setFullName(request.recipientName || "");
        setPhone(request.phone || "");
      }
    });

    setTimeout(() => {
      setIsUpdate(false);
      setUpdateAddress(null);
      setUpdateId(-1);
      setAddressSuggest([]);
    }, 200);
  };

  const navigateBaseOnMethod = async (
    orderId: number,
    paymentMethod: PayMentMethod
  ) => {
    if (paymentMethod === "COD") {
      showToast(`Đặt hàng thành công`, "success", "top-right");
      replace("/account/order-tracking");
    } else if (paymentMethod === "E_WALLET") {
      setCookie("isVNPayment", true, sessionOptions(5 * 60));
      const vnPayResponse = await orderApi.vnPayCheckout(orderId);
      if (vnPayResponse?.success == false) {
        showToast("Có lỗi xảy ra, vui lòng thử lại", "error");
        replace("/");
      } else window.location.href = vnPayResponse?.result!;
    }
    // Reset lại các state và cookie
    deleteCookie("checkoutItems");
    deleteCookie("promotionPrice");
    deleteCookie("instantCheckoutItems");
    deleteCookie("instant-promotionPrice");
  };

  if (haveCheckoutItems) {
    return (
      <div className="h-[80vh] w-full grid place-items-center">
        <CircleLoading />
      </div>
    ); // or return a loading spinner
  }

  return (
    <div className="lg:container px-4 py-4 lg:py-8 relative">
      <div className="space-y-4">
        <div className={`shadow-sm border border-border-color bg-white p-4`}>
          <h1
            className="text-base font-semibold  text-secondary-color max-md:text-center flex 
            items-center mb-2"
          >
            <LocationOnIcon className="mr-0.5 -translate-x-1" />
            Thông tin người nhận
          </h1>
          <div className="flex xl:gap-x-8 max-xl:justify-between items-center">
            <div>
              <span className="inline font-semibold border-r border-text-light-color pr-2">
                {fullname?.length == 0 ? "Chưa đặt tên" : fullname}
              </span>
              <span className="font-semibold">
                {phone?.length == 0
                  ? " Chưa đặt số điện thoại"
                  : ` (+84) ${phone}`}
              </span>
            </div>
            <div className="flex gap-x-4 items-center max-md:flex-col">
              <div className="flex items-center gap-x-4">
                <p className="text-center max-lg:hidden">
                  {address && address.length > 0 ? (
                    address
                  ) : (
                    <span className="text-text-color font-bold">
                      Chưa có địa chỉ
                    </span>
                  )}
                </p>
                {/* {addresses &&
                  address == userInfo.addresses[0] &&
                  address.length > 0 && (
                    <div className="border border-secondary-color text-secondary-color px-1 py-0.25 text-ssm max-lg:hidden">
                      Mặc định
                    </div>
                  )} */}
                {getCookie("isRepayout") && !isInstantBuy ? null : (
                  <button
                    ref={addressButtonRef}
                    onClick={() => setAddressDialog(true)}
                    className="px-3 py-2 bg-secondary-color text-white hover:opacity-55 w-max"
                  >
                    {address && address.length > 0
                      ? "Thay đổi"
                      : "Thêm địa chỉ"}
                  </button>
                )}
              </div>
              {addressError && (
                <div className="flex items-center max-md:items-start max-md:mt-2 gap-x-2 text-sm font-semibold text-red-500 animate-appear">
                  <ErrorIcon className="size-5" />
                  <span>{addressErrorMessage}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center max-sm:justify-between">
            <p className="text-left mt-2 max-w-[310px] lg:hidden">
              {address && address.length > 0 ? (
                address
              ) : (
                <span className="text-text-color font-bold">
                  Chưa có địa chỉ
                </span>
              )}
            </p>
            {/* {userInfo.addresses &&
              address == userInfo.addresses[0] &&
              address.length > 0 && (
                <div className="border border-secondary-color text-secondary-color px-1 py-0.25 text-ssm w-fit mt-0.5 lg:hidden">
                  Mặc định
                </div>
              )} */}
          </div>
          <Popup
            closeButton={{
              top: "4px",
              right: "5px",
            }}
            open={addressDialog}
            onClose={() => {
              setAddressDialog(false);
              setAddressSuggest([]);
              setIsHidden(false);
              setTimeout(() => {
                setAddingNewAddress(false);
                setIsUpdate(false);
                setAddressDetail([]);
                setUpdateAddress(null);
                setUpdateId(-1);
              }, 500);
            }}
            title={
              addingNewAddress == true
                ? "Tạo mới địa chỉ"
                : isUpdate
                ? "Cập nhật địa chỉ"
                : "Thay đổi thông tin"
            }
            content={
              addingNewAddress || isUpdate ? (
                <div className="flex flex-col gap-y-1 p-4 min-w-[280px] lg:min-w-[600px] h-128">
                  <Formik<{
                    recipientName: string;
                    phone: string;
                    newAddress: string;
                    provinces: string;
                    districts: string;
                    wards: string;
                  }>
                    initialValues={
                      updateAddress
                        ? {
                            recipientName: updateAddress?.recipientName ?? "",
                            phone: updateAddress?.phone ?? "",
                            newAddress: addressDetail[0].trim() ?? "",
                            provinces: addressDetail[3].trim() ?? "",
                            districts: addressDetail[2].trim() ?? "",
                            wards: addressDetail[1].trim() ?? "",
                          }
                        : {
                            recipientName: "",
                            phone: "",
                            newAddress: "",
                            provinces: "",
                            districts: "",
                            wards: "",
                          }
                    }
                    enableReinitialize={true}
                    validateOnBlur={false}
                    validateOnChange={false}
                    validate={(values) => {
                      const errors: {
                        recipientName: string;
                        phone: string;
                        address: string;
                        provinces: string;
                        districts: string;
                        wards: string;
                      } = {
                        recipientName: "",
                        phone: "",
                        address: "",
                        provinces: "",
                        districts: "",
                        wards: "",
                      };

                      //Validate recipientName
                      if (values.recipientName?.length < 1) {
                        errors.recipientName = "Tên không được để trống";
                        recipientNameFocusRef.current?.focus();
                        return errors;
                      }

                      // Validate phone
                      if (values.phone == null || values.phone == "") {
                        errors.phone = "Vui lòng nhập số điện thoại";
                        phoneFocusRef.current?.focus();
                        return errors;
                      } else if (!/^(0)\d{9}$/i.test(values.phone)) {
                        errors.phone = "Số điện thoại không hợp lệ";
                        phoneFocusRef.current?.focus();
                        return errors;
                      }

                      if (!values.provinces || values.provinces.length == 0) {
                        errors.provinces = "Tỉnh/thành phố không được bỏ trống";
                        provincesFocusRef.current?.focus();
                        return errors;
                      }
                      if (
                        values.provinces.length != 0 &&
                        (!values.districts || values.districts.length == 0)
                      ) {
                        errors.districts = "Quận/Huyện không được bỏ trống";
                        districtsFocusRef.current?.focus();
                        return errors;
                      }
                      if (
                        values.provinces.length != 0 &&
                        values.districts.length != 0 &&
                        (!values.wards || values.wards.length == 0)
                      ) {
                        errors.wards = "Phường/xã không được bỏ trống";
                        wardsFocusRef.current?.focus();
                        return errors;
                      }

                      if (!values.newAddress || values.newAddress.length == 0) {
                        errors.address = "Địa chỉ không được bỏ trống";
                        addressFocusRef.current?.focus();
                        return errors;
                      } else if (values.newAddress.length < 5) {
                        errors.address = "Địa chỉ này quá ngắn";
                        addressFocusRef.current?.focus();

                        return errors;
                      } else if (
                        addresses.length > 0 &&
                        addresses.find(
                          (item) => item.detail == values.newAddress
                        )
                      ) {
                        errors.address = "Địa chỉ này đã tồn tại";
                        addressFocusRef.current?.focus();

                        return errors;
                      } else if (
                        /phường|xã|huyện|quận|tỉnh|thành phố/i.test(
                          values.newAddress.toLowerCase()
                        )
                      ) {
                        errors.address =
                          "Địa chỉ cụ thể không bao gồm các hậu tố phường, xã, thành phố";
                        addressFocusRef.current?.focus();
                        return errors;
                      } else if (
                        !/^(\d+[A-Za-z]*(\/\d+[A-Za-z]*)*)*\s+.+$/.test(
                          values.newAddress
                        )
                      ) {
                        errors.address =
                          "Địa chỉ phải bao gồm số nhà và tên đường";
                        // addressFocusRef.current?.focus();
                        return errors;
                      }
                    }}
                    onSubmit={async (values, { setSubmitting, resetForm }) => {
                      setIsChangeInfoLoading(true);
                      let finalAddress = values.newAddress;
                      const addressParts = [values.provinces, values.districts];

                      for (let part of addressParts) {
                        finalAddress = replaceSubstring(
                          finalAddress,
                          part,
                          ""
                        ).replace(",", " ");
                      }
                      finalAddress = `${finalAddress}, ${values.wards}, ${values.districts}, ${values.provinces}`;
                      const payload = {
                        address: finalAddress,
                        recipientName: values.recipientName ?? "",
                        phone: values.phone ?? "",
                      };

                      if (isUpdate) {
                        await handleUpdateAddress({
                          addressId: updateId,
                          ...payload,
                        });
                      } else {
                        await dispatch(createUserAddressAsync(payload));
                      }

                      if (addressStatus == "failed") {
                        showToast("Thêm địa chỉ thất bại", "error");
                      }

                      setTimeout(() => {
                        setSubmitting(false);
                        setAddingNewAddress(false);
                        setIsChangeInfoLoading(false);
                        setIsUpdate(false);
                        resetForm();
                        setAddressSuggest([]);
                      }, 100);
                    }}
                  >
                    {({
                      isSubmitting,
                      errors,
                      submitForm,
                      resetForm,
                      dirty,
                      setFieldValue,
                      setFieldError,
                      values,
                    }) => {
                      const provinceList: string[] =
                        PROVINCES &&
                        PROVINCES.map((item: any) => (item = item.name));

                      const districtList: string[] =
                        values.provinces && values.provinces != ""
                          ? PROVINCES.find(
                              (item: any) => item.name == values.provinces
                            )!.districts.map(
                              (item: any) => (item = item.name)
                            ) || []
                          : [];
                      const wardList: string[] =
                        values.provinces &&
                        values.provinces != "" &&
                        values.districts &&
                        values.districts != ""
                          ? PROVINCES.find(
                              (item: any) => item.name == values.provinces
                            )!
                              .districts.find(
                                (item: any) => item.name == values.districts
                              )!
                              .wards.map((item: any) => (item = item.name))
                          : [];
                      // console.log("DistrictList", districtList);
                      // console.log("WardList", wardList);
                      // console.log("Districts", values.districts);
                      return (
                        <Form className="flex flex-col gap-y-1 relative h-full">
                          <div className="flex flex-col gap-x-2">
                            <label
                              className="py-1 px-0.5 text-sm font-semibold"
                              htmlFor="recipientName"
                            >
                              Họ và tên
                            </label>
                            <Field
                              disabled={isChangeInfoLoading}
                              innerRef={recipientNameFocusRef}
                              className={`rounded-md px-3 py-1.5 flex-1 mb-3 text-sm ${
                                isChangeInfoLoading && "opacity-55"
                              } ${
                                errors.recipientName && "border-red-500"
                              } transition-all`}
                              type="text"
                              id="recipientName"
                              name="recipientName"
                            />
                            <ErrorMessage name="recipientName" component="div">
                              {(msg) => (
                                <div className="flex gap-x-2 text-sm text-red-500 animate-appear">
                                  <ErrorIcon className="size-5" />
                                  {msg}
                                </div>
                              )}
                            </ErrorMessage>
                          </div>
                          <div className="flex flex-col gap-x-2">
                            <label
                              className="py-1 px-0.5 text-sm font-semibold"
                              htmlFor="phone"
                            >
                              Số điện thoại
                            </label>
                            <Field
                              disabled={isChangeInfoLoading}
                              className={`rounded-md px-3 py-1.5 flex-1 mb-3 text-sm ${
                                isChangeInfoLoading && "opacity-55"
                              } ${
                                errors.phone && "border-red-500"
                              } transition-all`}
                              innerRef={phoneFocusRef}
                              type="text"
                              id="phone"
                              name="phone"
                            />
                            <ErrorMessage name="phone" component="div">
                              {(msg) => (
                                <div
                                  className="flex gap-x-2 text-sm text-red-500 animate-appear
                    "
                                >
                                  <ErrorIcon className="size-5" />
                                  {msg}
                                </div>
                              )}
                            </ErrorMessage>
                          </div>
                          <label
                            className="py-1 px-0.5 text-sm font-semibold"
                            htmlFor="address"
                          >
                            Địa chỉ tổng quát
                          </label>
                          <div className="flex items-center gap-x-4 mb-2">
                            <Field
                              disabled={isChangeInfoLoading}
                              innerRef={provincesFocusRef}
                              name="provinces"
                            >
                              {({ form }: FieldProps) => (
                                <div className="relative w-full">
                                  <Autocomplete
                                    sx={{
                                      width: "100%",
                                      "& input": {
                                        minHeight: "32px!important",
                                        padding: "0.75rem 0.75rem!important",
                                        borderRadius: "0.375rem!important",
                                        fontSize: "0.875rem!important",
                                        lineHeight: "1.25rem!important",
                                        opacity: isChangeInfoLoading
                                          ? "0.55!important"
                                          : "",
                                        border:
                                          errors.provinces &&
                                          "1px solid red!important",
                                      },
                                    }}
                                    isOptionEqualToValue={(option, value) =>
                                      value == undefined ||
                                      value == "" ||
                                      option === value
                                    }
                                    value={values.provinces || ""}
                                    onChange={(_event, newProvinces) => {
                                      setFieldValue(
                                        "provinces",
                                        newProvinces || ""
                                      );
                                      setFieldValue("districts", "");
                                      setFieldValue("wards", "");
                                      setFieldValue("newAddress", "");
                                      setFieldError("newAddress", "");
                                      setAddressSuggest([]);
                                    }}
                                    options={provinceList}
                                    renderInput={(params) => (
                                      <TextField
                                        placeholder="Tỉnh/thành phố"
                                        {...params}
                                      />
                                    )}
                                    renderOption={(props, option) => {
                                      return (
                                        <li {...props} key={option}>
                                          <div className="px-2 py-1 text-sm whitespace-nowrap text-black w-full hover:opacity-55 transition-opacity">
                                            {option}
                                          </div>
                                        </li>
                                      );
                                    }}
                                  />
                                  <ErrorMessage
                                    name="provinces"
                                    component="div"
                                  >
                                    {(msg) => (
                                      <div
                                        className="flex gap-x-1 text-ssm text-red-500 animate-appear absolute -bottom-[1.25rem]
                                      whitespace-nowrap"
                                      >
                                        <ErrorIcon className="size-5" />
                                        {msg}
                                      </div>
                                    )}
                                  </ErrorMessage>
                                </div>
                              )}
                            </Field>

                            <Field
                              disabled={isChangeInfoLoading}
                              innerRef={districtsFocusRef}
                              name="districts"
                            >
                              {({ form }: FieldProps) => (
                                <div className="relative w-full">
                                  <Autocomplete
                                    sx={{
                                      width: "100%",
                                      "& input": {
                                        minHeight: "32px!important",
                                        padding: "0.75rem 0.75rem!important",
                                        borderRadius: "0.375rem!important",
                                        fontSize: "0.875rem!important",
                                        lineHeight: "1.25rem!important",
                                        opacity: isChangeInfoLoading
                                          ? "0.55!important"
                                          : "",
                                        border:
                                          errors.districts &&
                                          "1px solid red!important",
                                        cursor:
                                          values.provinces == ""
                                            ? "not-allowed!important"
                                            : "",
                                      },
                                    }}
                                    value={values.districts || ""}
                                    onChange={(_event, newDistricts) => {
                                      setFieldValue(
                                        "districts",
                                        newDistricts || ""
                                      );
                                      setFieldValue("wards", "");
                                      setFieldValue("address", "");
                                      setFieldError("address", "");
                                      setAddressSuggest([]);
                                    }}
                                    isOptionEqualToValue={(option, value) =>
                                      value === undefined ||
                                      value === "" ||
                                      option === value
                                    }
                                    disabled={
                                      isChangeInfoLoading ||
                                      values.provinces == ""
                                    }
                                    options={[...districtList, ""]}
                                    renderInput={(params) => (
                                      <TextField
                                        placeholder="Quận/Huyện"
                                        {...params}
                                      />
                                    )}
                                    renderOption={(props, option) => {
                                      return (
                                        <li {...props} key={option}>
                                          <div className="px-2 py-1 text-sm whitespace-nowrap text-black w-full hover:opacity-55 transition-opacity">
                                            {option}
                                          </div>
                                        </li>
                                      );
                                    }}
                                  />
                                  <ErrorMessage
                                    name="districts"
                                    component="div"
                                  >
                                    {(msg) => (
                                      <div
                                        className="flex gap-x-1 text-ssm text-red-500 animate-appear absolute -bottom-[1.25rem]
                                whitespace-nowrap"
                                      >
                                        <ErrorIcon className="size-5" />
                                        {msg}
                                      </div>
                                    )}
                                  </ErrorMessage>
                                </div>
                              )}
                            </Field>
                            <Field
                              disabled={isChangeInfoLoading}
                              innerRef={wardsFocusRef}
                              name="wards"
                            >
                              {({ form }: FieldProps) => (
                                <div className="relative w-full">
                                  <Autocomplete
                                    sx={{
                                      width: "100%",
                                      "& input": {
                                        minHeight: "32px!important",
                                        padding: "0.75rem 0.75rem!important",
                                        borderRadius: "0.375rem!important",
                                        fontSize: "0.875rem!important",
                                        lineHeight: "1.25rem!important",
                                        opacity: isChangeInfoLoading
                                          ? "0.55!important"
                                          : "",
                                        border:
                                          errors.wards &&
                                          "1px solid red!important",
                                        cursor:
                                          values.provinces == "" ||
                                          values.districts == ""
                                            ? "not-allowed!important"
                                            : "",
                                      },
                                    }}
                                    value={values.wards || ""}
                                    onChange={(_event, newWards) => {
                                      setFieldValue("wards", newWards || "");
                                      setFieldValue("address", "");
                                      setFieldError("address", "");
                                      setAddressSuggest([]);
                                    }}
                                    isOptionEqualToValue={(option, value) =>
                                      value === undefined ||
                                      value === "" ||
                                      option === value
                                    }
                                    disabled={
                                      isChangeInfoLoading ||
                                      values.provinces == "" ||
                                      values.districts == ""
                                    }
                                    options={wardList}
                                    renderInput={(params) => (
                                      <TextField
                                        placeholder="Phường/Xã"
                                        {...params}
                                      />
                                    )}
                                    renderOption={(props, option) => {
                                      return (
                                        <li {...props} key={option}>
                                          <div className="px-2 py-1 text-sm whitespace-nowrap text-black w-full hover:opacity-55 transition-opacity">
                                            {option}
                                          </div>
                                        </li>
                                      );
                                    }}
                                  />
                                  <ErrorMessage name="wards" component="div">
                                    {(msg) => (
                                      <div
                                        className="flex gap-x-1 text-ssm text-red-500 animate-appear absolute -left-[1.25rem] -bottom-[1.25rem]
                                  whitespace-nowrap"
                                      >
                                        <ErrorIcon className="size-5" />
                                        {msg}
                                      </div>
                                    )}
                                  </ErrorMessage>
                                </div>
                              )}
                            </Field>
                          </div>
                          <label
                            className="py-1 px-0.5 text-sm font-semibold"
                            htmlFor="newAddress"
                          >
                            Địa chỉ cụ thể
                          </label>
                          <div className="w-full relative">
                            <Field
                              disabled={
                                isChangeInfoLoading ||
                                (values.provinces &&
                                  values.provinces.length == 0) ||
                                (values.districts &&
                                  values.districts.length == 0) ||
                                (values.wards && values.wards.length == 0)
                              }
                              innerRef={addressFocusRef}
                              onBlur={handleBlur}
                              onFocus={handleFocus}
                              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                const addressInput = e.target.value;
                                setFieldValue("newAddress", addressInput);
                                let addressAutocomplete;
                                if (addressInput.length > 0) {
                                  addressAutocomplete = `${addressInput},${values.wards}, ${values.districts}, ${values.provinces}`;
                                } else addressAutocomplete = addressInput;
                                handlChangeAddressDebounced(
                                  addressAutocomplete
                                );
                              }}
                              maxLength={40}
                              className={`rounded-md w-full px-3 py-1.5 flex-1 mb-3 text-sm ${
                                (isChangeInfoLoading ||
                                  (values.provinces &&
                                    values.provinces.length == 0) ||
                                  (values.districts &&
                                    values.districts.length == 0) ||
                                  (values.wards && values.wards.length == 0)) &&
                                "opacity-55 cursor-not-allowed"
                              } ${
                                errors.newAddress && "border-red-500"
                              } transition-all`}
                              type="text"
                              name="newAddress"
                            />
                            <Paper className="absolute top-9 z-[2] flex flex-col shadow-hd rounded-lg w-full">
                              <div className="max-h-[11rem] overflow-auto">
                                {!isHidden &&
                                  addressSuggest &&
                                  addressSuggest.length > 0 &&
                                  addressSuggest.map((address, index) => {
                                    return (
                                      <div
                                        onMouseDown={() => {
                                          setFieldValue(
                                            "newAddress",
                                            address.structured_formatting
                                              .main_text
                                          );
                                        }}
                                        className="p-3 text-sm hover:bg-primary-color hover:cursor-pointer hover:text-white outline outline-1 outline-border-color"
                                        key={index}
                                      >
                                        {
                                          address.structured_formatting
                                            .main_text
                                        }
                                      </div>
                                    );
                                  })}
                              </div>
                            </Paper>
                          </div>
                          <ErrorMessage name="newAddress" component="div">
                            {(msg) => (
                              <div
                                className="flex gap-x-2 text-sm text-red-500 animate-appear
                    "
                              >
                                <ErrorIcon className="size-5" />
                                {msg}
                              </div>
                            )}
                          </ErrorMessage>
                          <div className="absolute bottom-0 right-0 flex gap-x-2 justify-end">
                            <button
                              type="button"
                              className="mt-2 px-4 py-1 rounded-md
                      bg-secondary-color text-white self-end  hover:opacity-70"
                              onClick={() => {
                                setAddingNewAddress(false);
                                setIsUpdate(false);
                                setAddressDetail([]);
                                setUpdateAddress(null);
                                setUpdateId(-1);
                                resetForm();
                                setAddressSuggest([]);
                              }}
                            >
                              Quay lại
                            </button>
                            <LoadingButton
                              type="submit"
                              size="small"
                              className={`mt-2 px-4 py-1 rounded-md
                    bg-secondary-color text-white self-end whitespace-nowrap  hover:opacity-70 ${
                      (!dirty || isChangeInfoLoading) && "opacity-55"
                    } transition-all`}
                              loading={isSubmitting}
                              loadingIndicator={
                                <CircularProgress
                                  className="text-white"
                                  size={16}
                                />
                              }
                              disabled={!dirty || isChangeInfoLoading}
                              variant="outlined"
                              onClick={submitForm}
                            >
                              <span
                                className={`${
                                  isSubmitting && "text-secondary-color"
                                }`}
                              >
                                {isUpdate ? "Cập nhật" : "Tạo mới"}
                              </span>
                            </LoadingButton>
                          </div>
                        </Form>
                      );
                    }}
                  </Formik>
                </div>
              ) : addresses && addresses.length > 0 ? (
                <div className="flex flex-col gap-y-1 p-2">
                  <Formik
                    initialValues={{
                      fullname: fullname ?? "",
                      phone: phone ?? "",
                      address: address,
                    }}
                    enableReinitialize={true}
                    validateOnBlur={false}
                    validateOnChange={false}
                    validate={(values) => {
                      const errors = {
                        fullname: "",
                        phone: "",
                      };

                      //Validate fullname
                      // if (values.fullname?.length < 1) {
                      //   errors.fullname = "Tên không được để trống";
                      //   recipientNameFocusRef.current?.focus();
                      //   return errors;
                      // }

                      // Validate phone
                      // if (values.phone == null || values.phone == "") {
                      //   errors.phone = "Vui lòng nhập số điện thoại";
                      //   phoneFocusRef.current?.focus();
                      //   return errors;
                      // } else if (!/^(0)\d{9}$/i.test(values.phone)) {
                      //   errors.phone = "Số điện thoại không hợp lệ";
                      //   phoneFocusRef.current?.focus();
                      //   return errors;
                      // }
                    }}
                    onSubmit={(values, { setSubmitting }) => {
                      setIsChangeAddressLoading(true);
                      setSubmitting(true);

                      if (!values.fullname || !values.phone) {
                        showToast(
                          "Địa chỉ này đang thiếu tên hoặc số điện thoại",
                          "error"
                        );
                        setIsChangeAddressLoading(false);
                        setSubmitting(false);
                        return;
                      }

                      setTimeout(() => {
                        setFullName(values.fullname);
                        setPhone(values.phone);
                        setIsChangeAddressLoading(false);
                        setSubmitting(false);
                        handleChangeAddress(values.address);
                        setAddressDialog(false);
                      }, 500);
                    }}
                  >
                    {({ setFieldValue, submitForm, isSubmitting, errors }) => (
                      <Form className="flex flex-col">
                        <Box className="flex flex-col gap-y-2">
                          <div className="flex flex-col">
                            {addresses &&
                              addresses.map((address, index) => (
                                <label
                                  key={address.detail}
                                  className={`w-full flex items-start py-2 pb-4 px-1 text-sm font-semibold
                                         ${
                                           index != addresses.length - 1 &&
                                           "border-b border-border-color"
                                         }`}
                                  htmlFor={`address.${address.detail}`}
                                >
                                  <Field
                                    className="mr-1 mt-1"
                                    type="radio"
                                    id={`address.${address.detail}`}
                                    name={"address"}
                                    value={address.detail}
                                    onChange={() => {
                                      setFieldValue(
                                        "fullname",
                                        address.recipientName
                                      );
                                      setFieldValue("phone", address.phone);
                                      setFieldValue("address", address.detail);
                                    }}
                                  />
                                  <div
                                    key={address.detail}
                                    className={`w-full flex items-center justify-between px-1 rounded-md`}
                                  >
                                    <div className="flex flex-col w-full max-xl:flex-col max-xl:space-y-2 max-xl:justify-start max-xl:items-start">
                                      <div className="flex space-x-2">
                                        <p className="text-base font-semibold text-primary-color pr-2 border-r border-[#ccc]">
                                          {address.recipientName ??
                                            "Chưa đặt tên"}
                                        </p>
                                        <p className="text-base font-semibold text-primary-color">
                                          {address.phone ??
                                            " Chưa đặt số điện thoại"}
                                        </p>
                                      </div>
                                      <p className="text-base font-medium text-primary-color w-[80%]">
                                        {address.detail}
                                      </p>
                                    </div>
                                    <div className="flex items-end flex-col gap-y-2">
                                      <div className="flex gap-x-2">
                                        <button
                                          onClick={(_event: any) =>
                                            handleShowUpdateForm(address)
                                          }
                                          className="text-sm text-primary-color hover:opacity-60 transition-opacity whitespace-nowrap"
                                        >
                                          Cập nhật
                                        </button>
                                      </div>
                                      {address.defaultAddress && (
                                        <div
                                          className="border border-secondary-color text-secondary-color px-3 py-1.5 text-ssm h-fit
                                whitespace-nowrap"
                                        >
                                          Mặc định
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </label>
                              ))}
                          </div>
                          <button
                            onClick={() => setAddingNewAddress(true)}
                            className="ml-4 px-4 py-2 text-sm bg-secondary-color text-white hover:opacity-55 w-fit"
                          >
                            Địa chỉ mới
                          </button>
                        </Box>
                        <div className="flex gap-x-2 justify-end w-full my-4">
                          <button
                            type="button"
                            disabled={isChangeAddressLoading}
                            className={`mt-2 px-4 py-1 rounded-md w-[7rem]
                      bg-secondary-color text-white self-end  hover:opacity-70 mr-3 ${
                        isChangeAddressLoading && "opacity-55"
                      }`}
                            onClick={() => {
                              setAddressDialog(false);
                            }}
                          >
                            Hủy
                          </button>
                          <LoadingButton
                            disabled={isChangeAddressLoading}
                            size="small"
                            type="submit"
                            loading={isSubmitting}
                            loadingIndicator={
                              <CircularProgress
                                className="text-white"
                                size={16}
                              />
                            }
                            className={`mt-2 px-4 py-1 rounded-md text-white w-[7rem] ${
                              isChangeAddressLoading &&
                              "opacity-55 !text-secondary-color"
                            } bg-secondary-color  text-base self-end transition-all  hover:opacity-70`}
                          >
                            Xác nhận
                          </LoadingButton>
                        </div>
                      </Form>
                    )}
                  </Formik>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setAddingNewAddress(true)}
                    className="ml-4 mt-4 px-4 py-2 text-sm bg-secondary-color text-white hover:opacity-55 w-fit"
                  >
                    Địa chỉ mới
                  </button>
                  <div className="h-96 w-full grid place-items-center text-lg text-secondary-color font-bold">
                    Chưa có địa chỉ nào
                  </div>
                </>
              )
            }
            addingFeatures={!addingNewAddress}
            addingContent={undefined}
          ></Popup>
        </div>
        <div
          className={`col-span-full outline outline-2 outline-border-color bg-white`}
        >
          <h1 className="shadow-sm border border-border-color bg-white p-4 flex items-center text-secondary-color font-semibold">
            <LocalMallIcon className="mr-0.5 -translate-x-1" />
            Đơn hàng
          </h1>
          <ul className="flex flex-col">
            {checkoutItems &&
              checkoutItems.map((checkoutItem: CartItem | OrderItem) => {
                return (
                  <li
                    className={`p-4 flex ${
                      checkoutItem === checkoutItems[checkoutItems.length - 1]
                        ? ""
                        : "border-b border-[#e5e5e5]"
                    }`}
                    key={checkoutItem.productItemId}
                  >
                    <div className="pr-4 float-left">
                      <Image
                        src={checkoutItem.image}
                        width={120}
                        height={120}
                        className="border boder-[#e5e5e5] size-32"
                        alt="checkout-item-img"
                      ></Image>
                    </div>
                    <div className="flex flex-col items-start w-fit text-sm py-2">
                      <h2 className=" text-text-color font-bold text-lg text-ellipsis line-clamp-2">
                        {checkoutItem.productName}
                      </h2>
                      <div className="text-secondary-color font-medium">
                        {`Giá: ${
                          "price" in checkoutItem &&
                          formatPrice(checkoutItem.promotionalPrice)
                        } VNĐ`}
                        {"price" in checkoutItem &&
                          checkoutItem.price >
                            checkoutItem.promotionalPrice && (
                            <span className="line-through text-text-light-color ml-2 text-sm">{`${
                              "price" in checkoutItem &&
                              formatPrice(checkoutItem.price)
                            } VNĐ`}</span>
                          )}
                      </div>
                      <span className="text-text-light-color font-medium">
                        Số lượng:{" "}
                        {isInstantBuy ? buyNowQuantity : checkoutItem.quantity}{" "}
                        sản phẩm
                      </span>
                      <span className="text-text-light-color font-medium">
                        Phân loại: {checkoutItem.styleValues.join(" ")}
                      </span>
                      <span className="text-secondary-color font-semibold text-[1.125rem] py-2">
                        Thành tiền:{" "}
                        {`${
                          isInstantBuy
                            ? formatPrice(buyNowQuantity * price)
                            : "price" in checkoutItem &&
                              checkoutItem.quantity *
                                checkoutItem.promotionalPrice &&
                              formatPrice(
                                checkoutItem.quantity *
                                  checkoutItem.promotionalPrice
                              )
                        } VNĐ`}
                      </span>
                    </div>
                    {isInstantBuy === true && (
                      <div className="flex items-center max-md:space-x-[70px] space-x-[74px]">
                        <Formik
                          initialValues={{ quantity: buyNowQuantity }}
                          validateOnBlur={true}
                          validateOnChange={true}
                          enableReinitialize={true}
                          validate={function (values) {
                            const errors: { quantity?: string } = {};
                            if (values.quantity < 1) {
                              errors.quantity = "Số lượng phải lớn hơn 0";
                            } else if (values.quantity > 10) {
                              errors.quantity =
                                "Số lượng không được lớn hơn 10";
                            }

                            return errors;
                          }}
                          onSubmit={function (values): void | Promise<any> {}}
                        >
                          {({ values, setValues, setFieldError }) => (
                            <>
                              <Form className={`flex flex-col translate-x-6`}>
                                <div className="flex gap-x-[1px] items-center">
                                  <button
                                    onClick={async () => {
                                      await handleQuantityChange();
                                      const quantity =
                                        values.quantity - 1 > 0
                                          ? values.quantity - 1
                                          : 1;
                                      setValues({
                                        quantity,
                                      });
                                      setBuyNowQuantity(quantity);
                                      if (voucherId != -1) {
                                        await handleApplyPromotionForCode(
                                          voucherId,
                                          quantity,
                                          setFieldError
                                        );
                                      }
                                    }}
                                    className="border border-border-color p-2"
                                  >
                                    <RemoveIcon />
                                  </button>
                                  <Field
                                    value={values.quantity}
                                    name="quantity"
                                    type="text"
                                    maxLength={10}
                                    min={1}
                                    className="border border-border-color py-2 w-16 focus:border-none text-center"
                                    onChange={async (e: {
                                      target: { value: string };
                                    }) => {
                                      const value = parseInt(e.target.value);
                                      if (isNaN(value)) {
                                        // không cho phép nhập nếu không phải là số
                                        return;
                                      }
                                      let quantity;
                                      if (e.target.value === "" || value < 1) {
                                        quantity = 1;
                                      } else if (value > maxQuantity) {
                                        quantity = maxQuantity;
                                      } else quantity = value;
                                      setValues({ quantity });
                                      setBuyNowQuantity(quantity);
                                      await handleQuantityChange(
                                        quantity,
                                        setValues
                                      );
                                      if (voucherId != -1) {
                                        await handleApplyPromotionForCode(
                                          voucherId,
                                          quantity,
                                          setFieldError
                                        );
                                      }
                                    }}
                                  />
                                  <button
                                    onClick={async () => {
                                      await handleQuantityChange();
                                      let quantity = values.quantity + 1;
                                      if (quantity > maxQuantity) {
                                        quantity = maxQuantity;
                                      }
                                      setValues({
                                        quantity,
                                      });
                                      setBuyNowQuantity(quantity);
                                      if (voucherId != -1) {
                                        await handleApplyPromotionForCode(
                                          voucherId,
                                          quantity,
                                          setFieldError
                                        );
                                      }
                                    }}
                                    className="border border-border-color p-2"
                                  >
                                    <AddIcon />
                                  </button>
                                </div>
                              </Form>
                            </>
                          )}
                        </Formik>
                      </div>
                    )}
                  </li>
                );
              })}
          </ul>
        </div>
        {isInstantBuy && (
          <div
            className="w-full text-base text-primary-color 
         bg-white flex items-center justify-between px-4 py-4 border-b border-border-color gap-x-4"
          >
            <h1
              className="text-base font-semibold  text-secondary-color max-md:text-center flex 
            items-center"
            >
              <ConfirmationNumberIcon className="mr-0.5 -translate-x-1" />
              Voucher giảm giá
            </h1>
            <div className="space-x-3 flex items-center">
              <button
                onClick={() => {
                  setPromotionPrice(0);
                  setVoucherId(-1);
                  setVoucherCode("");
                }}
                className={`${
                  promotionPrice <= 0
                    ? "hidden"
                    : " bg-primary-color px-4 py-1 text-white hover:cursor-pointer hover:opacity-55 transition-opacity"
                }`}
              >
                Hủy áp dụng
              </button>
              {voucherCode.length > 0 && (
                <div className="px-2 py-1 bg-background">
                  <p className="text-sm text-primary-color">
                    ÁP DỤNG MÃ {voucherCode}
                  </p>
                </div>
              )}
              <button
                className="hover:cursor-pointer hover:underline"
                onClick={handleGetVoucher}
              >
                Chọn hoặc nhập mã
              </button>
            </div>
          </div>
        )}

        <div className={`shadow-sm border border-border-color bg-white p-4`}>
          <h1
            className="text-base font-semibold  text-secondary-color max-md:text-center flex 
            items-center mb-2"
          >
            <LocationOnIcon className="mr-0.5 -translate-x-1" />
            Phương thức thanh toán
          </h1>

          <div className="flex justify-between max-md:justify-normal max-md:flex-col">
            <div className="py-4 flex gap-x-4">
              {["Thanh toán khi nhận", "Ví VNPay"].map((item, index) => {
                return (
                  <div className="flex items-start">
                    <button
                      onClick={() => setPaymentMethod(item)}
                      className={`border border-secondary-color w-40 text-center text-secondary-color text-sm rounded-md px-2.5 py-1.5
                                ${
                                  paymentMethod === item &&
                                  `bg-secondary-color text-white transition-colors`
                                }`}
                      key={"payment-method-" + index}
                    >
                      <span>{item}</span>
                    </button>
                    {/* {item === "Thanh toán khi nhận" && (
                      <div className="bg-secondary-color text-white px-1 py-0.25 text-ssm ml-2">
                        Mặc định
                      </div>
                    )} */}
                  </div>
                );
              })}
            </div>
            <div className="p-4 flex flex-col">
              <table className=" bg-[#f5f5f5] text-sm mb-4 w-full">
                <tbody className="">
                  <tr className="w-full border border-[#dee2e6]">
                    <td className="p-3">
                      <h1 className="text-text-color font-bold truncate">
                        Tổng tiền hàng :
                      </h1>
                    </td>

                    <td className="w-fit">
                      <span className="text-text-color font-bold">{`${
                        isInstantBuy
                          ? formatPrice(buyNowQuantity * price)
                          : totalPrice(checkoutItems)
                      } VNĐ`}</span>
                    </td>
                  </tr>
                  {promotionPrice > 0 && (
                    <tr className="w-full border border-[#dee2e6]">
                      <td className="p-3">
                        <h1 className="text-yellow-500 font-bold truncate">
                          Voucher giảm giá:
                        </h1>
                      </td>

                      <td className="w-fit">
                        <span className="text-yellow-500 font-bold">{`${
                          promotionPrice && formatPrice(promotionPrice)
                        } VNĐ`}</span>
                      </td>
                    </tr>
                  )}
                  <tr className="w-full border border-[#dee2e6]">
                    <td className="p-3">
                      <h1 className="text-text-color font-bold truncate">
                        Phí vận chuyển :
                      </h1>
                    </td>
                    <td className="w-fit">
                      <span className="text-text-color font-bold">{`${formatPrice(
                        shippingCost
                      )} VNĐ`}</span>
                    </td>
                  </tr>
                  <tr className="w-full border border-[#dee2e6]">
                    <td className="p-3">
                      <h1 className="text-text-color font-bold">
                        Phương thức thanh toán :
                      </h1>
                    </td>
                    <td className="w-[12rem]">
                      <span>{paymentMethod}</span>
                    </td>
                  </tr>
                  <tr className="w-full border border-[#dee2e6]">
                    <td className="p-3">
                      <h1 className="text-text-color font-bold truncate">
                        Thành tiền:
                      </h1>
                    </td>
                    <td className="w-fit">
                      <span className="text-secondary-color font-semibold text-lg">{`${
                        isInstantBuy
                          ? formatPrice(
                              buyNowQuantity * price +
                                shippingCost -
                                promotionPrice
                            )
                          : totalPrice(
                              checkoutItems,
                              shippingCost - promotionPrice
                            )
                      } VNĐ `}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <LoadingButton
                disabled={isOrdering}
                loading={isOrdering}
                loadingIndicator={
                  <CircularProgress className="text-white" size={24} />
                }
                onClick={() => handleSubmitOrder()}
                className={`bg-secondary-color transition-all hover:opacity-55 py-[1.125rem]
                          ${isOrdering && "opacity-55"}
                          px-6 font-medium text-white rounded-md text-base self-end`}
              >
                <span className={`${isOrdering && "text-secondary-color"}`}>
                  {paymentMethod === "Thanh toán khi nhận"
                    ? getCookie("isRepayout") && !isInstantBuy
                      ? "Cập nhật đơn hàng"
                      : "Đặt hàng"
                    : getCookie("isRepayout") && !isInstantBuy
                    ? "Thanh toán lại"
                    : "Thanh toán"}
                </span>
              </LoadingButton>
            </div>
          </div>
        </div>
      </div>
      <Popup
        voucher={true}
        closeButton={{
          right: "12px",
          top: "6px",
        }}
        open={isOpenPromotion}
        onClose={() => setIsOpenPromotion(false)}
        title={"Chọn hoặc nhập mã giảm giá"}
        actions={null}
        content={
          loadingVoucher ? (
            <div className="w-[480px] pt-4 grid place-items-center h-[510px]">
              <CircleLoading />
            </div>
          ) : (
            <Formik
              className="flex items-center gap-x-0.5"
              initialValues={{ promotionCode: "" }}
              validateOnBlur={false}
              validateOnChange={false}
              validate={function (values) {
                const errors = {
                  promotionCode: "",
                };
                if (!values.promotionCode || values.promotionCode.length == 0) {
                  errors.promotionCode = "Vui lòng nhập mã giảm giá";
                  promotionCodeFocusRef.current?.focus();
                  return;
                }
              }}
              onSubmit={async function (
                values,
                { setSubmitting, setFieldError }
              ) {
                setTextPromotionLoading(true);
                setSubmitting(true);
                const voucherCode = await orderApi.getVoucher(
                  values.promotionCode
                );

                if (voucherCode?.success) {
                  const voucherId = voucherCode.result.promotionId;
                  const code = voucherCode.result.promotionName;
                  await handleApplyPromotionForCode(
                    voucherId,
                    buyNowQuantity,
                    setFieldError
                  );
                  setVoucherId(voucherId);
                  setVoucherCode(code);
                  setTimeout(() => {
                    setSubmitting(false);
                    setTextPromotionLoading(false);
                  }, 1000);
                }
              }}
            >
              {({ isSubmitting, dirty, submitForm, errors }) => (
                <Form className="flex flex-col items-center justify-center p-4 gap-x-4">
                  <div className="flex items-center gap-x-2">
                    <ConfirmationNumberIcon className="fill-primary-color" />
                    <label
                      className="px-0.5 text-base text-primary-color"
                      htmlFor="promotionCode"
                    >
                      Mã giảm giá:
                    </label>
                    <Field
                      className={`px-3 py-1.5 text-sm ${
                        errors.promotionCode ? "border-red-500" : ""
                      }`}
                      type="text"
                      id="promotionCode"
                      name="promotionCode"
                    />

                    <LoadingButton
                      type="button"
                      size="small"
                      className={`px-4 py-1 rounded-none
                      bg-primary-color text-white self-end  hover:opacity-70 ${
                        (!dirty || textPromotionLoading) && "opacity-55"
                      } transition-all`}
                      loading={isSubmitting}
                      loadingIndicator={
                        <CircularProgress className="text-white" size={16} />
                      }
                      disabled={!dirty || textPromotionLoading}
                      variant="outlined"
                      onClick={submitForm}
                    >
                      <span
                        className={`${isSubmitting && "text-primary-color"}`}
                      >
                        Áp dụng
                      </span>
                    </LoadingButton>
                  </div>
                  <p className="w-full">
                    <ErrorMessage name="promotionCode" component="div">
                      {(msg) => (
                        <div
                          className="flex gap-x-2 text-ssm text-red-500 animate-appear mt-2
                    "
                        >
                          <ErrorIcon className="size-5" />
                          {msg}
                        </div>
                      )}
                    </ErrorMessage>
                  </p>
                  {promotions && promotions.length > 0 && (
                    <p className="w-full px-2 pt-8 text-primary-color font-bold">
                      Có thể áp dụng tối đa 1 Voucher
                    </p>
                  )}

                  <ul className="w-full px-2 py-4 space-y-4">
                    {promotions && promotions.length > 0 ? (
                      promotions.map((promotion) => {
                        return (
                          <li
                            className={`w-full flex ${
                              buyNowQuantity * price < promotion.minOrderAmount
                                ? "opacity-55"
                                : ""
                            }`}
                          >
                            <div
                              className="flex flex-1 flex-col gap-y-1 items-start bg-white shadow-sm p-4
                         border border-border-color"
                              key={promotion.promotionName}
                            >
                              <div className="flex gap-x-2">
                                <div className="px-2 py-1 bg-background">
                                  <p className="text-sm text-primary-color">
                                    {promotion.promotionName}
                                  </p>
                                </div>
                                <div className="px-2 py-1 bg-background">
                                  {promotion.promotionType ==
                                  "VOUCHER_AMOUNT" ? (
                                    <p className="text-sm text-primary-color">
                                      Giảm{" "}
                                      {formatPrice(promotion.discountByAmount)}{" "}
                                      VNĐ
                                    </p>
                                  ) : (
                                    promotion.promotionType ==
                                      "VOUCHER_PERCENT" && (
                                      <p className="text-sm text-primary-color">
                                        Giảm{" "}
                                        {promotion.discountByPercentage * 100}%
                                      </p>
                                    )
                                  )}
                                </div>
                                {voucherId !== -1 &&
                                  promotion.promotionId === voucherId && (
                                    <div className="px-2 py-1 text-ssm text-white bg-primary-color">
                                      Áp dụng
                                    </div>
                                  )}
                              </div>
                              <p className="text-sm">
                                HSD:{" "}
                                {dayjs(promotion.expireAt).format("DD/MM/YYYY")}
                              </p>
                              <p className="text-sm text-primary-color">
                                Áp dụng với đơn hàng tối thiểu{" "}
                                {formatPrice(promotion.minOrderAmount)} VNĐ
                              </p>
                              {promotion.maxPromotionAmount > 0 ? (
                                <p className="text-sm text-primary-color">
                                  Giảm tối đa:{" "}
                                  {formatPrice(
                                    promotion.maxPromotionAmount || 0
                                  ) + "VNĐ"}
                                </p>
                              ) : null}
                            </div>
                            <LoadingButton
                              type="button"
                              size="small"
                              loadingIndicator={
                                <CircularProgress
                                  className="text-primary-color"
                                  size={32}
                                />
                              }
                              disabled={
                                selectPromotionLoading ||
                                buyNowQuantity * price <
                                  promotion.minOrderAmount
                              }
                              variant="outlined"
                              onClick={async () => {
                                await handleApplyPromotionForCode(
                                  promotion.promotionId,
                                  buyNowQuantity
                                );
                                setVoucherCode(promotion.promotionName);
                                setTimeout(() => {
                                  setVoucherId(promotion.promotionId);
                                }, 100);
                              }}
                              className="grid place-items-center bg-white h-auto border border-border-color
                     border-l-0 rounded-tr-lg rounded-br-lg hover:bg-primary-color hover:text-white transition-colors px-5
                     ssm:truncate"
                            >
                              <span
                                className={`${
                                  selectPromotionLoading && "text-white"
                                }`}
                              >
                                Áp dụng
                              </span>
                            </LoadingButton>
                          </li>
                        );
                      })
                    ) : (
                      <div className="text-primary-color w-full h-48 grid place-items-center">
                        Không có voucher nào hợp lệ
                      </div>
                    )}
                  </ul>
                </Form>
              )}
            </Formik>
          )
        }
      />
    </div>
  );
};

export default CheckOutComponent;

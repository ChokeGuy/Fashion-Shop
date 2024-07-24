"use client";
import {
  changeCartItemQuantityAsync,
  deleteAllCartItemsAsync,
  deleteManyCartItemsAsync,
  deleteOneCartItemAsync,
  getAllCartItemsAsync,
  selectCarts,
  selectCartStatus,
} from "@/src/lib/features/cart/cartSlice";
import { useAppDispatch, useAppSelector } from "@/src/lib/redux/hooks";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { emptyCart } from "@/src/assests";
import { ErrorMessage, Field, Form, Formik } from "formik";
import ErrorIcon from "@mui/icons-material/Error";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import LoadingButton from "@mui/lab/LoadingButton";
import CircularProgress from "@mui/material/CircularProgress";
import { formatPrice } from "@/src/utilities/price-format";
import Link from "next/link";
import { CartItem, UpdateCartRequest } from "@/src/models";
import Popup from "../Popup";
import { debounce } from "lodash";
import { showToast } from "@/src/lib/toastify";
import { useRouter } from "next/navigation";
import { setCheckOutItems } from "@/src/lib/features/checkout/checkoutSlice";
import {
  getAllPromotionsAsync,
  selectPromotions,
  selectPromotionStatus,
} from "@/src/lib/features/promotion/promotionSlice";
import dayjs from "dayjs";
import CircleLoading from "../Loading";
import { orderApi } from "../../apis/orderApi";
import { deleteCookie, hasCookie } from "cookies-next";
const CartComponent = () => {
  const { push } = useRouter();
  // Redux toolkit Global cart items state
  const cart = useAppSelector(selectCarts);
  const promotions = useAppSelector(selectPromotions);
  const [loadingVoucher, setLoadingVoucher] = useState(false);
  //Redux cartItems dispatch actions
  const dispatch = useAppDispatch();
  const [textPromotionLoading, setTextPromotionLoading] = useState(false);
  const [selectPromotionLoading, setSelectPromotionLoading] = useState(false);
  const [isOpenPromotion, setIsOpenPromotion] = useState(false);

  const [isDelele, setIsDelete] = useState(false);
  const [isUpdateQuantity, setIsUpdateQuantity] = useState(false);
  const [isDeleteCartItems, setIsDeleteCartItems] = useState(false);

  const [promotionPrice, setPromotionPrice] = useState<number>(0);
  const [voucherId, setVoucherId] = useState<number>(-1);
  const [voucherCode, setVoucherCode] = useState<string>("");
  // State for controll cart items selection
  const [selectedCartItems, setSelectedCartItems] = useState<
    (CartItem & { selected: boolean })[]
  >([]);

  const promotionCodeFocusRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (cart && cart.cartItems && voucherId == -1) {
      setSelectedCartItems(
        cart.cartItems.map((cartItem) => ({
          ...cartItem,
          quantity: 0,
          selected: false,
        }))
      );
    }

    // Update the ref to the current status
  }, [cart]);

  //Handle select all items in cart
  const handleSelectAllCartItems = async (e: ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;

    const updatedCartItems = selectedCartItems.map((item, index) => ({
      ...item,
      selected: checked,
      quantity: checked ? cart.cartItems[index].quantity : 0,
    }));

    if (voucherId != -1) {
      await handleApplyPromotion(voucherId, updatedCartItems);
    }
    setSelectedCartItems(updatedCartItems);
  };

  const getSelectedAmount = (updatedCartItems: typeof selectedCartItems) => {
    return updatedCartItems.reduce(
      (a, b) => a + b.promotionalPrice * b.quantity,
      0
    );
  };

  const getTotalPrice = (updatedCartItems: typeof selectedCartItems) => {
    return formatPrice(
      updatedCartItems
        .filter(
          (item) =>
            item.selected &&
            item.inventory != 0 &&
            item.productItem_IsActive == true
        )
        .reduce((acc, item) => acc + item.promotionalPrice * item.quantity, 0) -
        promotionPrice
    );
  };

  // Function to increase or decrease cartItems quantity
  const handleQuantityChange = useCallback(
    debounce(async (request: UpdateCartRequest, setValues) => {
      setIsUpdateQuantity(true);
      const result = await dispatch(changeCartItemQuantityAsync(request));

      const response = (result.payload as any).response;
      if (
        response.message ==
        "Quantity must be less than or equal to the inventory"
      ) {
        showToast("Không đủ số lượng sản phẩm trong kho", "error");
        const maxQuantity = response.result;

        //Set back value to the max quantity or 1 base on response
        setValues({
          quantity: maxQuantity,
        });

        const updatedCartItems = selectedCartItems.map((item) =>
          item.cartItemId === request.cartItemId
            ? { ...item, quantity: maxQuantity }
            : item
        );

        if (voucherId != -1) {
          await handleApplyPromotion(voucherId, updatedCartItems);
        }

        // Find the item in selectedCartItems and update its quantity
        setIsUpdateQuantity(false);
        setSelectedCartItems(updatedCartItems);
        return;
        // If the request payload quantity too large, set it to 1
      } else if (response.status == 400) {
        setValues({
          quantity: 1,
        });

        const updatedCartItems = selectedCartItems.map((item) =>
          item.cartItemId === request.cartItemId
            ? { ...item, quantity: 1 }
            : item
        );

        // Find the item in selectedCartItems and update its quantity to 1

        if (voucherId != -1) {
          await handleApplyPromotion(voucherId, updatedCartItems);
        }
        setIsUpdateQuantity(false);
        setSelectedCartItems(updatedCartItems);
        return;
      }
      //If everything is ok
      // Find the item in selectedCartItems and update its quantity to new quantity
      const updatedCartItems = selectedCartItems.map((item) =>
        item.cartItemId === response.result.cartItemId
          ? {
              ...item,
              quantity: response.result.quantity,
              amount: response.result.amount,
            }
          : item
      );

      if (voucherId != -1) {
        await handleApplyPromotion(voucherId, updatedCartItems);
      }
      setIsUpdateQuantity(false);
      setSelectedCartItems(updatedCartItems);
    }, 200),
    [selectedCartItems, voucherId] // Add selectedCartItems to the dependency array
  );

  const handleOnChangeSelect = async (
    e: ChangeEvent<HTMLInputElement>,
    cartItem: CartItem
  ) => {
    const checked = e.target.checked;

    // Tạo một bản sao mới của selectedCartItems đã được cập nhật
    const updatedCartItems = selectedCartItems.map((item) =>
      item.cartItemId === cartItem.cartItemId
        ? {
            ...item,
            quantity: checked ? cartItem.quantity : 0,
            selected: checked,
          }
        : item
    );

    // Sử dụng bản sao đã cập nhật để thực hiện hành động tiếp theo
    if (voucherId != -1) {
      await handleApplyPromotion(voucherId, updatedCartItems); // Giả sử bạn có thể truyền updatedCartItems vào hàm này
    }
    // Cập nhật trạng thái selectedCartItems với bản sao mới
    setSelectedCartItems(updatedCartItems);
  };

  const handleDeleteCartItem = async (cartItemId: number) => {
    //Prevent spamming button
    if (isDeleteCartItems) return;
    setIsDeleteCartItems(true);

    //Call api to delete a cart item in database
    await dispatch(deleteOneCartItemAsync(cartItemId));

    const updateCartItems = selectedCartItems.filter(
      (item) => item.cartItemId !== cartItemId
    );
    const totalPrice =
      updateCartItems.reduce(
        (acc, item) => acc + item.promotionalPrice * item.quantity,
        0
      ) - promotionPrice;

    if (totalPrice <= 0) {
      setPromotionPrice(0);
      setVoucherId(-1);
      setVoucherCode("");
    } else if (voucherId != -1) {
      await handleApplyPromotion(voucherId, updateCartItems);
    }
    //Delete a selected cart item from UI
    setSelectedCartItems(updateCartItems);

    setIsDeleteCartItems(false);
  };

  const handleDeleteManyCartItems = async (cartItemListId: number[]) => {
    //Prevent spamming button
    if (isDeleteCartItems) return;
    setIsDeleteCartItems(true);

    //Call api to delete many cart items in database
    await dispatch(deleteManyCartItemsAsync(cartItemListId));

    showToast("Xoá thành công", "success");

    const updateCartItems = selectedCartItems.filter(
      (item) => !cartItemListId.includes(item.cartItemId)
    );
    const totalPrice =
      updateCartItems.reduce(
        (acc, item) => acc + item.promotionalPrice * item.quantity,
        0
      ) - promotionPrice;

    if (totalPrice <= 0) {
      setPromotionPrice(0);
      setVoucherId(-1);
      setVoucherCode("");
    } else if (voucherId != -1) {
      await handleApplyPromotion(voucherId, updateCartItems);
    }

    //Delete many selected cart items from UI
    setSelectedCartItems(updateCartItems);

    setIsDeleteCartItems(false);
  };

  const handleCheckout = () => {
    // Handle checkout
    const checkoutItems: CartItem[] = selectedCartItems
      .filter((item) => item.selected)
      .map(({ selected, ...item }) => item);
    if (checkoutItems.length == 0) {
      showToast("Chưa chọn sản phẩm nào!", "warning");
      return;
    }
    dispatch(
      setCheckOutItems({
        promotionPrice,
        voucherId,
        allCheckOutItems: checkoutItems,
      })
    );
    if (hasCookie("isRepayout")) {
      deleteCookie("isRepayout");
    }
    push("/checkout");
  };

  const handleGetVoucher = async () => {
    setLoadingVoucher(true);
    setIsOpenPromotion(true);
    const price = getSelectedAmount(selectedCartItems);
    await dispatch(getAllPromotionsAsync(price));
    setLoadingVoucher(false);
  };

  const handleApplyPromotion = async (
    voucherId: number,
    updatedCartItems: typeof selectedCartItems
  ) => {
    const price = getSelectedAmount(updatedCartItems);

    if (price <= 0) {
      setVoucherId(-1);
      setVoucherCode("");
      setPromotionPrice(0);
      return;
    }
    const result = await orderApi.applyVoucher({
      voucherId,
      amount: price,
    });
    if (
      result?.message == "Amount must greater than or equal min order amount"
    ) {
      showToast(
        `Voucher bị hủy vì đơn hàng thấp hơn  ${formatPrice(
          (result.result as any).minOrderAmount
        )} VNĐ`,
        "error",
        "top-right",
        3000
      );
      setVoucherId(-1);
      setVoucherCode("");
      setPromotionPrice(0);
      return;
    }
    setPromotionPrice(result?.result || 0);
  };
  const handleApplyPromotionForCode = async (
    voucherId: number,
    setFieldError?: any
  ) => {
    const price = getSelectedAmount(selectedCartItems);
    const result = await orderApi.applyVoucher({
      voucherId,
      amount: price,
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
      return;
    } else if (result?.statusCode != 200) {
      showToast("Mã giảm giá không hợp lệ", "error");
      return;
    }
    setPromotionPrice(result?.result || 0);
    // Call api to apply promotion
    setIsOpenPromotion(false);
  };

  //If cart items empty
  if (
    selectedCartItems.length == 0 ||
    (cart && cart.cartItems && cart.cartItems.length == 0)
  ) {
    return (
      <div className="h-[78vh] flex items-center justify-center flex-col gap-y-4 text-lg">
        <Image src={emptyCart} className="size-28" alt="empty-cart"></Image>
        <span className="text-center">Giỏ hàng của bạn còn trống</span>
        <Link
          href="/product"
          className="hover:opacity-55 transition-opacity  bg-primary-color text-center px-4 py-2 text-white"
        >
          Mua hàng ngay
        </Link>
      </div>
    );
  }
  return (
    <div className="lg:container px-4 py-4 lg:py-8 relative">
      <div className="space-y-4">
        <div
          className="bg-white py-5 px-8 flex items-center justify-between text-text-light-color 
        shadow-sm border border-border-color max-lg:hidden"
        >
          <FormControl component="fieldset">
            <FormControlLabel
              className=""
              control={
                <Checkbox
                  checked={selectedCartItems.every(
                    (item) => item.selected == true
                  )}
                  onChange={handleSelectAllCartItems}
                />
              }
              label={<span className="ml-4 text-sm">{"Sản phẩm"}</span>}
            />
          </FormControl>
          <div className="flex">
            <div className="w-48">Đơn Giá</div>
            <div className="w-44">Số Lượng</div>
            <div className="w-32">Số Tiền</div>
            <div className="w-[72px]">Thao Tác</div>
          </div>
        </div>
        <div
          className="bg-white pt-2 flex items-center justify-between 
        shadow-sm border border-border-color w-full overflow-auto"
        >
          <ul className="space-y-6 lg:w-full">
            <li className="flex items-center justify-between gap-x-[270px]  w-full lg:w-fit text-text-light-color px-8 py-4 border-b border-border-color lg:hidden">
              <FormControl component="fieldset">
                <FormControlLabel
                  className=""
                  control={
                    <Checkbox
                      checked={selectedCartItems.every(
                        (item) => item.selected == true
                      )}
                      onChange={handleSelectAllCartItems}
                    />
                  }
                  label={
                    <span className="ml-4 text-sm truncate">{"Sản phẩm"}</span>
                  }
                />
              </FormControl>
              <div className="flex">
                <div className="w-48">Đơn Giá</div>
                <div className="w-44">Số Lượng</div>
                <div className="w-28">Số Tiền</div>
                <div className="w-[72px]">Thao Tác</div>
              </div>
            </li>
            {cart &&
              cart.cartItems &&
              cart.cartItems.map((cartItem) => {
                return (
                  <li
                    className="flex items-center justify-between gap-y-4 gap-x-12 xl:gap-x-[7.5rem] px-8 pb-4 border-b
                     border-border-color w-full max-lg:w-fit"
                    key={cartItem.cartItemId}
                  >
                    <div
                      className={`flex gap-x-2 items-center ${
                        cartItem.productItem_IsActive == false ||
                        cartItem.inventory == 0
                          ? "opacity-50"
                          : ""
                      }`}
                    >
                      <FormControl component="fieldset">
                        <FormControlLabel
                          control={
                            <Checkbox
                              disabled={
                                cartItem.productItem_IsActive == false ||
                                cartItem.inventory == 0
                              }
                              checked={
                                cartItem.productItem_IsActive == true &&
                                cartItem.inventory !== 0 &&
                                selectedCartItems.find(
                                  (item) =>
                                    item.cartItemId === cartItem.cartItemId
                                )?.selected
                              }
                              onChange={(e) =>
                                handleOnChangeSelect(e, cartItem)
                              }
                            />
                          }
                          label={undefined}
                        />
                      </FormControl>
                      <Image
                        width={64}
                        height={64}
                        className="size-16 ml-4"
                        src={cartItem.image}
                        alt="cart-item-img"
                      ></Image>
                      <div className="text-sm text-primary-color font-semibold ml-3 w-64 lg:w-40 mr-4">
                        {cartItem.productItem_IsActive == false ||
                        cartItem.inventory == 0 ? (
                          <span>{cartItem.productName}</span>
                        ) : (
                          <Link
                            className="hover:underline hover:text-primary-color"
                            href={`product/${cartItem.productId}`}
                          >
                            {cartItem.productName}
                          </Link>
                        )}
                        <div className="xl:hidden text-text-color flex flex-col">
                          <span>Phân loại: </span>
                          <span className="">
                            {cartItem.styleValues.join(", ")}
                          </span>
                        </div>
                      </div>
                      <div className="max-xl:hidden w-[8rem]">
                        <span>Phân loại: </span>
                        <span className="">
                          {cartItem.styleValues.join(",")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-x-[3.5rem] mr-6 max-lg:translate-x-4">
                      <div
                        className={`space-x-2 w-24 text-center ${
                          cartItem.productItem_IsActive == false ||
                          cartItem.inventory == 0
                            ? "opacity-50"
                            : ""
                        }`}
                      >
                        {cartItem.promotionalPrice !== cartItem.price && (
                          <span className="line-through text-text-light-color ">
                            ₫{formatPrice(cartItem.price)}
                          </span>
                        )}
                        <span>
                          ₫
                          {cartItem.promotionalPrice &&
                            formatPrice(cartItem.promotionalPrice)}
                        </span>
                      </div>
                      <div className="flex items-center max-md:space-x-[70px] space-x-[74px]">
                        <Formik
                          initialValues={{
                            quantity:
                              cartItem.inventory == 0 ? 0 : cartItem.quantity,
                          }}
                          validateOnBlur={true}
                          validateOnChange={true}
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
                          {({ values, setValues }) => (
                            <>
                              <Form
                                className={`flex flex-col translate-x-6 ${
                                  cartItem.productItem_IsActive == false ||
                                  cartItem.inventory == 0
                                    ? "opacity-50"
                                    : ""
                                }`}
                              >
                                <div className="flex gap-x-[1px] items-center">
                                  <button
                                    type="button"
                                    disabled={
                                      cartItem.productItem_IsActive == false ||
                                      cartItem.inventory == 0 ||
                                      isUpdateQuantity == true
                                    }
                                    onClick={() => {
                                      const quantity =
                                        values.quantity - 1 > 0
                                          ? values.quantity - 1
                                          : 1;
                                      setValues({
                                        quantity,
                                      });
                                      handleQuantityChange(
                                        {
                                          cartItemId: cartItem.cartItemId,
                                          quantity,
                                        },
                                        setValues
                                      );
                                    }}
                                    className="border border-border-color p-2"
                                  >
                                    <RemoveIcon />
                                  </button>
                                  <Field
                                    disabled={
                                      cartItem.productItem_IsActive == false ||
                                      cartItem.inventory == 0
                                    }
                                    value={values.quantity}
                                    name="quantity"
                                    type="text"
                                    maxLength={10}
                                    min={1}
                                    className="border border-border-color py-2 w-14 focus:border-none text-center"
                                    onChange={(e: {
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
                                      } else if (value > cartItem.inventory) {
                                        quantity = cartItem.inventory;
                                      } else quantity = value;
                                      setValues({ quantity });
                                      handleQuantityChange(
                                        {
                                          cartItemId: cartItem.cartItemId,
                                          quantity,
                                        },
                                        setValues
                                      );
                                    }}
                                  />
                                  <button
                                    type="button"
                                    disabled={
                                      cartItem.productItem_IsActive == false ||
                                      cartItem.inventory == 0 ||
                                      isUpdateQuantity == true
                                    }
                                    onClick={() => {
                                      let quantity = values.quantity + 1;
                                      if (quantity > cartItem.inventory) {
                                        quantity = cartItem.inventory;
                                      }
                                      setValues({
                                        quantity,
                                      });
                                      handleQuantityChange(
                                        {
                                          cartItemId: cartItem.cartItemId,
                                          quantity,
                                        },
                                        setValues
                                      );
                                    }}
                                    className="border border-border-color p-2"
                                  >
                                    <AddIcon />
                                  </button>
                                </div>
                              </Form>
                              <span
                                className={`text-primary-color font-semibold w-[5.65rem] text-center break-words ${
                                  cartItem.productItem_IsActive == false ||
                                  cartItem.inventory == 0
                                    ? "opacity-50"
                                    : ""
                                }`}
                              >
                                ₫
                                {cartItem.promotionalPrice &&
                                  formatPrice(
                                    values.quantity * cartItem.promotionalPrice
                                  )}
                              </span>
                              <button
                                disabled={isDeleteCartItems}
                                onClick={async () => {
                                  await handleDeleteCartItem(
                                    cartItem.cartItemId
                                  );
                                }}
                                className="bg-primary-color rounded-md p-1 hover:opacity-60 transition-opacity max-lg:-translate-x-4"
                              >
                                <DeleteOutlineIcon className="fill-white" />
                              </button>
                            </>
                          )}
                        </Formik>
                      </div>
                    </div>
                  </li>
                );
              })}
            <li className="flex items-center justify-end gap-x-2 px-8 pb-4 w-full"></li>
          </ul>
        </div>
        <div className="sticky bottom-0 left-0 right-0">
          <div
            className="w-full h-12 text-base text-primary-color 
         bg-white flex items-center justify-between px-8 py-4 border-b border-border-color gap-x-4"
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
                disabled={selectedCartItems.every(
                  (value) => value.selected == false
                )}
                onClick={() => {
                  setPromotionPrice(0);
                  setVoucherId(-1);
                  setVoucherCode("");
                }}
                className={`${
                  promotionPrice == 0
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
                disabled={selectedCartItems.every(
                  (value) => value.selected == false
                )}
                onClick={handleGetVoucher}
                className={`${
                  selectedCartItems.every((value) => value.selected == false)
                    ? "opacity-55"
                    : "hover:cursor-pointer hover:underline"
                }`}
              >
                Chọn hoặc nhập mã
              </button>
            </div>
          </div>
          <div
            className="bg-white py-5 px-8 flex items-center max-md:flex-col max-md:items-start max-md:gap-y-4 max-md:w-full justify-between text-text-light-color 
        
         before:content-[''] before:h-0 before:absolute before:left-0 before:right-0 before:-top-5"
          >
            <div className="flex items-center max-md:justify-between max-md:w-full">
              <FormControl component="fieldset">
                <FormControlLabel
                  checked={selectedCartItems.every(
                    (item) => item.selected == true
                  )}
                  control={<Checkbox onChange={handleSelectAllCartItems} />}
                  label={<span className="ml-4 text-sm">{"Chọn tất cả"}</span>}
                />
              </FormControl>
              <button
                disabled={selectedCartItems.every(
                  (item) => item.selected === false
                )}
                onClick={() => {
                  setIsDelete(true);
                }}
                className={`hover:opacity-55 ${
                  selectedCartItems.every((item) => item.selected === false) &&
                  "opacity-55"
                } transition-opacity ml-4 bg-primary-color px-4 py-1 text-white`}
              >
                Xóa
              </button>
            </div>
            <div className="flex items-center max-md:justify-between max-md:w-full space-x-2 ">
              <div>
                <span className="max-md:inline-block">Thành tiền </span>
                <p>
                  {`(${selectedCartItems
                    .filter(
                      (item) =>
                        item.selected &&
                        item.inventory != 0 &&
                        item.productItem_IsActive == true
                    )
                    .reduce(
                      (acc, item) => acc + item.quantity,
                      0
                    )} sản phẩm):`}{" "}
                </p>
              </div>
              <div className="flex items-center gap-x-2">
                <div className="flex flex-col">
                  <span className="text-primary-color text-lg font-semibold ml-4 w-[7.25rem] lg:w-[7.5rem] break-words">
                    ₫{getTotalPrice(selectedCartItems)}
                  </span>
                  {promotionPrice && promotionPrice > 0 ? (
                    <span className="text-sm text-primary-color font-bold">
                      Tiết kiệm ₫{formatPrice(promotionPrice)}
                    </span>
                  ) : null}
                </div>
                <button
                  onClick={handleCheckout}
                  className="hover:opacity-55 transition-opacity  bg-primary-color px-5 py-2.5 text-white"
                >
                  Thanh toán
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Popup
        closeButton={{
          top: "6px",
          right: "12px",
        }}
        open={isDelele}
        onClose={() => setIsDelete(false)}
        type="alert"
        title={`Bạn có chắc muốn xóa ${
          selectedCartItems.filter((item) => item.selected).length
        } sản phẩm đã chọn khỏi giỏ hàng?`}
        content={undefined}
        actions={
          <>
            <button
              type="button"
              disabled={isDeleteCartItems}
              className={`mt-2 px-4 py-1 rounded-md ${
                isDeleteCartItems && "opacity-55"
              }
                      bg-red-500 text-white self-end  hover:opacity-70 mr-3 transition-opacity`}
              onClick={() => {
                setIsDelete(false);
              }}
            >
              Hủy
            </button>
            <LoadingButton
              disabled={isDeleteCartItems}
              loading={isDeleteCartItems}
              loadingIndicator={
                <CircularProgress className="text-white" size={16} />
              }
              className={`mt-2 px-4 py-1 rounded-md ${
                isDeleteCartItems && "opacity-55"
              }
                      bg-red-500 text-white self-end  hover:opacity-70 transition-opacity`}
              onClick={async () => {
                await handleDeleteManyCartItems(
                  selectedCartItems
                    .filter((item) => item.selected === true)
                    .map((item) => item.cartItemId)
                );
                setIsDelete(false);
              }}
              variant="outlined"
            >
              <span className={`${isDeleteCartItems && "text-red-500"}`}>
                Đồng ý
              </span>
            </LoadingButton>
          </>
        }
      />

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
                  await handleApplyPromotionForCode(voucherId, setFieldError);
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
                              getSelectedAmount(selectedCartItems) <
                              promotion.minOrderAmount
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
                                getSelectedAmount(selectedCartItems) <
                                  promotion.minOrderAmount
                              }
                              variant="outlined"
                              onClick={async () => {
                                await handleApplyPromotionForCode(
                                  promotion.promotionId
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

export default CartComponent;

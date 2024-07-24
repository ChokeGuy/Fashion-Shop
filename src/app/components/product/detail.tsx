"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import usePath from "@/src/utilities/link";
import Rating from "@mui/material/Rating";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import { Field, Form, Formik, FormikErrors } from "formik";
import Carousel from "react-multi-carousel";
import ImageMagnifier from "../ImageMagifiers";
import {
  customResponsive,
  responsive3,
} from "@/src/utilities/carouselResponsive";
import MyTabs from "../Tabs";
import RelatedProduct from "./related";
import { formatPrice } from "@/src/utilities/price-format";
import { Product, ProductItem, SingleResponse } from "@/src/models";
import {
  getUniqueColors,
  getUniqueProductItems,
  getUniqueSizes,
} from "@/src/utilities/getUniqueItem";
import { useAppDispatch, useAppSelector } from "@/src/lib/redux/hooks";
import { addItemToCartAsync } from "@/src/lib/features/cart/cartSlice";
import { showToast } from "@/src/lib/toastify";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { selectUser } from "@/src/lib/features/user/userSlice";
import { productApi } from "../../apis/productApi";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { Rating as RatingType } from "@/src/models";
import Review from "./comment";
import useExtensions from "../../hooks/use-extenstions";
import { RichTextReadOnly } from "mui-tiptap";
import Box from "@mui/material/Box";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { setCookie } from "cookies-next";
import { sessionOptions } from "@/src/config/session";

type ProductDetailProps = {
  productDetail: Product;
  productItems: ProductItem[];
  relatedProducts: Product[];
  follows: number;
  comments: RatingType[];
  totalRatings: number;
};
// Get ProductDetail and ProductItems with different sizes and colors
const ProductDetail = ({
  productDetail,
  productItems,
  relatedProducts,
  follows,
  comments,
  totalRatings,
}: ProductDetailProps) => {
  const router = useRouter();
  const extensions = useExtensions({
    placeholder: "",
  });
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { replace, push } = useRouter();
  const [disableComments, setDisableComments] = useState(false);
  const [productItem, setProductItem] = useState<ProductItem | null>(null);
  const [productItemId, setProductItemId] = useState(-1);
  const [selectStyle, setSelectStyle] = useState({
    color: "",
    size: "",
  });
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isInstantBuy, setIsInstantBuy] = useState(false);
  const userInfo = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const [isProductFollow, setProductFollow] = useState(false);
  const [likeValue, setLikeValue] = useState<number>(follows);
  const carouselRef = useRef<any>(null);
  // Implement the FeaturedProduct component logic here

  const path = usePath();

  const colors = getUniqueColors(productItems);

  //Sort size by order
  const sizeOrder: any = { S: 1, M: 2, L: 3, XL: 4, XXL: 5 };
  const sizes = getUniqueSizes(productItems).sort((a, b) => {
    if (isNaN(Number(a.size)) || isNaN(Number(b.size))) {
      // If sizes are S, M, L, XL, XXL
      return sizeOrder[a.size] - sizeOrder[b.size];
    } else {
      // If sizes are numbers
      return Number(a.size) - Number(b.size);
    }
  });

  useEffect(() => {
    router.refresh();
  }, []);

  useEffect(() => {
    setDisableComments(true);
    const size = searchParams.get("size");
    if (Number(size) || isNaN(Number(size))) {
      replace(`${pathname}?`, { scroll: false });
    }
    setDisableComments(false);
  }, []);

  useEffect(() => {
    const selectItems = productItems.find((item) => {
      if (!item.styleValueByStyles.Size) {
        return item.styleValueByStyles.Color == selectStyle.color;
      } else if (!item.styleValueByStyles.Color) {
        return item.styleValueByStyles.Size == selectStyle.size;
      }
      return (
        item.styleValueByStyles.Color == selectStyle.color &&
        item.styleValueByStyles.Size == selectStyle.size
      );
    });
    if (selectItems) {
      setProductItem(selectItems);
      setProductItemId(selectItems.productItemId);
    }
  }, [selectStyle]);

  useEffect(() => {
    const checkFollow = async () => {
      if (userInfo && userInfo.isVerified) {
        const response = await productApi.checkFollowProduct(
          productDetail.productId
        );
        setProductFollow(response.result);
      }
    };
    checkFollow();
  }, [userInfo, productDetail.productId]);

  const isProductItemActive = () => {
    const _productItem = productItems.find(
      (item) => item.productItemId === productItemId
    );
    if (_productItem == undefined) return true;
    else if (_productItem?.isActive == false) return false;
    return true;
  };

  const getQuantity = () => {
    const _productItem = productItems.find(
      (item) => item.productItemId === productItemId
    );
    return _productItem
      ? _productItem.quantity - _productItem.sold
      : productDetail.totalQuantity - productDetail.totalSold;
  };

  const getSku = () => {
    return (
      productItems.find((item) => item.productItemId === productItemId)?.sku ||
      "Không có"
    );
  };

  // Check if product have size
  const hasSize = productItems.some((item) => !item.styleValueByStyles.Size);

  // Check if product have color
  const hasColor = productItems.some((item) => !item.styleValueByStyles.Color);

  const handleAddItemToCart = async (
    quantity: number,
    setErrors: (errors: FormikErrors<{ amount: number }>) => void
  ) => {
    //Must login to add item to cart
    if (!userInfo.isVerified) {
      showToast("Vui lòng đăng nhập để sử dụng giỏ hàng", "warning");
      push("/login");
      return;
    }

    // If the API is being called, return early
    if (isAddingToCart) return;

    // If the API is being called, return early

    if (selectStyle.color == "" && selectStyle.size == "") {
      setErrors({
        amount: `Vui lòng chọn phân loại`,
      });
      return;
    }

    //If product only have color
    if (selectStyle.color == "" && !hasColor) {
      setErrors({
        amount: `Vui lòng chọn màu sắc`,
      });
      return;
    }

    //If product only have size
    if (selectStyle.size == "" && !hasSize) {
      setErrors({
        amount: `Vui lòng chọn kích thước`,
      });
      return;
    }
    if (getQuantity() == 0) {
      setErrors({
        amount: `Sản phẩm đã hết hàng`,
      });
      return;
    }

    setIsAddingToCart(true);

    const result = await dispatch(
      addItemToCartAsync({
        productItemId: productItemId,
        quantity: quantity,
      })
    );
    if (
      ((result.payload as any).response as SingleResponse<any>).message ==
      "Quantity must be less than or equal to the inventory"
    ) {
      showToast("Không đủ số lượng sản phẩm trong kho", "error");
    } else if (
      ((result.payload as any).response as SingleResponse<any>).statusCode ==
      404
    ) {
      showToast("Sản phẩm với phân loại này đã bị vô hiệu", "error");
    } else showToast("Thêm thành công sản phẩm vào giỏ hàng", "success");

    setErrors({
      amount: ``,
    });
    setSelectStyle({
      color: "",
      size: "",
    });
    setIsAddingToCart(false);
  };

  const handleImediateBuy = (
    productItem: ProductItem,
    quantity: number,
    setErrors: (errors: FormikErrors<{ amount: number }>) => void
  ) => {
    //Must login to add item to cart
    if (!userInfo.isVerified) {
      showToast("Vui lòng đăng nhập để sử dụng giỏ hàng", "warning");
      push("/login");
      return;
    }

    // If the API is being called, return early
    if (isInstantBuy) return;

    // If product has both color and size
    if (selectStyle.color == "" && selectStyle.size == "") {
      setErrors({
        amount: `Vui lòng chọn phân loại`,
      });
      return;
    }

    //If product only have color
    if (selectStyle.color == "" && !hasColor) {
      setErrors({
        amount: `Vui lòng chọn màu sắc`,
      });
      return;
    }

    //If product only have size
    if (selectStyle.size == "" && !hasSize) {
      setErrors({
        amount: `Vui lòng chọn kích thước`,
      });
      return;
    }

    if (getQuantity() == 0) {
      setErrors({
        amount: `Sản phẩm đã hết hàng`,
      });
      return;
    }
    setCookie(
      "instantCheckoutItems",
      JSON.stringify([
        {
          ...productItem,
          productItemPrice: productItem.price,
          promotionalPrice: productItem.promotionalPrice,
          styleValues: [
            productItem.styleValueByStyles.Size &&
              productItem.styleValueByStyles.Size,
            productItem.styleValueByStyles.Color &&
              productItem.styleValueByStyles.Color,
          ],
          quantity: quantity,
          amount: quantity * productItem.promotionalPrice,
        },
      ]),
      sessionOptions(1000)
    );
    setCookie("instant-promotionPrice", 0, sessionOptions(1000));
    setIsInstantBuy(true);
    push("/instant-checkout");
    setSelectStyle({
      color: "",
      size: "",
    });
    setIsAddingToCart(false);
  };

  const handleFollowProduct = async (like: number) => {
    if (userInfo && userInfo.isVerified) {
      if (isProductFollow) {
        await productApi.unFollowProduct(productDetail.productId);
        setProductFollow(false);
      } else {
        await productApi.followProduct(productDetail.productId);
        setProductFollow(true);
      }
      setLikeValue(like);
    }
  };

  return (
    <section suppressHydrationWarning className="px-4 lg:container">
      <div className="grid grid-cols-12">
        <Breadcrumbs
          separator="/"
          className="col-span-full pt-4 pb-8 capitalize text-base text-text-light-color"
          aria-label="breadcrumb"
        >
          {path.map((value, index) => {
            if (index === path.length - 1) {
              return (
                <Typography
                  className={`px-3 text-text-color font-medium`}
                  key={index}
                  color="text.primary"
                >
                  {value}
                </Typography>
              );
            }
            return (
              <Link
                key={index}
                className={`${index == 0 ? "pr-3" : "px-3"} hover:opacity-55`}
                underline="hover"
                color="inherit"
                href={`${value === "home" ? "/" : `/${value}`}`}
              >
                {value}
              </Link>
            );
          })}
        </Breadcrumbs>
        <div className="col-span-full grid grid-cols-12 md:space-x-12">
          <div className="col-span-full md:col-span-5">
            <div className="border border-border-color h-fit rounded-sm">
              <Carousel
                swipeable={true}
                draggable={false}
                ssr={true}
                responsive={responsive3}
                infinite={true}
                autoPlaySpeed={3000}
                keyBoardControl={true}
                transitionDuration={500}
                arrows={true}
                focusOnSelect={true}
                deviceType={"desktop"}
                ref={carouselRef}
                containerClass="carousel-container"
              >
                <ImageMagnifier
                  key={productDetail.productId}
                  src={productDetail.image}
                  bgImg={productDetail.image}
                  zoomLevel={2.5}
                ></ImageMagnifier>
                {getUniqueProductItems(productItems).map((productItem) => (
                  <ImageMagnifier
                    key={productItem.productItemId}
                    src={productItem.image}
                    bgImg={productItem.image}
                    zoomLevel={2.5}
                  ></ImageMagnifier>
                ))}
              </Carousel>
            </div>
            {getUniqueProductItems(productItems).length >= 1 && (
              <div>
                <Carousel
                  swipeable={true}
                  draggable={false}
                  ssr={true}
                  responsive={customResponsive(colors.length + 1)}
                  autoPlaySpeed={3000}
                  keyBoardControl={true}
                  transitionDuration={500}
                  arrows={false}
                  deviceType={"desktop"}
                  containerClass="carousel-container-2"
                  itemClass="carousel-item2"
                >
                  <div
                    onClick={() => {
                      carouselRef.current?.goToSlide(2);
                    }}
                    className="cursor-pointer border border-border-color p-0.5"
                  >
                    <Image
                      width={400}
                      height={400}
                      className="object-cover object-center w-full h-full"
                      src={productDetail.image}
                      alt="product-item-img"
                    ></Image>
                  </div>
                  {getUniqueProductItems(productItems).map(
                    (productItem, index) => (
                      <div
                        onClick={() => {
                          carouselRef.current?.goToSlide(index + 3);
                        }}
                        className="cursor-pointer border border-border-color p-0.5"
                        key={productItem.productItemId}
                      >
                        <Image
                          width={400}
                          height={400}
                          className="object-cover object-center w-full h-full"
                          src={productItem.image}
                          alt="product-item-img"
                        ></Image>
                      </div>
                    )
                  )}
                </Carousel>
              </div>
            )}
          </div>
          <div className="col-span-full md:col-span-7 flex flex-col gap-y-4 text-lg max-md:mt-4">
            <h2 className="text-2xl lg:text-3xl font-medium">
              {productDetail.name}
            </h2>
            <div className="flex items-center gap-x-4 text-base text-text-light-color">
              <p className="flex gap-x-1 items-center text-base">
                <span className="border-b border-primary-color text-primary-color">
                  {(productDetail.rating &&
                    Number(productDetail.rating.toFixed(1))) ||
                    0}
                </span>{" "}
                <Rating
                  name="read-only"
                  precision={0.2}
                  size="small"
                  value={
                    productDetail && productDetail.rating
                      ? Number(productDetail.rating.toFixed(1))
                      : 0
                  }
                  readOnly
                />
              </p>
              <span>|</span>
              <p>
                <span className="border-b border-primary-color text-primary-color">
                  {productDetail.totalRatings}
                </span>{" "}
                Đánh giá
              </p>
              <span>|</span>
              <p>
                <span className="border-b border-primary-color text-primary-color">
                  {productDetail.totalSold}
                </span>{" "}
                Đã bán
              </p>
              {/* Follow/unfollow product */}
              {userInfo.isVerified && (
                <div className="flex gap-x-2 items-center">
                  {!isProductFollow ? (
                    <FavoriteBorderIcon
                      onClick={() => handleFollowProduct(likeValue + 1)}
                      sx={{
                        fontSize: "24px",
                        cursor: "pointer",
                        color: "#ccc",
                      }}
                    />
                  ) : (
                    <FavoriteIcon
                      onClick={() => handleFollowProduct(likeValue - 1)}
                      sx={{
                        fontSize: "24px",
                        cursor: "pointer",
                        color: "#ff6d75",
                      }}
                    />
                  )}
                  <p>Đã yêu thích ({likeValue})</p>
                </div>
              )}
            </div>
            {productDetail.priceMin ? (
              <div className="text-primary-color text-xl flex gap-x-4 items-center mt-2">
                {productItem == null
                  ? productDetail.priceMin !==
                      productDetail.promotionalPriceMin && (
                      <span
                        className={`text-lg ${
                          productDetail.priceMin !==
                          productDetail.promotionalPriceMin
                            ? "line-through text-text-light-color"
                            : "text-primary"
                        }`}
                      >
                        ₫
                        {productDetail &&
                          productDetail.priceMin &&
                          formatPrice(productDetail.priceMin)}
                      </span>
                    )
                  : productItem.price !== productItem.promotionalPrice && (
                      <span
                        className={`text-lg ${
                          productItem.price !== productItem.promotionalPrice
                            ? "line-through text-text-light-color"
                            : "text-primary"
                        }`}
                      >
                        ₫
                        {productItem &&
                          productItem.price &&
                          formatPrice(productItem.price)}
                      </span>
                    )}
                <span className="text-3xl">
                  ₫
                  {productItem == null
                    ? productDetail &&
                      productDetail.promotionalPriceMin &&
                      formatPrice(productDetail.promotionalPriceMin)
                    : productItem.promotionalPrice &&
                      formatPrice(productItem.promotionalPrice)}
                </span>

                {/* If product have sale price */}
                {productDetail &&
                  productDetail.priceMin &&
                  productDetail.promotionalPriceMin &&
                  productDetail.priceMin !==
                    productDetail.promotionalPriceMin && (
                    <div className="bg-primary-color px-3 py-1 text-white">
                      giảm{" "}
                      {(
                        ((productDetail.priceMin -
                          productDetail.promotionalPriceMin) /
                          productDetail.priceMin) *
                        100
                      ).toFixed(0)}
                      %
                    </div>
                  )}
              </div>
            ) : (
              <div className="p-2 bg-red-400 text-white rounded-md w-fit">
                Sản phẩm chưa có hàng
              </div>
            )}

            <div className="flex items-center py-1">
              <span className="w-fit mr-8 self-start">Dịch vụ: </span>
              <ul>
                <li>Chính sách trả hàng trong 30 ngày</li>
                <li>{`Miễn phí vận chuyển với đơn hàng < 10km`}</li>
                <li>Hỗ trợ mua hàng tận tình</li>
              </ul>
            </div>
            <div className="flex flex-col py-1 gap-y-5">
              <Formik
                enableReinitialize={true}
                initialValues={{ amount: 1 }}
                validateOnBlur={true}
                validateOnChange={true}
                validate={function (values) {
                  const errors: { amount: string } = { amount: "" };
                  return errors;
                }}
                onSubmit={async (values, { setErrors }) => {}}
              >
                {({ values, setValues, errors, setErrors }) => (
                  <>
                    {colors && colors.length > 0 && (
                      <div className="flex items-center py-1">
                        <span className="w-fit mr-14 self-start">Màu:</span>
                        <div className="flex flex-wrap gap-2">
                          {colors.map((item, index) => (
                            <div
                              onClick={() => {
                                setSelectStyle({
                                  ...selectStyle,
                                  color: item.color,
                                });
                                setValues({ amount: 1 });
                                carouselRef.current?.goToSlide(index + 3);
                              }}
                              className={`relative z-10 w-fit border px-2 py-1 border-border-color cursor-pointer flex items-center gap-2`}
                              key={index}
                            >
                              {/* <Image
                                width={24}
                                height={24}
                                className="size-6 object-cover object-center"
                                src={
                                  productItems.find(
                                    (productItem) =>
                                      productItem.styleValueByStyles.Color ==
                                      item.color
                                  )!.image
                                }
                                alt="product-item-img"
                              ></Image> */}
                              {item.color}
                              {selectStyle.color == item.color && (
                                <div
                                  className={`bottom-right-triangle animate-appear`}
                                ></div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {sizes && sizes.length > 0 && (
                      <div className="flex items-center py-1">
                        <span className="w-fit mr-14 self-start">Size:</span>
                        <div className="flex flex-wrap gap-2">
                          {sizes.map((item, index) => (
                            <div
                              onClick={() => {
                                setSelectStyle({
                                  ...selectStyle,
                                  size: item.size,
                                });
                                setValues({ amount: 1 });
                              }}
                              className="relative z-10 w-fit border px-6 py-1 border-border-color cursor-pointer"
                              key={index}
                            >
                              {item.size}
                              {selectStyle.size == item.size && (
                                <div
                                  className={`bottom-right-triangle animate-appear`}
                                ></div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center py-1">
                      <span className="w-fit mr-[1.25rem] self-start">
                        Số lượng:
                      </span>
                      <Form className="flex flex-col">
                        <div className="flex gap-x-[1px] items-center">
                          <button
                            disabled={isProductItemActive() == false}
                            type="button"
                            onClick={() => {
                              if (values.amount <= 1) {
                                setErrors({
                                  amount: `Số lượng sản phẩm phải lớn hơn 0`,
                                });
                              } else {
                                setValues({
                                  amount:
                                    values.amount - 1 > 0
                                      ? values.amount - 1
                                      : 1,
                                });
                              }
                            }}
                            className={`border border-border-color p-2 ${
                              isProductItemActive() == false ? "opacity-55" : ""
                            }`}
                          >
                            <RemoveIcon />
                          </button>
                          <Field
                            disabled={isProductItemActive() == false}
                            value={values.amount}
                            name="amount"
                            type="number"
                            min={1}
                            className={`border border-border-color py-2 w-14 ${
                              isProductItemActive() == false ? "opacity-55" : ""
                            }
                        focus:border-none text-center`}
                            onChange={(e: { target: { value: string } }) => {
                              const value = parseInt(e.target.value);
                              if (value < 1 || e.target.value.length == 0) {
                                setValues({ amount: 1 });
                              } else if (value > getQuantity()) {
                                setValues({
                                  amount: getQuantity(),
                                });
                              } else {
                                setValues({ amount: value });
                              }
                            }}
                            onFocus={(e: React.FocusEvent<HTMLInputElement>) =>
                              e.target.select()
                            }
                          />
                          <button
                            disabled={isProductItemActive() == false}
                            type="button"
                            onClick={() => {
                              if (values.amount >= getQuantity()) {
                                setErrors({
                                  amount: `Bạn chỉ có thể mua ${getQuantity()} sản phẩm`,
                                });
                              } else
                                setValues({
                                  amount: values.amount + 1,
                                });
                            }}
                            className={`border border-border-color p-2 ${
                              isProductItemActive() == false ? "opacity-55" : ""
                            }`}
                          >
                            <AddIcon />
                          </button>
                          <span className="text-base ml-3">
                            {isProductItemActive() == true
                              ? `${getQuantity() || 0} sản phẩm có sẵn`
                              : "Phân loại này đã bị vô hiệu"}
                          </span>
                        </div>

                        <div
                          className="text-left text-sm justify-center text-red-500 animate-appear mt-3
                    "
                        >
                          {errors.amount}
                        </div>
                      </Form>
                    </div>
                    {productDetail.priceMin && (
                      <div className="flex space-x-4 mt-6 pb-8 border-b border-border-color">
                        <button
                          disabled={
                            isAddingToCart || isProductItemActive() == false
                          }
                          type="submit"
                          onClick={
                            // submitForm
                            () => handleAddItemToCart(values.amount, setErrors)
                          }
                          className={`border border-primary-color text-sm font-semibold text-primary-color w-fit p-3 flex gap-x-2
                                  ${
                                    isProductItemActive() == false
                                      ? "hover:cursor-not-allowed opacity-55"
                                      : "hover:opacity-55 transition-opacity"
                                  }`}
                        >
                          <AddShoppingCartIcon />
                          Thêm Vào Giỏ Hàng
                        </button>
                        <button
                          disabled={isProductItemActive() == false}
                          onClick={() =>
                            handleImediateBuy(
                              productItem!,
                              values.amount,
                              setErrors
                            )
                          }
                          type="submit"
                          className={`bg-primary-color text-sm font-semibold text-white w-32 grid place-content-center
                        ${
                          isProductItemActive() == false
                            ? "hover:cursor-not-allowed opacity-55"
                            : "hover:opacity-55 transition-opacity"
                        }`}
                        >
                          Mua Ngay
                        </button>
                      </div>
                    )}
                  </>
                )}
              </Formik>
            </div>
            <dl className="flex flex-col space-y-2 mt-2 text-base text-text-light-color">
              <dt>
                SKU:{" "}
                <span className="text-text-color font-medium">{getSku()}</span>
              </dt>
              <dd>
                Danh mục:{" "}
                <span className="text-text-color font-medium">
                  <Link href={`/category/${productDetail.categoryName}`}>
                    {productDetail.categoryName}
                  </Link>
                </span>
              </dd>
              <dd>
                Thương hiệu:{" "}
                <span className="text-text-color font-medium">
                  {productDetail.brandName}
                </span>
              </dd>
            </dl>
          </div>
        </div>
      </div>

      <MyTabs
        chilren={[
          {
            label: "Mô tả",
            content: (
              <AppRouterCacheProvider>
                <Box paddingLeft={2} paddingRight={2}>
                  <RichTextReadOnly
                    content={productDetail.description}
                    extensions={extensions}
                  />
                </Box>
              </AppRouterCacheProvider>
            ),
          },
          {
            label: `Đánh giá (${totalRatings})`,
            content: disableComments ? undefined : (
              <Review rating={comments} totalRatings={totalRatings} />
            ),
          },
        ]}
      />
      {/* Related Products */}
      <RelatedProduct products={relatedProducts} />
    </section>
  );
};

export default ProductDetail;

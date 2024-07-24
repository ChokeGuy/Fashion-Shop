"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { emptyFav } from "@/src/assests";
import LoadingButton from "@mui/lab/LoadingButton";
import CircularProgress from "@mui/material/CircularProgress";
import { formatPrice } from "@/src/utilities/price-format";
import Link from "next/link";
import Popup from "../Popup";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { userApi } from "../../apis/userApi";
import { useRouter } from "next/navigation";
import { Product } from "@/src/models";
import { productApi } from "../../apis/productApi";
import { showToast } from "@/src/lib/toastify";
const FavoriteComponent = () => {
  const { replace } = useRouter();
  const [productId, setProductId] = useState(-1);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [favoriteList, setFavoriteList] = useState<Product[]>([]);

  useEffect(() => {
    const getFavorites = async () => {
      const response = await userApi.getFavoriteProducts();

      if (response?.success) {
        setFavoriteList(response?.result || []);
      } else replace("/");
    };
    if (isDelete == true) return;
    getFavorites();
  }, [isDelete]);

  const handleFollowProduct = async (productId: number) => {
    setOpenDeleteDialog(true);
    setProductId(productId);
  };

  const resetDialog = () => {
    setOpenDeleteDialog(false);
    setProductId(-1);
    setIsDelete(false);
  };

  //If favorite items empty
  if (favoriteList.length == 0) {
    return (
      <div className="h-[78vh] flex items-center justify-center flex-col text-lg">
        <Image src={emptyFav} className="size-28" alt="empty-fav"></Image>
        <span className="text-center">
          Danh sách yêu thích của bạn còn trống
        </span>
        {/* <Link
          href="/product"
          className="hover:opacity-55 transition-opacity  bg-primary-color text-center px-4 py-2 text-white"
        >
          Mua hàng ngay
        </Link> */}
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
          <div className="flex">
            <div className="w-20">Sản phẩm</div>
            <div className="w-[480px] max-xl:w-[280px] text-center">Tên</div>
            <div className="w-48 max-xl:w-28 text-center">Danh mục</div>
            <div className="w-40 text-center">Thương hiệu</div>
            <div className="w-40 text-center">Giá tiền</div>
            <div className="w-32 max-xl:w-28 text-center">Thao Tác</div>
          </div>
        </div>
        <div
          className="bg-white pt-2 flex items-center justify-between 
        shadow-sm border border-border-color w-full overflow-auto"
        >
          <ul className="space-y-6 lg:w-full">
            <li className="flex items-center justify-between gap-x-[270px]  w-full lg:w-fit text-text-light-color px-8 py-4 border-b border-border-color lg:hidden">
              <div className="flex">
                <div className="w-20">Sản phẩm</div>
                <div className="w-[480px] max-xl:w-[280px] text-center">
                  Tên
                </div>
                <div className="w-48 max-xl:w-28  text-center">Danh mục</div>
                <div className="w-40 text-center">Thương hiệu</div>
                <div className="w-40 text-center">Giá tiền</div>
                <div className="w-32 max-xl:w-28 text-center">Thao Tác</div>
              </div>
            </li>
            {favoriteList.map((product) => {
              return (
                <li
                  className="flex items-center gap-y-4 px-8 pb-4 border-b
                     border-border-color w-full max-lg:w-fit"
                  key={product.productId}
                >
                  <div
                    className={`flex items-center ${
                      product.isActive == false ||
                      product.totalQuantity - product.totalSold == 0
                        ? "opacity-50"
                        : ""
                    }`}
                  >
                    <Image
                      width={64}
                      height={64}
                      className="size-16 border border-border-color"
                      src={product.image}
                      alt="cart-item-img"
                    ></Image>
                    <div className="text-sm text-primary-color font-semibold ml-3 w-[480px] max-xl:w-[290px]">
                      {product.isActive == false ||
                      product.totalQuantity - product.totalSold == 0 ? (
                        <span>{product.name}</span>
                      ) : (
                        <Link
                          className="hover:underline hover:text-primary-color"
                          href={`product/${product.productId}`}
                        >
                          {product.name}
                        </Link>
                      )}
                    </div>
                    <div className="text-text-color w-48 max-xl:w-28 text-center">
                      <span className="">{product.categoryName}</span>
                    </div>
                    <div className="text-text-color w-40  text-center">
                      <span className="">{product.brandName}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div
                      className={`space-x-2 w-40 text-center ${
                        product.isActive == false ||
                        product.totalQuantity - product.totalSold == 0
                          ? "opacity-50"
                          : ""
                      }`}
                    >
                      {product.promotionalPriceMin !== product.priceMin && (
                        <span className="line-through text-text-light-color ">
                          ₫{formatPrice(product.priceMin)}
                        </span>
                      )}
                      <span>
                        ₫
                        {product.promotionalPriceMin &&
                          formatPrice(product.promotionalPriceMin)}
                      </span>
                    </div>
                  </div>
                  <div className="w-32 max-xl:w-28 grid place-items-center">
                    <FavoriteIcon
                      onClick={() => handleFollowProduct(product.productId)}
                      sx={{
                        fontSize: "24px",
                        cursor: "pointer",
                        color: "#ff6d75",
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <Popup
        closeButton={{
          top: "8px",
          right: "10px",
        }}
        open={openDeleteDialog}
        onClose={resetDialog}
        title={`Bỏ yêu thích sản phẩm này?`}
        content={undefined}
        actions={
          <>
            <button
              type="button"
              disabled={isDelete}
              className={`mt-2 px-4 py-1 rounded-md ${isDelete && "opacity-55"}
                      bg-primary-color text-white self-end  hover:opacity-70 mr-3 transition-opacity`}
              onClick={resetDialog}
            >
              Hủy
            </button>
            <LoadingButton
              disabled={isDelete}
              loading={isDelete}
              loadingIndicator={
                <CircularProgress className="text-white" size={16} />
              }
              className={`mt-2 px-4 py-1 rounded-md ${isDelete && "opacity-55"}
                      bg-primary-color text-white self-end  hover:opacity-70 transition-opacity`}
              onClick={async () => {
                setIsDelete(true);
                const response = await productApi.unFollowProduct(productId);
                if (response?.success) {
                  showToast("Bỏ yêu thích thành công", "success");
                } else {
                  showToast("Có lỗi xảy ra, vui lòng thử lại", "error");
                }
                resetDialog();
                setIsDelete(false);
              }}
              variant="outlined"
            >
              <span className={`${isDelete && "text-primary-color"}`}>
                Đồng ý
              </span>
            </LoadingButton>
          </>
        }
      />
    </div>
  );
};

export default FavoriteComponent;

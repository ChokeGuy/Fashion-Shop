"use client";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import usePath from "@/src/utilities/link";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import Avatar from "@mui/material/Avatar";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import BusinessIcon from "@mui/icons-material/Business";
import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import { useAppDispatch, useAppSelector } from "@/src/lib/redux/hooks";
import {
  getUserProfileAsync,
  selectUser,
} from "@/src/lib/features/user/userSlice";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import { ReactNode } from "react";
import { showToast } from "@/src/lib/toastify";
import { deleteTokens } from "@/src/utilities/tokenHandler";
import { getCookie } from "cookies-next";
import { usePathname, useRouter } from "next/navigation";
import { userApi } from "../../apis/userApi";
import { getAllCartItemsAsync } from "@/src/lib/features/cart/cartSlice";
import { getUserAddressAsync } from "@/src/lib/features/address/addressSlice";
import { getUserNotifications } from "@/src/lib/features/notification/notificationSlice";

const UserLayout = ({ children }: { children: ReactNode }) => {
  const path = usePath();
  const pathname = usePathname();
  const { replace } = useRouter();
  const userInfo = useAppSelector(selectUser);
  const dispatch = useAppDispatch();

  const handleLogoutAccount = async () => {
    const refreshToken = getCookie("refreshToken");
    if (refreshToken) {
      const result = await userApi.logout({ refreshToken });
      if (result?.success) {
        if (
          pathname.includes("/account") ||
          pathname.includes("/admin") ||
          pathname.includes("/shipper")
        ) {
          showToast("Đăng xuất thành công", "success");
        }
        dispatch(getUserProfileAsync());
        dispatch(getAllCartItemsAsync());
        dispatch(getUserAddressAsync());
        dispatch(getUserNotifications());
      }
    }
    replace("/login");
    deleteTokens();
  };

  return (
    <section className="border-b border-border-color bg-background">
      <div className="lg:container max-lg:px-4">
        <div className="grid grid-cols-12 gap-x-8 pb-4 sm:pb-16">
          <Breadcrumbs
            separator="/"
            className="col-span-full py-5 capitalize text-base text-text-light-color"
            aria-label="breadcrumb"
          >
            {path.map((value: string, index: number) => {
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
              } else if (index === path.length - 2) {
                return;
              }
              return (
                <Link
                  key={index}
                  className={`${index == 0 ? "pr-3" : "px-3"} hover:opacity-55`}
                  href={`${value === "home" ? "/" : `/${value}`}`}
                >
                  {value}
                </Link>
              );
            })}
          </Breadcrumbs>
          <div className="hidden md:block border border-border-color md:col-span-4 bg-white rounded-xl shadow-sm">
            <div className="flex flex-col justify-center items-center gap-y-2">
              {
                // Show avatar preview
                userInfo.avatar !== null ? (
                  <Avatar
                    className="size-16 rounded-full border border-primary-color mt-6"
                    src={userInfo.avatar as string}
                  ></Avatar>
                ) : (
                  <div className="border border-border-color rounded-full p-0.5 mt-6 shadow-md">
                    <Avatar className="size-16 border border-border-color p-2">
                      {(userInfo.fullname &&
                        userInfo.fullname[0].toUpperCase()) ||
                        "T"}
                    </Avatar>
                  </div>
                )
              }
              <p className="font-semibold">{`${userInfo.fullname}`}</p>
              {/* <p className="font-semibold">{userInfo.phone}</p> */}
              <div className="w-full flex flex-col gap-y-2 mt-3">
                <Link
                  replace={true}
                  className="flex items-center gap-x-3 font-medium px-6 py-3
                   hover:bg-border-color  transition-all"
                  href="/account/profile"
                >
                  <div className="bg-background p-1.5 rounded-lg">
                    <ManageAccountsIcon className="fill-text-light-color" />
                  </div>
                  Thông tin cá nhân
                </Link>
                <Link
                  replace={true}
                  className="flex items-center gap-x-3 font-medium px-6 py-3
                   hover:bg-border-color  transition-all"
                  href="/account/order-tracking"
                >
                  <div className="bg-background p-1.5 rounded-lg">
                    <LocalMallIcon className="fill-text-light-color" />
                  </div>
                  Đơn hàng
                </Link>
                {/* <Link
                  replace={true}
                  className="flex items-center gap-x-3 font-medium px-6 py-3
                   hover:bg-border-color  transition-all"
                  href="/account/promotion"
                >
                  <div className="bg-background p-1.5 rounded-lg">
                    <ConfirmationNumberIcon className="fill-text-light-color" />
                  </div>
                  Chương trình khuyến mãi
                </Link> */}
                <Link
                  replace={true}
                  className="flex items-center gap-x-3 font-medium px-6 py-3
                   hover:bg-border-color  transition-all"
                  href="/account/change-password"
                >
                  <div className="bg-background p-1.5 rounded-lg">
                    <VpnKeyIcon className="fill-text-light-color" />
                  </div>
                  Đổi mật khẩu
                </Link>
                <Link
                  className="flex items-center gap-x-3 font-medium px-6 py-3
                   hover:bg-border-color  transition-all"
                  href="/account/notification"
                >
                  <div className="bg-background p-1.5 rounded-lg">
                    <NotificationsNoneIcon className="fill-text-light-color" />
                  </div>
                  Thông báo
                </Link>
                <Link
                  replace={true}
                  className="flex items-center gap-x-3 font-medium px-6 py-3
                   hover:bg-border-color  transition-all"
                  href="/account/address"
                >
                  <div className="bg-background p-1.5 rounded-lg">
                    <BusinessIcon className="fill-text-light-color" />
                  </div>
                  Địa chỉ
                </Link>
                {/* <Link
                    className="flex items-center gap-x-3 font-medium px-6 py-3
                   hover:bg-border-color  transition-all"
                    href="/account/viewed-products"
                  >
                    <div className="bg-background p-1.5 rounded-lg">
                      <VisibilityIcon className="fill-text-light-color" />
                    </div>
                    Sản phẩm yêu thích
                  </Link> */}
                <div
                  onClick={handleLogoutAccount}
                  className="flex items-center gap-x-3 font-medium px-6 py-3
                   hover:bg-border-color  cursor-pointer transition-all"
                >
                  <div className="bg-background p-1.5 rounded-lg">
                    <LogoutIcon className="fill-text-light-color" />
                  </div>
                  Đăng xuất
                </div>
              </div>
            </div>
          </div>
          <div className="hidden max-md:block col-span-full">
            <div className="w-full flex items-center justify-between mb-3">
              {
                // Show avatar preview
                userInfo.avatar !== null ? (
                  <Avatar
                    className="size-10 rounded-full border border-primary-color"
                    src={userInfo.avatar as string}
                  ></Avatar>
                ) : (
                  <div className="rounded-full h-fit">
                    <Avatar className="size-10 border border-border-color p-2">
                      {(userInfo.fullname &&
                        userInfo.fullname[0].toUpperCase()) ||
                        "T"}
                    </Avatar>
                  </div>
                )
              }
              <Link
                className="flex items-center gap-x-3 font-medium hover:opacity-55 transition-all"
                href="/account/profile"
              >
                <div className="bg-background p-1.5 rounded-lg">
                  <ManageAccountsIcon className="fill-text-light-color" />
                </div>
              </Link>
              <Link
                className="flex items-center gap-x-3 font-medium hover:opacity-55 transition-all"
                href="/account/order-tracking"
              >
                <div className="bg-background p-1.5 rounded-lg">
                  <LocalMallIcon className="fill-text-light-color" />
                </div>
              </Link>
              {/* <Link
                className="flex items-center gap-x-3 font-medium hover:opacity-55 transition-all"
                href="/account/promotion"
              >
                <div className="bg-background p-1.5 rounded-lg">
                  <ConfirmationNumberIcon className="fill-text-light-color" />
                </div>
              </Link> */}
              {/* <Link
                className="flex items-center gap-x-3 font-medium hover:opacity-55 transition-all"
                href="/account/notification"
              >
                <div className="bg-background p-1.5 rounded-lg">
                  <NotificationsNoneIcon className="fill-text-light-color" />
                </div>
              </Link> */}
              <Link
                className="flex items-center gap-x-3 font-medium hover:opacity-55 transition-all"
                href="/account/address"
              >
                <div className="bg-background p-1.5 rounded-lg">
                  <BusinessIcon className="fill-text-light-color" />
                </div>
              </Link>
              {/* <Link
                  className="flex items-center gap-x-3 font-medium hover:opacity-55 transition-all"
                  href="/account/viewed-products"
                >
                  <div className="bg-background p-1.5 rounded-lg">
                    <VisibilityIcon className="fill-text-light-color" />
                  </div>
                </Link> */}
              <div className="flex items-center gap-x-3 font-medium hover:opacity-55 cursor-pointer transition-all">
                <div className="bg-background p-1.5 rounded-lg">
                  <LogoutIcon className="fill-text-light-color" />
                </div>
              </div>
            </div>
          </div>
          {children}
        </div>
      </div>
    </section>
  );
};

export default UserLayout;

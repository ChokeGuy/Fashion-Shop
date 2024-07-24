"use client";
import {
  getUserProfileAsync,
  selectUser,
  selectUserStatus,
} from "@/src/lib/features/user/userSlice";
import { useAppDispatch, useAppSelector } from "@/src/lib/redux/hooks";
import Avatar from "@mui/material/Avatar";
import Link from "next/link";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { StyledBadge } from "../../components/homepage/Nav";
import CartNav from "../../components/cart/CartNav";
import { emptyNotify, logo } from "@/src/assests";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { categoryApi } from "../../apis/categoryApi";
import { Category } from "@/src/models";
import {
  getUserNotifications,
  selectNotifications,
  selectNotifyStatus,
  updateAllNotificationsToWatch,
} from "@/src/lib/features/notification/notificationSlice";
import CustomPopover, { PopoverButton } from "../../components/PopOver";
import CircleLoading from "../../components/Loading";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";

import { usePathname } from "next/navigation";
import { hasCookie } from "cookies-next";

function CartLayout({
  children,
  title,
}: {
  children: React.ReactNode;
  title: never;
}) {
  const path = usePathname();
  const users = useAppSelector(selectUser);
  const userStatus = useAppSelector(selectUserStatus);
  const notifications = useAppSelector(selectNotifications);
  const notifyStatus = useAppSelector(selectNotifyStatus);
  const dispatch = useAppDispatch();
  const [hasMore, setHasMore] = useState(true);

  const [notiAmount, setNotiAmount] = useState(1);
  const [notiLoading, setNotiLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const observer = useRef<any>();
  const containerRef = useRef(null);

  useEffect(() => {
    if (userStatus === "idle") {
      dispatch(getUserProfileAsync());
    }
  }, [dispatch]);

  useEffect(() => {
    if (notifyStatus === "idle") {
      dispatch(getUserNotifications({ page: 0, size: 6 }));
    }
  }, [notifyStatus]);

  useEffect(() => {
    if (notifyStatus === "idle") {
      dispatch(getUserNotifications({ page: 0, size: 6 }));
    }
    return () => {
      // Đây là hàm cleanup, sẽ được gọi khi component unmount
      // Reset các trạng thái về giá trị mặc định
      dispatch(getUserNotifications({ page: 0, size: 6 }));
      setNotiAmount(1); // Giả sử giá trị mặc định là 0
      setHasMore(true); // Giả sử giá trị mặc định là true
      // Bạn cũng có thể cần reset các trạng thái khác nếu cần
    };
  }, []);

  const lastNotificationElementRef = useCallback(
    (node: any) => {
      if (notiLoading || !hasMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          const getNotifications = async () => {
            setNotiLoading(true);
            const newAmount = notiAmount + 1;
            setNotiAmount(newAmount);
            await dispatch(
              getUserNotifications({
                page: 0,
                size: newAmount * 6,
              })
            );
            setHasMore(newAmount * 6 < notifications.totalElements);
            setNotiLoading(false);
          };
          getNotifications();
        }
      });
      if (node) observer.current.observe(node);
    },
    // Xem xét lại các phụ thuộc nếu cần
    [notiLoading, hasMore, notifications]
  );

  useEffect(() => {
    const getCategories = async () => {
      const response = await categoryApi.getAllCategories();

      setCategories(response?.result.content ?? []);
    };
    getCategories();
  }, []);

  const handleWatchAllNotifications = () => {
    if (hasCookie("accessToken")) {
      dispatch(updateAllNotificationsToWatch());
    }
  };

  return (
    <section>
      <div className="sticky top-0 z-20">
        <div className="bg-banner-color text-white text-center relative z-20">
          <div className="container flex  max-lg:flex-col max-lg:gap-y-2 justify-between items-center py-3">
            <p className="text-ssm max-lg:order-2 font-medium uppercase">
              Tưng bừng khai trương, giảm giá 30% cho toàn bộ sản phẩm
            </p>

            <div className="flex items-center max-lg:order-1">
              <div className="pr-2 border-r border-border-color">
                <div>
                  <CustomPopover
                    button={
                      <div className="flex gap-x-2 items-center hover:opacity-55 transition-opacity">
                        <StyledBadge
                          onClick={handleWatchAllNotifications}
                          badgeContent={
                            notifyStatus == "idle"
                              ? null
                              : notifications.newNotification
                          }
                          color="error"
                          showZero
                          max={999}
                          className="cursor-pointer"
                        >
                          <NotificationsNoneIcon
                            sx={{ fill: "white" }}
                            className="text-[1.75rem]"
                          />
                        </StyledBadge>
                        <span>Thông Báo</span>
                      </div>
                    }
                    content={
                      <div className="relative w-full max-h-72 overflow-hidden">
                        <div
                          className="w-60 h-fit max-h-[250px] overflow-auto"
                          ref={containerRef}
                        >
                          {notifications.value &&
                          notifications.value.length > 0 ? (
                            notifications.value.map((notification, index) => {
                              if (notifications.value.length === index + 1) {
                                return (
                                  <div
                                    key={notification.notificationId}
                                    ref={lastNotificationElementRef}
                                    className="flex items-center justify-between gap-x-2 p-2 border-b border-border-color
                           hover:bg-background transition-all"
                                  >
                                    <Link
                                      href={`/account/order-tracking?orderKeyword=${notification.orderId}`}
                                      key={notification.notificationId}
                                    >
                                      <p className="text-sm">
                                        {notification.content}
                                      </p>
                                    </Link>
                                    <PopoverButton
                                      notificationId={
                                        notification.notificationId
                                      }
                                    />
                                  </div>
                                );
                              } else {
                                return (
                                  <div
                                    key={notification.notificationId}
                                    className="flex items-center justify-between gap-x-2 p-2 border-b border-border-color
                           hover:bg-background transition-all"
                                  >
                                    <Link
                                      href={`/account/order-tracking?orderKeyword=${notification.orderId}`}
                                      key={notification.notificationId}
                                    >
                                      <p className="text-sm">
                                        {notification.content}
                                      </p>
                                    </Link>
                                    <PopoverButton
                                      notificationId={
                                        notification.notificationId
                                      }
                                    />
                                  </div>
                                );
                              }
                            })
                          ) : (
                            <div className="p-2 size-full grid place-items-center text-primary-color">
                              <Image
                                className="object-cover object-center size-full"
                                alt="empty-notify"
                                src={emptyNotify}
                              ></Image>
                            </div>
                          )}
                        </div>
                        {notifications.value &&
                          notifications.value.length > 0 &&
                          notiLoading && (
                            <div className="absolute bottom-[1%] left-[42%] size-12">
                              <CircleLoading />
                            </div>
                          )}
                      </div>
                    }
                  ></CustomPopover>
                </div>
              </div>
              {path.includes("cart") ? (
                <div className="pr-2 border-r border-border-color">
                  <Link
                    replace={true}
                    className="flex gap-x-2 items-center ml-2 hover:opacity-55 transition-opacity"
                    href={"/favorite"}
                  >
                    <FavoriteBorderIcon className="text-[1.75rem]" />
                    <span className="text-sm text-white">Yêu thích</span>
                  </Link>
                </div>
              ) : (
                <div className="pr-2 border-r border-border-color">
                  <Link
                    replace={true}
                    className="flex gap-x-2 items-center ml-2 hover:opacity-55 transition-opacity"
                    href={"/cart"}
                  >
                    <ShoppingCartOutlinedIcon className="text-[1.75rem]" />

                    <span className="text-sm text-white">Giỏ hàng</span>
                  </Link>
                </div>
              )}
              <Link
                replace={true}
                className="flex gap-x-2 items-center ml-2 hover:opacity-55 transition-opacity"
                href={"/account/profile"}
              >
                {users.avatar ? (
                  <Avatar
                    className="size-8 rounded-full border border-primary-color"
                    src={users.avatar as string}
                  ></Avatar>
                ) : (
                  <Avatar className="size-8">
                    {(users.fullname && users.fullname[0].toUpperCase()) || "T"}
                  </Avatar>
                )}
                <span className="text-sm text-white">{users.fullname}</span>
              </Link>
            </div>
          </div>
        </div>
        <CartNav title={title} />
      </div>
      <main className="animate-appear bg-background">{children}</main>

      {/* Footer Section */}
      <footer className="lg:container sssm:px-4 animate-appear ">
        <div className="grid grid-cols-12 gap-x-8 xl:gap-x-[9rem] gap-y-8 border-b border-border-color py-[3.75rem]">
          <div className="col-span-full md:col-span-4 xl:col-span-3 text-sm flex flex-col gap-y-4">
            <Link href="/">
              <Image
                className="w-[9rem] aspect-[106/33]"
                src={logo}
                alt="Logo"
              />
            </Link>
            <p>
              Chào mừng bạn đến với cửa hàng thời trang này. Chúng tôi cung cấp
              một loạt trang phục thời trang chất lượng xứng đáng với giá tiền.
            </p>
            <span className="whitespace-nowrap">
              0376399721 – nguyenthang13a32020@gmail.com
            </span>
          </div>
          <div className="col-span-full md:col-span-3 xl:col-span-2 flex justify-between flex-col">
            <h3 className="text-lg font-bold mb-3">Thông tin</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/">Về chúng tôi</Link>
              </li>
              <li>
                <Link href="/">Chính sách bảo mật</Link>
              </li>
              <li>
                <Link href="/">Chính sách đổi trả</Link>
              </li>
              <li>
                <Link href="/">Điều khoản dịch vụ</Link>
              </li>
            </ul>
          </div>
          <div className="col-span-full md:col-span-3 xl:col-span-2 flex justify-between flex-col">
            <h3 className="text-lg font-bold mb-3">Tài khoản</h3>
            <ul className="space-y-1">
              <li>
                <Link replace={true} href="/register">
                  Đăng ký
                </Link>
              </li>
              <li>
                <Link replace={true} href="/login">
                  Đăng nhập
                </Link>
              </li>
              <li>
                <Link replace={true} href="/account/order-tracking">
                  Đơn hàng của tôi
                </Link>
              </li>
              <li>
                <Link replace={true} href="/account/profile">
                  Chi tiết tài khoản
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-span-full md:col-span-2 xl:col-span-2 flex justify-between flex-col">
            <h3 className="text-lg font-bold mb-3">Danh mục</h3>
            <ul className="space-y-1">
              {categories && categories.length > 0 ? (
                categories.slice(0, 4).map((category) => (
                  <li key={category.categoryId}>
                    <Link href={`/category/${category.name}`}>
                      {category.name}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <Link href="/category/Quần Áo">Quần Áo</Link>
                  </li>
                  <li>
                    <Link href="/category/Quần Áo Nam">Quần Áo Nam</Link>
                  </li>
                  <li>
                    <Link href="/category/Giày dép">Giày dép</Link>
                  </li>
                  <li>
                    <Link href="/category/Đồng hồ">Đồng hồ</Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
        <div className="py-8 text-center text-primary-color">
          &copy; 2024 Bản quyền thuộc về Ngô Thừa Ân và Nguyễn Ngọc Thắng. Vui
          lòng không sao chép dưới mọi hình thức
        </div>
      </footer>
    </section>
  );
}
export default CartLayout;

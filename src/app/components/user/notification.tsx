"use client";
import {
  deleteOneNotification,
  getUserNotifications,
  selectNotifications,
  updateAllNotificationToRead,
} from "@/src/lib/features/notification/notificationSlice";
import { useAppDispatch, useAppSelector } from "@/src/lib/redux/hooks";
import Link from "next/link";
import { emptyNotify } from "@/src/assests";
import Image from "next/image";
import DeleteIcon from "@mui/icons-material/Delete";
import React, { useCallback, useEffect, useRef, useState } from "react";
import CircleLoading from "../Loading";
import { notificationApi } from "../../apis/notificationApi";
import { NotificationType } from "@/src/models/notification";
import { Pagination } from "@/src/models";

const NotificationPage = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotifications);
  const [notiAmount, setNotiAmount] = useState(1);
  const [internalNotifications, setInternalNotifications] = useState<
    NotificationType[]
  >([]);
  const [internalElements, setInternalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const containerRef = useRef(null);

  const lastNotificationElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (loading || !hasMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          const fetchData = async (request: Pagination) => {
            const response = await notificationApi.getUserNotifications({
              page: request.page,
              size: request.size,
            });

            if (response?.success) {
              setInternalNotifications(response.result.notificationPage);
              setInternalElements(response.result.totalElements || 0);
            }
          };

          const getNotifications = async () => {
            setLoading(true);
            const newAmount = notiAmount + 1;
            setNotiAmount(newAmount);
            await fetchData({ page: 0, size: newAmount * 6 });
            setLoading(false);
            setHasMore(newAmount * 6 < internalElements);
          };
          getNotifications();
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, notiAmount, internalNotifications, internalElements]
  );

  useEffect(() => {
    const getNotifications = async () => {
      const response = await notificationApi.getUserNotifications({
        page: 0,
        size: 6,
      });

      if (response?.success) {
        setInternalNotifications(response.result.notificationPage);
        setInternalElements(response.result.totalElements || 0);
      }
    };

    getNotifications();
    return () => {
      // Đây là hàm cleanup, sẽ được gọi khi component unmount
      // Reset các trạng thái về giá trị mặc định
      getNotifications();
      setNotiAmount(1); // Giả sử giá trị mặc định là 0
      setHasMore(true); // Giả sử giá trị mặc định là true
      // Bạn cũng có thể cần reset các trạng thái khác nếu cần
    };
  }, []);

  const handleMarkAllAsRead = () => {
    dispatch(updateAllNotificationToRead());
  };

  const handleDeleteNotification = async (notificationId: number) => {
    await dispatch(deleteOneNotification(notificationId));
    await dispatch(getUserNotifications({ page: 0, size: 6 }));
  };

  const isAllNotificationRead = () => {
    return notifications.value
      .slice(0, notiAmount * 6)
      .every((notification) => notification.isRead == false);
  };

  return (
    <div className="col-span-full border border-border-color md:col-span-8 lg:col-span-8 bg-white rounded-xl shadow-sm">
      <div className="relative w-full">
        <div className="flex items-center justify-between border-b border-border-color p-3">
          <h2 className="text-2xl font-semibold">Thông báo</h2>
          <button
            onClick={handleMarkAllAsRead}
            disabled={!isAllNotificationRead()}
            className={`text-primary-color ${
              !isAllNotificationRead() ? "opacity-55" : "hover:underline"
            }`}
          >
            Đánh dấu đã đọc tất cả
          </button>
        </div>
        <div ref={containerRef} className="w-full h-[530px] overflow-y-scroll">
          {internalNotifications && internalNotifications.length > 0 ? (
            internalNotifications.map((notification, index) => {
              if (internalNotifications.length === index + 1) {
                return (
                  <div
                    key={notification.notificationId}
                    ref={lastNotificationElementRef}
                    className={`flex h-32 items-center justify-between ${
                      notification.isRead ? "" : "bg-gray-100"
                    } gap-x-2 p-4 border-b border-border-color
                               transition-all hover:bg-gray-100`}
                  >
                    <Link
                      href={`/account/order-tracking?orderKeyword=${notification.orderId}`}
                      key={notification.notificationId}
                    >
                      <p className="text-sm">{notification.content}</p>
                    </Link>
                    <DeleteIcon
                      className="cursor-pointer text-secondary-color"
                      onClick={() =>
                        handleDeleteNotification(notification.notificationId)
                      }
                    />
                  </div>
                );
              } else {
                return (
                  <div
                    key={notification.notificationId}
                    className={`flex h-32 items-center justify-between ${
                      notification.isRead ? "" : "bg-gray-100"
                    } gap-x-2 p-4 border-b border-border-color hover:bg-gray-100
                               transition-all`}
                  >
                    <Link
                      href={`/account/order-tracking?orderKeyword=${notification.orderId}`}
                      key={notification.notificationId}
                    >
                      <p className="text-sm">{notification.content}</p>
                    </Link>
                    <DeleteIcon
                      className="cursor-pointer text-secondary-color"
                      onClick={() =>
                        handleDeleteNotification(notification.notificationId)
                      }
                    />
                  </div>
                );
              }
            })
          ) : (
            <div className="w-full rounded-md h-[530px] grid place-items-center text-primary-color">
              <Image
                className="object-cover object-center size-72"
                alt="empty-notify"
                src={emptyNotify}
              ></Image>
            </div>
          )}
        </div>
        {internalNotifications &&
          internalNotifications.length > 0 &&
          loading && (
            <div className="absolute bottom-0 left-[48%] size-12">
              <CircleLoading />
            </div>
          )}
      </div>
    </div>
  );
};

export default NotificationPage;

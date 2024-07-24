import {
  ListResponseContent,
  ListResponseNotification,
  Pagination,
  SingleResponse,
} from "@/src/models";
import { handleError } from "@/src/utilities/handleError";
import { NotificationType } from "@/src/models/notification";
import axiosClientWithAuth from "./axiosClientWithAuth";

export const notificationApi = {
  async getUserNotifications(
    request: Pagination = {
      page: 0,
      size: 6,
    }
  ): Promise<ListResponseNotification<NotificationType> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/customers/notifications?page=${request.page}&size=${request.size}`
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async updateAllsToWatched(): Promise<SingleResponse<string> | undefined> {
    try {
      return await axiosClientWithAuth.patch(
        "/users/customers/notifications/watch-all"
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async updateOneToRead(
    notificationId: number
  ): Promise<SingleResponse<string> | undefined> {
    try {
      return await axiosClientWithAuth.patch(
        `/users/customers/notifications/read/${notificationId}`
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async deleteOneNotification(
    notificationId: number
  ): Promise<SingleResponse<string> | undefined> {
    try {
      return await axiosClientWithAuth.patch(
        `/users/customers/notifications/delete/${notificationId}`
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async updateAllsToRead(): Promise<SingleResponse<string> | undefined> {
    try {
      return await axiosClientWithAuth.patch(
        "/users/customers/notifications/read-all"
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
};

import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../redux/createAppSlice";
import { NotificationType } from "@/src/models/notification";
import { notificationApi } from "@/src/app/apis/notificationApi";
import {
  ListResponseNotification,
  Pagination,
  SingleResponse,
} from "@/src/models";
import { showToast } from "../../toastify";

export interface NotificationSliceState {
  value: NotificationType[];
  newNotification: number | null;
  totalElements: number;
  status: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: NotificationSliceState = {
  value: [],
  newNotification: null,
  totalElements: 0,
  status: "idle",
};

// If you are not using async thunks you can use the standalone `createSlice`.
export const notificationsSlice = createAppSlice({
  name: "notifications",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: (create) => ({
    // The function below is called a thunk and allows us to perform async logic. It
    // can be dispatched like a regular action: `dispatch(getUserNotifications(10))`. This
    // will call the thunk with the `dispatch` function as the first argument. Async
    // code can then be executed and other actions can be dispatched. Thunks are
    // typically used to make async requests.
    getUserNotifications: create.asyncThunk(
      async (request?: Pagination) => {
        const response = await notificationApi.getUserNotifications(request);
        // The value we return becomes the `fulfilled` action payload
        return response;
      },
      {
        fulfilled: (
          state,
          action: PayloadAction<
            ListResponseNotification<NotificationType> | undefined
          >
        ) => {
          const list = action.payload?.result.notificationPage;
          const newNotify = action.payload?.result.newNotification;
          const totalElements = action.payload?.result.totalElements;
          if (action.payload?.success == false) {
            state.status = "idle";
            state = initialState;
            return;
          }
          state.status = "succeeded";
          state.value = list || [];
          state.newNotification = newNotify ?? null;
          state.totalElements = totalElements ?? 0;
        },
      }
    ),
    updateAllNotificationsToWatch: create.asyncThunk(
      async (_: void) => {
        const response = await notificationApi.updateAllsToWatched();
        // The value we return becomes the `fulfilled` action payload
        return response;
      },
      {
        fulfilled: (state) => {
          state.status = "succeeded";
          state.newNotification = 0;
        },
      }
    ),
    updateOneNotificationsToRead: create.asyncThunk(
      async (notificationId: number) => {
        const response = await notificationApi.updateOneToRead(notificationId);
        // The value we return becomes the `fulfilled` action payload
        return response;
      },
      {
        fulfilled: (state) => {
          state.status = "succeeded";
          showToast("Đánh dấu đã đọc thông báo này", "success");
        },
      }
    ),
    deleteOneNotification: create.asyncThunk(
      async (notificationId: number) => {
        const response = await notificationApi.deleteOneNotification(
          notificationId
        );
        // The value we return becomes the `fulfilled` action payload
        return response;
      },
      {
        fulfilled: (state) => {
          state.status = "succeeded";
          showToast("Xóa thông báo thành công", "success");
        },
      }
    ),
    updateAllNotificationToRead: create.asyncThunk(
      async (_: void) => {
        const response = await notificationApi.updateAllsToRead();
        // The value we return becomes the `fulfilled` action payload
        return response;
      },
      {
        fulfilled: (state) => {
          state.status = "succeeded";
          state.value = state.value.map((item) => ({ ...item, isRead: true }));
          showToast("Đánh dấu đã đọc tất cả thông báo", "success");
        },
      }
    ),
  }),
  // You can define your selectors here. These selectors receive the slice
  // state as their first argument.
  selectors: {
    selectNotifications: (notifications) => notifications,
    selectNotifyStatus: (notifications) => notifications.status,
  },
});

// Action creators are generated for each case reducer function.
export const {
  getUserNotifications,
  updateAllNotificationsToWatch,
  updateOneNotificationsToRead,
  deleteOneNotification,
  updateAllNotificationToRead,
} = notificationsSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const { selectNotifications, selectNotifyStatus } =
  notificationsSlice.selectors;

// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.

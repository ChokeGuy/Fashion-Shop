import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../redux/createAppSlice";
import {
  InstantBuyRequest,
  ListResponseContent,
  Order,
  OrderItem,
  SingleResponseInstantBuy,
} from "@/src/models";
import { orderApi } from "@/src/app/apis/orderApi";
import { sessionOptions } from "@/src/config/session";
import { setCookie } from "cookies-next";

export interface OrderSliceState {
  value: Order[];
  status: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: OrderSliceState = {
  value: [],
  status: "idle",
};

// If you are not using async thunks you can use the standalone `createSlice`.
export const orderSlice = createAppSlice({
  name: "order",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: (create) => ({
    // The function below is called a thunk and allows us to perform async logic. It
    // can be dispatched like a regular action: `dispatch(getUserProfileAsync(10))`. This
    // will call the thunk with the `dispatch` function as the first argument. Async
    // code can then be executed and other actions can be dispatched. Thunks are
    // typically used to make async requests.
    getAllOrdersAsync: create.asyncThunk(
      async (_arg: void) => {
        const response = await orderApi.getAllOrders();
        return response;
        // The value we return becomes the `fulfilled` action payload
        // return response.data;
      },
      {
        fulfilled: (
          state,
          action: PayloadAction<ListResponseContent<Order> | undefined>
        ) => {
          const response = action.payload;
          if (!response) {
            state.status = "idle";
            state.value = initialState.value;
            return;
          }
          state.status = "succeeded";
          state.value = response.result.content;
        },
      }
    ),

   
    setOrders: create.reducer((state, action: PayloadAction<Order[]>) => {
      state.value = action.payload;
    }),
    resetOrderStatus: create.reducer((state) => {
      state.status = "idle";
    }),
  }),
  // You can define your selectors here. These selectors receive the slice
  // state as their first argument.
  selectors: {
    selectOrders: (order) => order.value,
    selectOrderStatus: (order) => order.status,
  },
});

// Action creators are generated for each case reducer function.
export const {
  getAllOrdersAsync,
  setOrders,
  resetOrderStatus,
} = orderSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const { selectOrders, selectOrderStatus } = orderSlice.selectors;

// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.

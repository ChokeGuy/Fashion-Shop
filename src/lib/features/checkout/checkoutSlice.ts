import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../redux/createAppSlice";
import { AppThunk } from "../../redux/store";
import {
  CartItem,
  InstantBuyRequest,
  Order,
  OrderItem,
  SingleResponseInstantBuy,
} from "@/src/models";
import { getCookie, setCookie } from "cookies-next";
import { Satellite } from "@mui/icons-material";
import { sessionOptions } from "@/src/config/session";
import { orderApi } from "@/src/app/apis/orderApi";

export interface CheckOutSliceState {
  value: CartItem[] | OrderItem[];
  status: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: CheckOutSliceState = {
  value: [],
  status: "idle",
};

// If you are not using async thunks you can use the standalone `createSlice`.
export const checkoutSlice = createAppSlice({
  name: "checkout",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: (create) => ({
    // The function below is called a thunk and allows us to perform async logic. It
    // can be dispatched like a regular action: `dispatch(getUserProfileAsync(10))`. This
    // will call the thunk with the `dispatch` function as the first argument. Async
    // code can then be executed and other actions can be dispatched. Thunks are
    // typically used to make async requests.
    getAllCheckOutItems: create.reducer(
      (
        state,
        action: PayloadAction<{
          itemName: string;
        }>
      ) => {
        const { itemName } = action.payload;
        const allCheckOutItems = getCookie(itemName);
        if (!allCheckOutItems) {
          state.status = "idle";
          state.value = initialState.value;
          return;
        }
        state.status = "succeeded";
        state.value = JSON.parse(allCheckOutItems);
      }
    ),
    setCheckOutItems: create.reducer(
      (
        state,
        action: PayloadAction<{
          promotionPrice: number | undefined;
          voucherId: number | null |undefined;
          allCheckOutItems: CartItem[] | OrderItem[];
        }>
      ) => {
        const { allCheckOutItems, promotionPrice, voucherId } = action.payload;

        state.status = "succeeded";
        setCookie(
          "checkoutItems",
          JSON.stringify(allCheckOutItems),
          sessionOptions(600)
        );
        setCookie("voucherId", JSON.stringify(voucherId), sessionOptions(600));
        setCookie(
          "promotionPrice",
          JSON.stringify(promotionPrice),
          sessionOptions(600)
        );
        state.value = allCheckOutItems as CartItem[];
      }
    ),
    changeCheckOutItemQuantity: create.reducer(
      (
        state,
        action: PayloadAction<{ cartItemId: number; quantity: number }>
      ) => {
        const { cartItemId, quantity } = action.payload;
        const cartItem = state.value.find((item: CartItem | OrderItem) => {
          if ("cartItemId" in item) return item.cartItemId === cartItemId;
        });
        if (cartItem) {
          cartItem.quantity = Math.max(quantity, 1);
        }
      }
    ),
    // instantBuyAsync: create.asyncThunk(
    //   async (item: InstantBuyRequest) => {
    //     const response = await orderApi.instantBuy(item);
    //     // The value we return becomes the `fulfilled` action payload
    //     return { response };
    //   },
    //   {
    //     fulfilled: (
    //       state,
    //       action: PayloadAction<{
    //         response: SingleResponseInstantBuy<Order> | undefined;
    //       }>
    //     ) => {
    //       const { response } = action.payload;
    //       if (
    //         response?.message ===
    //         "Quantity must be less than or equal to the inventory"
    //       ) {
    //         return;
    //       } else if (response?.statusCode == 404) {
    //         return;
    //       }
    //       if (!response) {
    //         state.status = "idle";
    //         state.value = initialState.value;
    //         return;
    //       }
    //       const allCheckOutItems = [response?.result.orderItem];

    //       setCheckOutItems({
    //         promotionPrice: 0,
    //         voucherId: -1,
    //         allCheckOutItems,
    //       });
    //       state.value = allCheckOutItems as OrderItem[];
    //     },
    //   }
    // ),

    deleteOneCheckOutItem: create.reducer(
      (state, action: PayloadAction<{ cartItemId: number }>) => {
        const { cartItemId } = action.payload;
        state.value = state.value.filter(
          (item) => "cartItemId" in item && item.cartItemId !== cartItemId
        ) as CartItem[];
      }
    ),
  }),
  // You can define your selectors here. These selectors receive the slice
  // state as their first argument.
  selectors: {
    selectCheckOuts: (checkout) => checkout.value,
    selectCheckOutStatus: (checkout) => checkout.status,
  },
});

// Action creators are generated for each case reducer function.
export const {
  getAllCheckOutItems,
  setCheckOutItems,
  deleteOneCheckOutItem,
  // instantBuyAsync,
} = checkoutSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const { selectCheckOuts, selectCheckOutStatus } =
  checkoutSlice.selectors;

// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.

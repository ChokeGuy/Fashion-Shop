import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../redux/createAppSlice";
import { ListResponseVoucher, Promotion } from "@/src/models";
import { sessionOptions } from "@/src/config/session";
import { setCookie } from "cookies-next";
import { userApi } from "@/src/app/apis/userApi";
import { BadRequest } from "@/src/app/errors/error-400";

export interface PromotionSliceState {
  value: Promotion[];
  status: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: PromotionSliceState = {
  value: [],
  status: "idle",
};

// If you are not using async thunks you can use the standalone `createSlice`.
export const promotionSlice = createAppSlice({
  name: "promotion",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: (create) => ({
    // The function below is called a thunk and allows us to perform async logic. It
    // can be dispatched like a regular action: `dispatch(getUserProfileAsync(10))`. This
    // will call the thunk with the `dispatch` function as the first argument. Async
    // code can then be executed and other actions can be dispatched. Thunks are
    // typically used to make async requests.
    getAllPromotionsAsync: create.asyncThunk(
      async (price: number) => {
        const response = await userApi.getAvailableVouchers(price);
        return response;
        // The value we return becomes the `fulfilled` action payload
        // return response.data;
      },
      {
        fulfilled: (
          state,
          action: PayloadAction<ListResponseVoucher<Promotion> | undefined>
        ) => {
          const response = action.payload;
          if (!response) {
            state.status = "idle";
            state.value = initialState.value;
            return;
          }
          state.status = "succeeded";
          state.value = response.result.availableVouchers;
        },
      }
    ),

    setPromotions: create.reducer(
      (state, action: PayloadAction<Promotion[]>) => {
        state.value = action.payload;
      }
    ),
    resetPromotionStatus: create.reducer((state) => {
      state.status = "idle";
    }),
  }),
  // You can define your selectors here. These selectors receive the slice
  // state as their first argument.
  selectors: {
    selectPromotions: (promotion) => promotion.value,
    selectPromotionStatus: (promotion) => promotion.status,
  },
});

// Action creators are generated for each case reducer function.
export const { getAllPromotionsAsync, setPromotions, resetPromotionStatus } =
  promotionSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const { selectPromotions, selectPromotionStatus } =
  promotionSlice.selectors;

// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.

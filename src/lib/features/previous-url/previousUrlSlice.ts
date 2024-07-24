import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../redux/createAppSlice";
import { AppThunk } from "../../redux/store";

export interface UrlSliceState {
  value: string;
}

const initialState: UrlSliceState = {
  value: "/",
};

// If you are not using async thunks you can use the standalone `createSlice`.
export const urlSlice = createAppSlice({
  name: "prevUrl",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: (create) => ({
    setPreviousUrl: create.reducer((state, payload: PayloadAction<string>) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.value = payload.payload;
    }),
    // The function below is called a thunk and allows us to perform async logic. It
    // can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
    // will call the thunk with the `dispatch` function as the first argument. Async
    // code can then be executed and other actions can be dispatched. Thunks are
    // typically used to make async requests.
  }),
  // You can define your selectors here. These selectors receive the slice
  // state as their first argument.
  selectors: {
    selectUrl: (url) => url.value,
  },
});

// Action creators are generated for each case reducer function.
export const { setPreviousUrl } = urlSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const { selectUrl } = urlSlice.selectors;

// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.

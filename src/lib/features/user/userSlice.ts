import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../redux/createAppSlice";
import {
  ChangePassword,
  CreateAddressResponse,
  ListResponseAddress,
  SingleResponse,
  SingleResponseAddress,
  User,
  UserProfile,
} from "@/src/models";
import { userApi } from "@/src/app/apis/userApi";
import { addressApi } from "@/src/app/apis/addressApi";

export interface UserSliceState {
  value: User;
  status: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: UserSliceState = {
  value: {
    userId: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    fullname: "",
    email: "",
    phone: "",
    avatar: "",
    gender: "",
    role: "",
    addresses: [],
    isVerified: false,
  },
  status: "idle",
};

// If you are not using async thunks you can use the standalone `createSlice`.
export const userSlice = createAppSlice({
  name: "user",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: (create) => ({
    // The function below is called a thunk and allows us to perform async logic. It
    // can be dispatched like a regular action: `dispatch(getUserProfileAsync(undefined))`. This
    // will call the thunk with the `dispatch` function as the first argument. Async
    // code can then be executed and other actions can be dispatched. Thunks are
    // typically used to make async requests.
    getUserProfileAsync: create.asyncThunk(
      async (_arg: void) => {
        const response = await userApi.getUserInfo();
        return response;
      },
      {
        fulfilled: (
          state,
          action: PayloadAction<SingleResponse<User> | undefined>
        ) => {
          const response = action.payload;
          if (!response) {
            state.status = "idle";
            state.value = initialState.value;
            return;
          }
          state.status = "succeeded";
          state.value = {
            ...response.result,
            addresses: response.result.addresses || "",
          };
        },
      }
    ),
    updateUserProfileAsync: create.asyncThunk(
      async (userProfile: UserProfile) => {
        const response = await userApi.updateUserProfile(userProfile);
        return response;
      },
      {
        fulfilled: (
          state,
          action: PayloadAction<SingleResponse<User> | undefined>
        ) => {
          const response = action.payload;
          if (!response) {
            state.status = "idle";
            state.value = initialState.value;
            return;
          }
          state.status = "succeeded";
          state.value = {
            ...response.result,
            addresses: response.result.addresses || [],
          };
        },
      }
    ),
    resetUserProfile: create.reducer((state) => {
      state.value = initialState.value;
    }),
    setUserProfile: create.reducer((state, action: PayloadAction<User>) => {
      state.value = {
        ...action.payload,
        addresses: action.payload.addresses || [],
      };
    }),
  }),
  // You can define your selectors here. These selectors receive the slice
  // state as their first argument.
  selectors: {
    selectUser: (user) => user.value,
    selectUserStatus: (user) => user.status,
  },
});

// Action creators are generated for each case reducer function.
export const {
  getUserProfileAsync,
  setUserProfile,
  updateUserProfileAsync,
  resetUserProfile,
} = userSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const { selectUser, selectUserStatus } = userSlice.selectors;

// We can also write thunks by hand, which may contain both sync and async logic.

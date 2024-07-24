import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../redux/createAppSlice";
import {
  CreateAddress,
  CreateAddressResponse,
  ListResponseAddress,
  SingleResponseAddress,
} from "@/src/models";
import { addressApi } from "@/src/app/apis/addressApi";
import { showToast } from "../../toastify";

export interface AddressSliceState {
  value: CreateAddress[];
  status: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: AddressSliceState = {
  value: [],
  status: "idle",
};

// If you are not using async thunks you can use the standalone `createSlice`.
export const addressSlice = createAppSlice({
  name: "address",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: (create) => ({
    // The function below is called a thunk and allows us to perform async logic. It
    // can be dispatched like a regular action: `dispatch(getUserProfileAsync(undefined))`. This
    // will call the thunk with the `dispatch` function as the first argument. Async
    // code can then be executed and other actions can be dispatched. Thunks are
    // typically used to make async requests.
    getUserAddressAsync: create.asyncThunk(
      async (_arg: void) => {
        const response = await addressApi.getAllUserAddresses();
        return response;
      },
      {
        fulfilled: (
          state,
          action: PayloadAction<
            ListResponseAddress<CreateAddressResponse> | undefined
          >
        ) => {
          const response = action.payload;
          if (!response) {
            state.status = "idle";
            state.value = initialState.value;
            return;
          }
          state.status = "succeeded";
          state.value = response.result.content || [];
        },
      }
    ),
    createUserAddressAsync: create.asyncThunk(
      async (request: {
        address: string;
        phone: string;
        recipientName: string;
      }) => {
        const response = await addressApi.createUserAddress(request);
        return response;
      },
      {
        fulfilled: (
          state,
          action: PayloadAction<
            SingleResponseAddress<CreateAddress> | undefined
          >
        ) => {
          const response = action.payload;
          if (!response) {
            state.status = "idle";
            state.value = initialState.value;
            return;
          }
          state.status = "succeeded";
          showToast("Thêm địa chỉ thành công", "success");
          state.value.push(response.result.content);
        },
      }
    ),
    updateUserAddressAsync: create.asyncThunk(
      async (request: {
        addressId: number;
        address: string;
        phone: string;
        recipientName: string;
      }) => {
        const response = await addressApi.updateUserAddress(request);
        return response;
      },
      {
        fulfilled: (
          state,
          action: PayloadAction<
            SingleResponseAddress<CreateAddress> | undefined
          >
        ) => {
          const response = action.payload;
          if (!response) {
            state.status = "idle";
            state.value = initialState.value;
            return;
          }
          state.status = "succeeded";
          state.value = state.value.map((value) => {
            if (value.addressId === response.result.content.addressId) {
              return response.result.content;
            }
            return value;
          });
          showToast("Cập nhật địa chỉ thành công", "success");
        },
      }
    ),
    deleteUserAddressAsync: create.asyncThunk(
      async (addressId: number) => {
        const response = await addressApi.deleteUserAddress(addressId);
        return { response, addressId };
      },
      {
        fulfilled: (state, action) => {
          const { response, addressId } = action.payload;
          if (!response) {
            state.status = "idle";
            state.value = initialState.value;
            return;
          }
          state.status = "succeeded";
          state.value = state.value.filter(
            (value) => value.addressId !== addressId
          );
          showToast("Xóa địa chỉ thành công", "success");
        },
      }
    ),
    setDefaultAddressAsync: create.asyncThunk(
      async (addressId: number) => {
        const response = await addressApi.setDefaultAddress(addressId);
        return { response, addressId };
      },
      {
        fulfilled: (state, action) => {
          const { response, addressId } = action.payload;
          if (!response) {
            state.status = "idle";
            state.value = initialState.value;
            return;
          }
          state.status = "succeeded";
          state.value = state.value
            .map((value) => {
              if (value.addressId === addressId) {
                return {
                  ...value,
                  defaultAddress: true,
                };
              }
              return {
                ...value,
                defaultAddress: false,
              };
            })
            .sort((a, b) => (b.defaultAddress ? 1 : -1));
          showToast("Thiết lập mặc định thành công", "success");
        },
      }
    ),
  }),
  // You can define your selectors here. These selectors receive the slice
  // state as their first argument.
  selectors: {
    selectAddresses: (address) => address.value,
    selectAddressesStatus: (address) => address.status,
  },
});

// Action creators are generated for each case reducer function.
export const {
  getUserAddressAsync,
  createUserAddressAsync,
  updateUserAddressAsync,
  deleteUserAddressAsync,
  setDefaultAddressAsync,
} = addressSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const { selectAddresses, selectAddressesStatus } =
  addressSlice.selectors;

// We can also write thunks by hand, which may contain both sync and async logic.

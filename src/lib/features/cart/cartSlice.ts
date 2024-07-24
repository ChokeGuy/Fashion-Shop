import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../redux/createAppSlice";
import {
  AddToCartRequest,
  Cart,
  CartItem,
  CartItemResponse,
  CartResponse,
  SingleResponse,
  UpdateCartRequest,
} from "@/src/models";
import { cartApi } from "@/src/app/apis/cartApi";

export interface CartSliceState {
  value: Cart;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string;
}

const initialState: CartSliceState = {
  value: {} as Cart,
  status: "idle",
  error: "",
};

// If you are not using async thunks you can use the standalone `createSlice`.
export const cartSlice = createAppSlice({
  name: "cart",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: (create) => ({
    // The function below is called a thunk and allows us to perform async logic. It
    // can be dispatched like a regular action: `dispatch(getUserProfileAsync(10))`. This
    // will call the thunk with the `dispatch` function as the first argument. Async
    // code can then be executed and other actions can be dispatched. Thunks are
    // typically used to make async requests.
    getAllCartItemsAsync: create.asyncThunk(
      async (_arg: void) => {
        const response = await cartApi.getAllCarts();
        // The value we return becomes the `fulfilled` action payload
        return response;
      },
      {
        fulfilled: (
          state,
          action: PayloadAction<SingleResponse<CartResponse> | undefined>
        ) => {
          const response = action.payload;
          if (!response) {
            state.status = "idle";
            state.value = initialState.value;
            return;
          }
          state.status = "succeeded";
          state.error = "";
          state.value = response.result;
        },
      }
    ),
    addItemToCartAsync: create.asyncThunk(
      async (item: AddToCartRequest) => {
        const response = await cartApi.addItemsToCart(item);
        // The value we return becomes the `fulfilled` action payload
        return { response, quantity: item.quantity };
      },
      {
        fulfilled: (
          state,
          action: PayloadAction<{
            response: SingleResponse<CartItemResponse> | undefined;
            quantity: number;
          }>
        ) => {
          const { response, quantity } = action.payload;
          if (
            response?.message ===
            "Quantity must be less than or equal to the inventory"
          ) {
            state.error = "Không đủ sản phẩm trong kho";
            return;
          } else if (response?.statusCode == 404) {
            state.error = "Không tìm thấy sản phẩm";
            return;
          }
          if (!response) {
            state.status = "idle";
            state.value = initialState.value;
            return;
          }
          state.status = "succeeded";
          state.error = "";
          console.log(response);
          // Check if the item already exists in the cart
          const existingItem = state.value.cartItems.find(
            (cartItem) => cartItem.cartItemId === response.result.cartItemId
          );

          if (existingItem) {
            // If the item already exists, just increase its quantity
            existingItem.quantity += quantity;
          } else {
            console.log(response.result);
            // If the item does not exist, add it to the cart and increase the cartItemsQuantity
            state.value.cartItems.push(response.result);
            state.value.cartItemsQuantity += 1;
          }
        },
      }
    ),

    changeCartItemQuantityAsync: create.asyncThunk(
      async (request: UpdateCartRequest) => {
        const response = await cartApi.updateCartItem(request.cartItemId, {
          quantity: Number(request.quantity),
        });
        // The value we return becomes the `fulfilled` action payload
        return { response, cartItem: request };
      },
      {
        fulfilled: (
          state,
          action: PayloadAction<{
            response: SingleResponse<CartItemResponse> | undefined;
            cartItem: UpdateCartRequest;
          }>
        ) => {
          const { response, cartItem } = action.payload;
          if (
            response?.message ===
            "Quantity must be less than or equal to the inventory"
          ) {
            // Find the item in state.value and update its quantity
            const item = state.value.cartItems.find(
              (item) => item.cartItemId === cartItem.cartItemId
            );
            if (item) {
              item.quantity = response.result as unknown as number;
            }
            state.error = "Không đủ sản phẩm trong kho";
            return;
          }
          if (!response?.message) {
            const item = state.value.cartItems.find(
              (item) => item.cartItemId === cartItem.cartItemId
            );
            if (item) {
              item.quantity = 1;
            }
            return;
          }
          state.status = "succeeded";
          state.error = "";
          // Find the item in state.value and update its quantity
          const index = state.value.cartItems.findIndex(
            (item) => item.cartItemId === cartItem.cartItemId
          );
          if (index !== -1) {
            state.value.cartItems[index] = {
              ...state.value.cartItems[index],
              ...response.result,
            };
          }
        },
      }
    ),
    deleteOneCartItemAsync: create.asyncThunk(
      async (cartItemId: number) => {
        const response = await cartApi.deleteCartItem(cartItemId);
        // The value we return becomes the `fulfilled` action payload
        return { response, cartItemId };
      },
      {
        fulfilled: (
          state,
          action: PayloadAction<{
            response: SingleResponse<String> | undefined;
            cartItemId: number;
          }>
        ) => {
          const { response, cartItemId } = action.payload;
          if (!response) {
            state.status = "idle";
            state.value = initialState.value;
            return;
          }
          state.status = "succeeded";
          // Remove the deleted item from the cart
          state.value.cartItemsQuantity -= 1;
          if (state.value.cartItemsQuantity <= 0) {
            state.value.cartItemsQuantity = 0;
          }
          state.value.cartItems = state.value.cartItems.filter(
            (item) => item.cartItemId !== cartItemId
          );
        },
      }
    ),
    deleteManyCartItemsAsync: create.asyncThunk(
      async (cartItemIdList: number[]) => {
        const promises = cartItemIdList.map((cartItemId) =>
          cartApi.deleteCartItem(cartItemId)
        );
        const results = await Promise.all(promises);
        // The value we return becomes the `fulfilled` action payload
        return { results: results[results.length - 1], cartItemIdList };
      },
      {
        fulfilled: (
          state,
          action: PayloadAction<{
            results: SingleResponse<String> | undefined;
            cartItemIdList: number[];
          }>
        ) => {
          const { results, cartItemIdList } = action.payload;
          console.log("Results ", results);
          console.log("CartItemIdList ", cartItemIdList);
          if (!results) {
            state.status = "idle";
            state.value = initialState.value;
            return;
          }
          state.status = "succeeded";
          state.error = "";
          // Remove the deleted items from state.value.cartItems
          state.value.cartItems = state.value.cartItems.filter(
            (item) => !cartItemIdList.includes(item.cartItemId)
          );
        },
      }
    ),
    deleteAllCartItemsAsync: create.asyncThunk(
      async (_arg: void) => {
        const response = await cartApi.deleteAllCartItems();
        // The value we return becomes the `fulfilled` action payload
        return response;
      },
      {
        fulfilled: (
          state,
          action: PayloadAction<SingleResponse<String> | undefined>
        ) => {
          const response = action.payload;
          if (!response) {
            state.status = "idle";
            state.value = initialState.value;
            return;
          }
          state.status = "succeeded";
          state.error = "";
        },
      }
    ),
  }),
  // You can define your selectors here. These selectors receive the slice
  // state as their first argument.
  selectors: {
    selectCarts: (cart) => cart.value,
    selectCartStatus: (cart) => cart.status,
    selectCartError: (cart) => cart.error,
  },
});

// Action creators are generated for each case reducer function.
export const {
  getAllCartItemsAsync,
  addItemToCartAsync,
  changeCartItemQuantityAsync,
  deleteOneCartItemAsync,
  deleteManyCartItemsAsync,
  deleteAllCartItemsAsync,
} = cartSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const { selectCarts, selectCartStatus, selectCartError } =
  cartSlice.selectors;

// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.

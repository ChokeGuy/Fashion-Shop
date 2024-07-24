import { handleError } from "@/src/utilities/handleError";
import axiosClientWithAuth from "./axiosClientWithAuth";
import {
  AddToCartRequest,
  CartItemResponse,
  CartResponse,
  SingleResponse,
  UpdateCartRequest,
} from "@/src/models";

export const cartApi = {
  async addItemsToCart(
    request: AddToCartRequest
  ): Promise<SingleResponse<CartItemResponse> | undefined> {
    try {
      return await axiosClientWithAuth.post(
        `/users/customers/carts/cartItems`,
        request
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async getAllCarts(): Promise<SingleResponse<CartResponse> | undefined> {
    try {
      return await axiosClientWithAuth.get(`/users/customers/carts`);
    } catch (error: any) {
      handleError(error);
    }
  },

  async updateCartItem(
    cartItemId: number,
    request: { quantity: number | string }
  ): Promise<SingleResponse<CartItemResponse> | undefined> {
    try {
      return await axiosClientWithAuth.patch(
        `/users/customers/carts/cartItems/${cartItemId}`,
        request
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async deleteCartItem(
    cartItemId: number
  ): Promise<SingleResponse<String> | undefined> {
    try {
      return await axiosClientWithAuth.delete(
        `/users/customers/carts/cartItems/${cartItemId}`
      );
    } catch (error: any) {
      handleError(error);
    }
  },
  async deleteAllCartItems(): Promise<SingleResponse<String> | undefined> {
    try {
      return await axiosClientWithAuth.delete(
        `/users/customers/carts/cartItems`
      );
    } catch (error: any) {
      handleError(error);
    }
  },
};

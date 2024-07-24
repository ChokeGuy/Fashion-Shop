import {
  InstantBuyRequest,
  ListResponse,
  ListResponseContent,
  Order,
  OrderDetailResponse,
  OrderRequest,
  Promotion,
  Rating,
  RatingOrderItemRequest,
  SingleResponse,
  SingleResponseContent,
  SingleResponseInstantBuy,
  User,
} from "@/src/models";
import { handleError } from "@/src/utilities/handleError";
import axiosClientWithAuth from "./axiosClientWithAuth";

export const orderApi = {
  async getAllOrders(): Promise<ListResponseContent<Order> | undefined> {
    try {
      return await axiosClientWithAuth.get(`/users/customers/orders`);
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },

  async getOrdersById(request: {
    orderId: number;
  }): Promise<SingleResponse<OrderDetailResponse> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/customers/orders/${request.orderId}`
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async getOrdersByProductName(request: {
    productName: String;
  }): Promise<ListResponseContent<Order> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/customers/orders/productNames?productName=${request.productName}`
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },

  async makeAnOrder(
    request: OrderRequest
  ): Promise<SingleResponseContent<Order> | undefined> {
    try {
      return await axiosClientWithAuth.post(`/users/customers/orders`, request);
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async vnPayCheckout(
    orderId: number
  ): Promise<SingleResponse<string> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/customers/orders/${orderId}/checkout-eWallet`
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },

  async cancelOrders(
    orderId: number
  ): Promise<SingleResponse<string> | undefined> {
    try {
      return await axiosClientWithAuth.patch(
        `/users/customers/orders/cancel/${orderId}`
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },

  async ratingOrderItems(
    request: RatingOrderItemRequest,
    orderItemId: number
  ): Promise<SingleResponse<string> | undefined> {
    try {
      return await axiosClientWithAuth.post(
        `/users/customers/ratings/${orderItemId}`,
        request
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async updateOrderToRated(
    orderId: number
  ): Promise<SingleResponse<User> | undefined> {
    try {
      return await axiosClientWithAuth.patch(
        `/users/customers/orders/${orderId}/update-to-rated`
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async getRatingByOrderId(
    orderId: number
  ): Promise<ListResponse<Rating> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/customers/ratings/${orderId}`
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },

  async getRatingOrderItems(
    orderItemId: number
  ): Promise<SingleResponse<string> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/customers/ratings/${orderItemId}`
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },

  async rePayoutOrder(
    orderId: number,
    request: Omit<OrderRequest, "cartItemIds" | "voucherId">
  ): Promise<SingleResponse<string> | undefined> {
    try {
      return await axiosClientWithAuth.patch(
        `/users/customers/orders/information/${orderId}`,
        request
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async instantBuy(
    request: InstantBuyRequest
  ): Promise<SingleResponseInstantBuy<Order> | undefined> {
    try {
      return await axiosClientWithAuth.post(
        `/users/customers/buy-now`,
        request
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async getVoucher(
    voucherCode: string
  ): Promise<SingleResponse<Promotion> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/customers/vouchers/available-by-code?voucherCode=${voucherCode}`
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },

  async applyVoucher(request: {
    voucherId: number;
    amount: number;
  }): Promise<SingleResponse<number> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/customers/vouchers/${request.voucherId}/discount-amount?amount=${request.amount}`
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
};

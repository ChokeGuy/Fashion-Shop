import {
  ListResponseContent,
  Order,
  OrderDetailResponse,
  SingleResponse,
} from "@/src/models";
import { handleError } from "@/src/utilities/handleError";
import axiosServerWithAuth from "./axiosServerWithAuth";

export const orderServerApi = {
  async getOrdersById(request: {
    orderId: number;
  }): Promise<SingleResponse<OrderDetailResponse> | undefined> {
    try {
      return await axiosServerWithAuth.get(
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
      return await axiosServerWithAuth.get(
        `/users/customers/orders/productNames?productName=${request.productName}`
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
};

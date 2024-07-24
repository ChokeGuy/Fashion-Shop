import {
  ChangeOrderStatusToShippingRequest,
  ListResponseContent,
  ListResponseOrder,
  OrderItem,
  SingleResponse,
} from "@/src/models";
import { Order } from "@/src/models";
import { handleError } from "@/src/utilities/handleError";
import axiosClientWithAuth from "../axiosClientWithAuth";
import { OrderStatus } from "@/src/constants/orderStatus";

export const adminOrderApi = {
  async getAllOrders(
    request: {
      page: number;
      size: number;
    } = {
      page: 0,
      size: 10,
    }
  ): Promise<ListResponseContent<Order> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/admin/orders?page=${request.page}&size=${request.size}`
      );
    } catch (error: any) {
      handleError(error);
    }
  },
  async getOrdersByStatus(
    status: OrderStatus,
    request: {
      page: number;
      size: number;
    } = {
      page: 0,
      size: 10,
    }
  ): Promise<ListResponseContent<Order> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/admin/orders/statuses?status=${status}&page=${request.page}&size=${request.size}`
      );
    } catch (error: any) {
      handleError(error);
    }
  },
  async getOrderItemsById(
    orderId: number
  ): Promise<ListResponseOrder<OrderItem, Order> | undefined> {
    try {
      return await axiosClientWithAuth.get(`/users/admin/orders/${orderId}`);
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async getOrderDelivery(
    orderId: number
  ): Promise<ListResponseContent<Order> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/admin/orders/${orderId}/delivery`
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async updateOrderStatusToProcessing(
    orderId: number
  ): Promise<ListResponseContent<Order> | undefined> {
    try {
      return await axiosClientWithAuth.patch(
        `/users/admin/orders/toProcessing/${orderId}`
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async updateOrderStatusToShipping(
    request: ChangeOrderStatusToShippingRequest
  ): Promise<ListResponseContent<Order> | undefined> {
    try {
      return await axiosClientWithAuth.patch(
        `/users/admin/orders/toShipping/${request.orderId}?shipperEmail=${request.shipperEmail}`
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
};

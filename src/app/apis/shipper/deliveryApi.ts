import {
  DeliveryResponse,
  ListResponseDelivery,
  Pagination,
  SingleResponseDelivery,
} from "@/src/models";
import { handleError } from "@/src/utilities/handleError";
import axiosClientWithAuth from "../axiosClientWithAuth";

export const deliveryApi = {
  async getAllDeliveries(
    request: Pagination = { page: 0, size: 10 }
  ): Promise<ListResponseDelivery<DeliveryResponse> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/shippers/deliveries?page=${request.page}&size=${request.size}`
      );
    } catch (error: any) {
      handleError(error);
    }
  },
  async getDeliveries(
    type: "not-received" | "received-notDelivered" | "delivered",
    request: Pagination = { page: 0, size: 10 }
  ): Promise<ListResponseDelivery<DeliveryResponse> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/shippers/deliveries/${type}?page=${request.page}&size=${request.size}`
      );
    } catch (error: any) {
      handleError(error);
    }
  },

  async getDeliveryById(
    deliveryId: number
  ): Promise<SingleResponseDelivery<DeliveryResponse> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/shippers/deliveries/${deliveryId}`
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async receiveOrder(
    deliveryId: number
  ): Promise<SingleResponseDelivery<DeliveryResponse> | undefined> {
    try {
      return await axiosClientWithAuth.patch(
        `/users/shippers/deliveries/${deliveryId}/receive`
      );
    } catch (error: any) {
      handleError(error);
    }
  },
  async deliverOrder(
    deliveryId: number
  ): Promise<SingleResponseDelivery<DeliveryResponse> | undefined> {
    try {
      return await axiosClientWithAuth.patch(
        `/users/shippers/deliveries/${deliveryId}/deliver`
      );
    } catch (error: any) {
      handleError(error);
    }
  },
};

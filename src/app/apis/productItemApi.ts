import {
  ListResponseContent,
  ProductItemResponse,
  SingleResponse,
} from "@/src/models";
import axiosClient from "./axiosClient";
import { handleError } from "@/src/utilities/handleError";

export const productItemApi = {
  async getProductItemsById(
    productId: string
  ): Promise<ListResponseContent<ProductItemResponse> | undefined> {
    try {
      return await axiosClient.get(`/productItems/parent/${productId}`);
    } catch (error: any) {
      handleError(error);
    }
  },
  async getProductItemByProductItemId(
    productItemId: string | number
  ): Promise<SingleResponse<ProductItemResponse> | undefined> {
    try {
      return await axiosClient.get(`/productItems/${productItemId}`);
    } catch (error: any) {
      handleError(error);
    }
  },
};

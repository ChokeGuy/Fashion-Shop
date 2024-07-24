import {
  AddProductItemRequest,
  KeyString,
  ListResponseContent,
  ProductItemResponse,
  ProductResponse,
  SingleResponse,
  UpdateProductItemRequest,
} from "@/src/models";
import { handleError } from "@/src/utilities/handleError";
import axiosClientWithAuth from "../axiosClientWithAuth";

export const adminProductItemApi = {
  async getAllProductItemsByProductId(
    productId: number
  ): Promise<ListResponseContent<ProductItemResponse> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/admin/productItems/parent/${productId}`
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async changeProductItemActivation(
    productItemId: number
  ): Promise<SingleResponse<ProductItemResponse> | undefined> {
    try {
      return await axiosClientWithAuth.patch(
        `/users/admin/productItems/${productItemId}/toggle-product-item-status`
      );
    } catch (e: any) {
      handleError(e);
      return e.response.data;
    }
  },

  async createNewProductItem(
    request: AddProductItemRequest & KeyString
  ): Promise<SingleResponse<ProductItemResponse> | undefined> {
    try {
      const formData = new FormData();
      for (const key in request) {
        if (Object.prototype.hasOwnProperty.call(request, key)) {
          formData.append(key, request[key]);
        }
      }
      return await axiosClientWithAuth.post(
        "/users/admin/productItems",
        formData
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },

  async updateProductItem(
    productItemId: number,
    request: UpdateProductItemRequest & KeyString
  ): Promise<SingleResponse<ProductItemResponse> | undefined> {
    try {
      const formData = new FormData();
      for (const key in request) {
        if (Object.prototype.hasOwnProperty.call(request, key)) {
          formData.append(key, request[key]);
        }
      }
      return await axiosClientWithAuth.patch(
        `/users/admin/productItems/${productItemId}`,
        formData
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
};

import {
  AddProductRequest,
  KeyString,
  ListResponseContent,
  ProductRequest,
  ProductResponse,
  SingleResponse,
  UpdateProductRequest,
} from "@/src/models";
import { handleError } from "@/src/utilities/handleError";
import axiosClientWithAuth from "../axiosClientWithAuth";

export const adminProductApi = {
  async getAllProducts(
    request: {
      page: number;
      size: number;
      productName?: string;
    } = {
      page: 0,
      size: 5,
      productName: "",
    }
  ): Promise<ListResponseContent<ProductResponse> | undefined> {
    try {
      const { page, size, productName } = request;
      const queryParams = `page=${page}&size=${size}&productName=${productName}`;
      return await axiosClientWithAuth.get(
        `/users/admin/products?${queryParams}`
      );
    } catch (error: any) {
      handleError(error);
    }
  },
  async getProductById(
    productId: number
  ): Promise<SingleResponse<ProductResponse> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/admin/products/${productId}`
      );
    } catch (error: any) {
      handleError(error);
    }
  },

  async createNewProduct(
    request: AddProductRequest & KeyString
  ): Promise<SingleResponse<ProductResponse> | undefined> {
    try {
      const formData = new FormData();
      for (const key in request) {
        if (Object.prototype.hasOwnProperty.call(request, key)) {
          formData.append(key, request[key]);
        }
      }
      return await axiosClientWithAuth.post("/users/admin/products", formData);
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },

  async updateProduct(
    productId: number,
    request: UpdateProductRequest & KeyString
  ): Promise<SingleResponse<ProductResponse> | undefined> {
    try {
      const formData = new FormData();
      for (const key in request) {
        if (Object.prototype.hasOwnProperty.call(request, key)) {
          formData.append(key, request[key]);
        }
      }
      return await axiosClientWithAuth.patch(
        `/users/admin/products/${productId}`,
        formData
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async changeProductActivation(
    productId: number
  ): Promise<SingleResponse<ProductResponse> | undefined> {
    try {
      return await axiosClientWithAuth.patch(
        `/users/admin/products/${productId}/toggle-product-status`
      );
    } catch (e: any) {
      handleError(e);
      return e.response.data;
    }
  },
};

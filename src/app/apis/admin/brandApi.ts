import {
  AddBrandRequest,
  BrandRequest,
  BrandResponse,
  KeyString,
  ListResponseContent,
  Pagination,
  SingleResponse,
  UpdateBrandRequest,
} from "@/src/models";
import { handleError } from "@/src/utilities/handleError";
import axiosClientWithAuth from "../axiosClientWithAuth";

export const adminBrandApi = {
  async getAllBrands(
    request: Pagination = { page: 0, size: 10 }
  ): Promise<ListResponseContent<BrandResponse> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/admin/brands?page=${request.page}&size=${request.size}`
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },

  async getBrandsByName(
    brandName: string,
    request: Pagination = { page: 0, size: 10 }
  ): Promise<ListResponseContent<BrandResponse> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/admin/brands?brandName=${brandName}&page=${request.page}&size=${request.size}`
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async getBrandById(
    brandId: number
  ): Promise<SingleResponse<BrandResponse> | undefined> {
    try {
      return await axiosClientWithAuth.get(`/users/admin/brands/${brandId}`);
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },

  async createNewBrand(
    request: AddBrandRequest & KeyString
  ): Promise<SingleResponse<BrandResponse> | undefined> {
    try {
      return await axiosClientWithAuth.post("/users/admin/brands", request);
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async updateBrand(
    brandId: number,
    request: UpdateBrandRequest & KeyString
  ): Promise<SingleResponse<BrandResponse> | undefined> {
    try {
      return await axiosClientWithAuth.patch(
        `/users/admin/brands/${brandId}`,
        request
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async changeBrandActivation(
    brandId: number
  ): Promise<SingleResponse<BrandResponse> | undefined> {
    try {
      return await axiosClientWithAuth.patch(
        `/users/admin/brands/${brandId}/toggle-brand-status`
      );
    } catch (e: any) {
      handleError(e);
      return e.response.data;
    }
  },
};

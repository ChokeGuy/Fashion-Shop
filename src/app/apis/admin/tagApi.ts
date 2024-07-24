import {
  TagResponse,
  ListResponseContent,
  Pagination,
  SingleResponse,
  ListResponse,
} from "@/src/models";
import { handleError } from "@/src/utilities/handleError";
import axiosClientWithAuth from "../axiosClientWithAuth";

export const adminTagApi = {
  async getAllTags(
    name: string = "",
    request: Pagination = {
      page: 0,
      size: 10,
    }
  ): Promise<ListResponseContent<TagResponse> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/admin/products/tags?name=${name}&page=${request.page}&size=${request.size}`
      );
    } catch (error: any) {
      handleError(error);
    }
  },

  async getAllTagsForProduct(productId: number): // request: Pagination = {
  //   page: 0,
  //   size: 10,
  // }
  Promise<ListResponse<TagResponse> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/admin/products/${productId}/tags`
      );
    } catch (error: any) {
      handleError(error);
    }
  },
  async getTagById(
    tagId: number
  ): Promise<SingleResponse<TagResponse> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/admin/products/tags/${tagId}`
      );
    } catch (error: any) {
      handleError(error);
    }
  },
  async createNewTag(request: {
    name: string;
  }): Promise<ListResponse<TagResponse> | undefined> {
    try {
      return await axiosClientWithAuth.post(
        "/users/admin/products/tags",
        request
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async updateTag(
    tagId: number,
    request: { name: string }
  ): Promise<SingleResponse<TagResponse> | undefined> {
    try {
      return await axiosClientWithAuth.patch(
        `/users/admin/products/tags/${tagId}`,
        request
      );
    } catch (e: any) {
      handleError(e);
      return e.response.data;
    }
  },

  async deleteTag(
    tagId: number
  ): Promise<SingleResponse<TagResponse> | undefined> {
    try {
      return await axiosClientWithAuth.delete(
        `/users/admin/products/tags/${tagId}`
      );
    } catch (e: any) {
      handleError(e);
      return e.response.data;
    }
  },

  async addTagForProduct(request: {
    productId: number;
    tagId: number;
  }): Promise<ListResponse<TagResponse> | undefined> {
    try {
      return await axiosClientWithAuth.patch(
        `/users/admin/products/${request.productId}/tags/add/${request.tagId}`,
        request
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async removeTagForProduct(request: {
    productId: number;
    tagId: number;
  }): Promise<ListResponse<TagResponse> | undefined> {
    try {
      return await axiosClientWithAuth.patch(
        `/users/admin/products/${request.productId}/tags/remove/${request.tagId}`,
        request
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
};

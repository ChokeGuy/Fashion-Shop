import {
  CategoryResponse,
  KeyString,
  ListResponse,
  ListResponseCategories,
  ListResponseContent,
  Pagination,
  SingleResponse,
} from "@/src/models";
import { Category } from "@/src/models";
import { handleError } from "@/src/utilities/handleError";
import axiosClientWithAuth from "../axiosClientWithAuth";

export const adminCategoryApi = {
  async getAllCategories(
    request: Pagination = {
      page: 0,
      size: 10,
    }
  ): Promise<ListResponseContent<Category> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/admin/categories?page=${request.page}&size=${request.size}`
      );
    } catch (error: any) {
      handleError(error);
    }
  },
  async getCategoriesByName(
    categoryName: string,
    request: Pagination = {
      page: 0,
      size: 10,
    }
  ): Promise<ListResponseContent<Category> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/admin/categories?categoryName=${categoryName}&page=${request.page}&size=${request.size}`
      );
    } catch (error: any) {
      handleError(error);
    }
  },
  async getParentCategory(
    categoryId: number
  ): Promise<ListResponseCategories<Category> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/admin/categories/${categoryId}/available-parents`
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },

  async getCategoryById(
    categoryId: number
  ): Promise<SingleResponse<Category> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/admin/categories/${categoryId}`
      );
    } catch (error: any) {
      handleError(error);
    }
  },

  async createNewCategory(
    request: {
      name?: string;
      parentId?: string;
      imageFile?: File | string;
    } & KeyString
  ): Promise<SingleResponse<Category> | undefined> {
    try {
      const formData = new FormData();
      for (const key in request) {
        if (Object.prototype.hasOwnProperty.call(request, key)) {
          formData.append(key, request[key]);
        }
      }
      return await axiosClientWithAuth.post(
        "/users/admin/categories",
        formData
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async updateCategory(
    categoryId: number,
    request: {
      name?: string;
      parentId?: string;
      imageFile?: File | string;
    } & KeyString
  ): Promise<SingleResponse<Category> | undefined> {
    try {
      const formData = new FormData();
      for (const key in request) {
        if (Object.prototype.hasOwnProperty.call(request, key)) {
          formData.append(key, request[key]);
        }
      }
      return await axiosClientWithAuth.patch(
        `/users/admin/categories/${categoryId}`,
        formData
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },

  async changeCategoryActivation(
    categoryId: number
  ): Promise<SingleResponse<CategoryResponse> | undefined> {
    try {
      return await axiosClientWithAuth.patch(
        `/users/admin/categories/${categoryId}/toggle-category-status`
      );
    } catch (e: any) {
      handleError(e);
      return e.response.data;
    }
  },
};

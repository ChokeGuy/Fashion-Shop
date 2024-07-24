import {
  ChangePasswordRequest,
  KeyString,
  ListResponse,
  ListResponseVoucher,
  Product,
  Promotion,
  SingleResponse,
  UserProfileRequest,
  UserResponse,
  UserTagResponse,
} from "@/src/models";
import { handleError } from "@/src/utilities/handleError";
import axiosClientWithAuth from "./axiosClientWithAuth";
import { BadRequest } from "../errors/error-400";

export const userApi = {
  async getUserInfo(): Promise<SingleResponse<UserResponse> | undefined> {
    try {
      return await axiosClientWithAuth.get(`/users/profile`);
    } catch (e: any) {
      handleError(e);
    }
  },

  async getUserRole(): Promise<SingleResponse<UserResponse> | undefined> {
    try {
      return await axiosClientWithAuth.get(`/users/profile`);
    } catch (e: any) {
      handleError(e);
    }
  },

  async logout(request: {
    refreshToken: string;
  }): Promise<SingleResponse<string> | undefined> {
    try {
      return await axiosClientWithAuth.post(
        `/auth/logout?refreshToken=${request.refreshToken}`
      );
    } catch (e: any) {
      handleError(e);
    }
  },
  async updateUserProfile(
    request: UserProfileRequest & KeyString
  ): Promise<SingleResponse<UserResponse> | undefined> {
    try {
      const formData = new FormData();
      for (const key in request) {
        if (Object.prototype.hasOwnProperty.call(request, key)) {
          formData.append(key, request[key]);
        }
      }
      return await axiosClientWithAuth.put(`/users/profile`, formData);
    } catch (e: any) {
      handleError(e);
      return e.response.data;
    }
  },

  async changeUserPassword(
    request: ChangePasswordRequest
  ): Promise<SingleResponse<string> | undefined | BadRequest> {
    try {
      return await axiosClientWithAuth.patch(`/users/change-password`, request);
    } catch (e: any) {
      handleError(e);
      return e.response.data;
    }
  },

  async getAvailableVouchers(
    amount: number
  ): Promise<ListResponseVoucher<Promotion> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/customers/vouchers/available?amount=${amount}`
      );
    } catch (e: any) {
      handleError(e);
      return e.response.data;
    }
  },
  async getFavoriteProducts(): Promise<ListResponse<Product> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/customers/favorite-products`
      );
    } catch (e: any) {
      handleError(e);
      return e.response.data;
    }
  },
  async saveCustomerBehavior(
    productId: number
  ): Promise<ListResponse<UserTagResponse> | undefined> {
    try {
      return await axiosClientWithAuth.post(
        `/users/customers/products/${productId}/tags`
      );
    } catch (e: any) {
      handleError(e);
      return e.response.data;
    }
  },
};

import {
  AdminUserRequest,
  KeyString,
  ListResponseContent,
  ListResponseUser,
  Pagination,
  RegisterRequest,
  SingleResponse,
  UserResponse,
} from "@/src/models";
import axiosClientWithAuth from "../axiosClientWithAuth";
import { handleError } from "@/src/utilities/handleError";
import { UUID } from "crypto";

export const adminUserApi = {
  async getAllUserAccounts(
    request: Pagination = { page: 0, size: 5 },
    searchData: string = ""
  ): Promise<ListResponseContent<UserResponse> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/admin/user-management/users?roleName=CUSTOMER&searchData=${searchData}&page=${request.page}&size=${request.size}`
      );
    } catch (e: any) {
      handleError(e);
      return e.response.data;
    }
  },
  async getAllShipperAccounts(
    request: Pagination = { page: 0, size: 5 },
    userName: string = ""
  ): Promise<ListResponseContent<UserResponse> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/admin/user-management/users?roleName=SHIPPER&searchData=${userName}&page=${request.page}&size=${request.size}`
      );
    } catch (e: any) {
      handleError(e);
      return e.response.data;
    }
  },
  async getShipperAccountsByAddress(
    address: string = ""
  ): Promise<ListResponseUser<UserResponse> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/admin/user-management/users/address?address=${address}`
      );
    } catch (e: any) {
      handleError(e);
      return e.response.data;
    }
  },
  async createShipperAccount(
    request: Omit<RegisterRequest, "otp"> & { defaultAddress: string }
  ): Promise<SingleResponse<UserResponse> | undefined> {
    try {
      return await axiosClientWithAuth.post(
        `/users/admin/user-management/shippers`,
        request
      );
    } catch (e: any) {
      handleError(e);
      return e.response.data;
    }
  },
  async changeUserActivation(
    userId: UUID
  ): Promise<SingleResponse<UserResponse> | undefined> {
    try {
      return await axiosClientWithAuth.patch(
        `/users/admin/user-management/users/${userId}/toggle-user-status`
      );
    } catch (e: any) {
      handleError(e);
      return e.response.data;
    }
  },
  async updateUserInfo(
    userId: UUID,
    request: AdminUserRequest & KeyString
  ): Promise<SingleResponse<UserResponse> | undefined> {
    try {
      const formData = new FormData();
      for (const key in request) {
        if (Object.prototype.hasOwnProperty.call(request, key)) {
          formData.append(key, request[key]);
        }
      }
      return await axiosClientWithAuth.patch(
        `/users/admin/user-management/users/${userId}`,
        formData
      );
    } catch (e: any) {
      handleError(e);
      return e.response.data;
    }
  },
};

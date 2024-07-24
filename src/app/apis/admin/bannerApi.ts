import {
  BannerResponse,
  ListResponseContent,
  Pagination,
  SingleResponse,
} from "@/src/models";
import { handleError } from "@/src/utilities/handleError";
import axiosClientWithAuth from "../axiosClientWithAuth";

export const adminBannerApi = {
  async getAllBanners(
    request: Pagination = {
      page: 0,
      size: 10,
    }
  ): Promise<ListResponseContent<BannerResponse> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/admin/banners?page=${request.page}&size=${request.size}`
      );
    } catch (error: any) {
      handleError(error);
    }
  },
  async getBannerById(
    bannerId: number
  ): Promise<SingleResponse<BannerResponse> | undefined> {
    try {
      return await axiosClientWithAuth.get(`/users/admin/banners/${bannerId}`);
    } catch (error: any) {
      handleError(error);
    }
  },
  async createBanner(request: {
    image: File | string;
  }): Promise<ListResponseContent<BannerResponse> | undefined> {
    const formData = new FormData();
    formData.append("image", request.image);
    try {
      return await axiosClientWithAuth.post("/users/admin/banners", formData);
    } catch (error: any) {
      handleError(error);
    }
  },
  async changeBannerActivation(
    bannerId: number
  ): Promise<SingleResponse<BannerResponse> | undefined> {
    try {
      return await axiosClientWithAuth.patch(
        `/users/admin/banners/${bannerId}/toggle-banner-status`
      );
    } catch (e: any) {
      handleError(e);
      return e.response.data;
    }
  },
};

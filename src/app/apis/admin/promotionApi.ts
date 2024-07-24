import {
  AddPromotionRequest,
  Promotion,
  PromotionResponse,
  ListResponsePromotion,
  Pagination,
  ProductResponse,
  SingleResponse,
  UpdatePromotionRequest,
} from "@/src/models";
import { handleError } from "@/src/utilities/handleError";
import axiosClientWithAuth from "../axiosClientWithAuth";

export const adminPromotionApi = {
  async getAllPromotions(
    promotionName: string = "",
    request: Pagination = { page: 0, size: 5 }
  ): Promise<ListResponsePromotion<Promotion> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/admin/promotions?page=${request.page}&size=${request.size}&promotionName=${promotionName}`
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },

  async getPromotionsById(
    promotionId: string
  ): Promise<SingleResponse<Promotion> | undefined> {
    try {
      return await axiosClientWithAuth.get(
        `/users/admin/promotions/${promotionId}`
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async createNewPromotion(
    request: AddPromotionRequest
  ): Promise<ListResponsePromotion<Promotion> | undefined> {
    try {
      return await axiosClientWithAuth.post("/users/admin/promotions", request);
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async updatePromotion(
    request: UpdatePromotionRequest,
    promotionId: number
  ): Promise<ListResponsePromotion<Promotion> | undefined> {
    try {
      return await axiosClientWithAuth.patch(
        `/users/admin/promotions/${promotionId}`,
        request
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async applyPromotion(
    promotionId: number,
    action: "grant" | "revoke"
  ): Promise<ListResponsePromotion<Promotion> | undefined> {
    try {
      return await axiosClientWithAuth.patch(
        `/users/admin/promotions/${promotionId}/${action}`
      );
    } catch (error: any) {
      handleError(error);
      return error.response.data;
    }
  },
  async changePromotionActivation(
    promotionId: number
  ): Promise<SingleResponse<PromotionResponse> | undefined> {
    try {
      return await axiosClientWithAuth.patch(
        `/users/admin/promotions/${promotionId}/toggle-promotion-status`
      );
    } catch (e: any) {
      handleError(e);
      return e.response.data;
    }
  },
};

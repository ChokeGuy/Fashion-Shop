import { PromotionType } from "../constants/promotion-type";
import { Product } from "./product";

type Promotion = {
  promotionId: number;
  promotionName: string;
  promotionType: PromotionType;
  startAt?: Date;
  expireAt?: Date;
  isActive: boolean;
  isAvailable: boolean;
  discountByPercentage: number;
  discountByAmount: number;
  minOrderAmount: number;
  maxPromotionAmount: number;
  bannerId: number;
  categoryIds: number[];
  categoryNames: string[];
  // promotion_user: string;
};

type AddPromotion = {
  promotionName?: string;
  promotionType?: PromotionType | "";
  startAt?: Date | string;
  expireAt?: Date | string;
  discountByPercentage?: number | "";
  discountByAmount?: number | "";
  minOrderAmount?: number | "";
  maxPromotionAmount?: number | "";
  categoryIds?: number[] | "" | null;
  bannerId?: number | "";
};

type AddPromotionRequest = AddPromotion;

type UpdatePromotion = AddPromotion;
type UpdatePromotionRequest = AddPromotion;

type PromotionRequest = Omit<Promotion, "promotionId" | "product">;
type PromotionResponse = Promotion;
export type {
  PromotionRequest,
  PromotionResponse,
  Promotion,
  UpdatePromotion,
  AddPromotion,
  AddPromotionRequest,
  UpdatePromotionRequest,
};

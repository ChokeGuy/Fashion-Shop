export type PromotionType = "CATEGORIES" | "VOUCHER_PERCENT" | "VOUCHER_AMOUNT";

export function getPromotionTypeIndex(promotionType: PromotionType): string {
  switch (promotionType) {
    case "CATEGORIES":
      return " Danh mục";
    case "VOUCHER_PERCENT":
      return " Phần trăm giảm giá";
    case "VOUCHER_AMOUNT":
      return " Số tiền giảm giá";
    default:
      return " Danh mục";
  }
}

import { CartItem, OrderItem } from "../models";

function formatPrice(price: number): string {
  const formattedPrice = price.toLocaleString("vi-VN");
  return formattedPrice;
}
function totalPrice(cartItems: any, shippingCost: number = 0): string {
  const total = cartItems.reduce((acc: any, item: any) => acc + item.amount, 0);
  const formattedTotal = formatPrice(total + shippingCost);
  return formattedTotal;
}

function getPriceSalePercent(originalPrice: number, salePrice: number): number {
  const percent = ((originalPrice - salePrice) / originalPrice) * 100;
  return Math.round(percent);
}
export { formatPrice, totalPrice, getPriceSalePercent };

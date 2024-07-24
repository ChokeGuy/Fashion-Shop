import { UUID } from "crypto";
import { OrderStatus } from "../constants/orderStatus";
import { PayMentMethod } from "../constants/paymentMethod";

type OrderItem = {
  orderItemId: number;
  productId: number;
  productItemId: string;
  productName: string;
  image: string;
  styleValues: string[];
  quantity: number;
  unitPrice: number;
  amount: number;
  inventory: number;
};

type Order = {
  orderId: number;
  fullName: string;
  phone: string;
  address: string;
  paymentMethod: PayMentMethod;
  voucherDiscountAmount: number;
  voucherId: number | null;
  shippingCost: number;
  totalAmount: number;
  checkout: boolean;
  status: OrderStatus;
  createdAt?: Date;
  updateAt?: Date;
  customerId?: UUID;
  isRated: boolean;
};
type OrderRequest = {
  cartItemIds: number[];
  fullName: string;
  phone: string;
  address: string;
  shippingCost: number;
  voucherId: number | null;
  paymentMethod: PayMentMethod;
};

type InstantBuyRequest = {
  productItemId: number | string;
  quantity: number;
  promotionalPrice: number;
  fullName: string;
  phone: string;
  address: string;
  shippingCost: number;
  voucherId: number | null;
  paymentMethod: PayMentMethod;
};

type OrderResponse = Order;

type OrderItemRequest = OrderItem;
type OrderItemResponse = OrderItem;

type OrderDetailResponse = {
  totalOrderItems: number;
  customerId: UUID;
  orderItems: OrderItem[];
  order: Order;
};

type ChangeOrderStatusToShipping = {
  orderId: number | "";
  shipperEmail: string;
};
type ChangeOrderStatusToShippingRequest = ChangeOrderStatusToShipping;

export type {
  Order,
  OrderItem,
  OrderRequest,
  OrderResponse,
  OrderItemRequest,
  OrderItemResponse,
  OrderDetailResponse,
  ChangeOrderStatusToShipping,
  ChangeOrderStatusToShippingRequest,
  InstantBuyRequest,
};

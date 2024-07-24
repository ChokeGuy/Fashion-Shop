type Delivery = {
  deliveryId: number;
  note: string | null;
  isReceived: boolean;
  isDelivered: boolean;
  address: string;
  recipientName: string;
  checkoutStatus: boolean;
  shipperId: string;
  shipperName: string;
  shipperEmail: string;
  phone: string;
  shippingCost: number;
  totalAmount: number;
  orderId: number;
};
type DeliveryResponse = Delivery;

export type { Delivery, DeliveryResponse };

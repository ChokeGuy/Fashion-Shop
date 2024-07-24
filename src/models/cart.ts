type Cart = {
  cartId: number;
  cartItems: CartItem[];
  cartItemsQuantity: number;
};

type CartItem = {
  image: string;
  quantity: number;
  productId: number;
  cartItemId: number;
  productItemId: number;
  productName: string;
  styleValues: string[];
  price: number;
  promotionalPrice: number;
  amount: number;
  inventory: number;
  productItem_IsActive: boolean;
};

type AddToCartRequest = Pick<CartItem, "productItemId" | "quantity">;
type UpdateCartRequest = Pick<CartItem, "cartItemId" | "quantity">;
type CartResponse = Cart;
type CartItemRequest = CartItem;
type CartItemResponse = CartItem;

export type {
  Cart,
  CartResponse,
  CartItem,
  CartItemRequest,
  CartItemResponse,
  AddToCartRequest,
  UpdateCartRequest,
};

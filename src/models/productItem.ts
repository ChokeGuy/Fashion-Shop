type ProductItem = {
  productItemId: number;
  parentId: number;
  parentName: string;
  quantity: number;
  sold: number;
  image: string;
  price: number;
  promotionalPrice: number;
  styleValueByStyles: {
    Size: string;
    Color: string;
  };
  sku: string;
  isActive: boolean;
};

type AddProductItem = {
  productId?: number;
  quantity?: number | "";
  image?: string | File;
  price?: number | "";
  styleValueIds?: number[];
};

type AddProductItemRequest = AddProductItem;

type UpdateProductItem = Omit<AddProductItem, "productId" | "styleValueIds">;
type UpdateProductItemRequest = UpdateProductItem;

type ProductItemRequest = Omit<ProductItem, "productItemId">;
type ProductItemResponse = ProductItem;

export type {
  ProductItem,
  ProductItemRequest,
  ProductItemResponse,
  AddProductItem,
  AddProductItemRequest,
  UpdateProductItem,
  UpdateProductItemRequest,
};

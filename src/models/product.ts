import { SortType } from "../constants/sort-by";
import { PaginationParams } from "./common";

type Product = {
  productId: number;
  name: string;
  description?: string;
  image: string;
  categoryId: number;
  categoryName: string;
  brandId: number;
  brandName: string;
  totalQuantity: number;
  totalSold: number;
  totalRatings: number;
  priceMin: number;
  promotionalPriceMin: number;
  rating: number;
  styleValueNamesByStyleNames: { [index: string]: string[] };
  isActive: boolean;
};
type ProductRequest = {
  productName?: string;
  brandName?: string;
  categoryName?: string;
  priceFrom?: number;
  priceTo?: number;
  colors?: string;
  sizes?: string;
  sortBy?: SortType;
} & PaginationParams;

type AddProduct = {
  name?: string;
  description?: string;
  image?: string | File;
  categoryId?: number | string;
  brandId?: number | string;
  styleIds?: number[];
};

type TopProduct = {
  productId: number;
  productName: string;
  totalSold: number;
};

type TopProductRequest = TopProduct;

type UpdateProduct = Omit<AddProduct, "categoryId" | "styleIds">;
type AddProductRequest = AddProduct;
type UpdateProductRequest = UpdateProduct;

type ProductResponse = Product;

export type {
  Product,
  ProductRequest,
  ProductResponse,
  AddProduct,
  AddProductRequest,
  UpdateProduct,
  UpdateProductRequest,
  TopProduct,
  TopProductRequest,
};

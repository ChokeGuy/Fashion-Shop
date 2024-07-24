import { Nation } from "../constants/nation";

type Brand = {
  brandId: number;
  name: string;
  nation: Nation;
  isActive: boolean;
};

type AddBrand = {
  name?: string;
  nation?: Nation | "";
};

type AddBrandRequest = AddBrand;
type UpdateBrandRequest = AddBrand;
type BrandResponse = Brand;
type BrandRequest = Pick<Brand, "name" | "nation">;

export type {
  Brand,
  BrandRequest,
  BrandResponse,
  AddBrand,
  AddBrandRequest,
  UpdateBrandRequest,
};

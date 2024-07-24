import React from "react";
import MainProducts from "../../components/product/main";
import { productApi } from "../../apis/productApi";
import { categoryApi } from "../../apis/categoryApi";
import { styleValuesApi } from "../../apis/styleValuesApi";
import { ListResponseContent, Category, StyleValue } from "@/src/models";
import { sortBy } from "lodash";
import { SortType } from "@/src/constants/sort-by";

// export const revalidate = 600;
export const metadata = {
  title: "Sản phẩm",
};

const defaultSearchParams = {
  keyword: "",
  page: "1",
  sizePerPage: "9",
  categoryName: "",
  priceFrom: 0,
  priceTo: 5000000,
  colors: "",
  sizes: "",
  sortBy: "NEWEST",
};

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    keyword?: string;
    page?: string;
    sizePerPage?: string;
    categoryName?: string;
    priceFrom?: number;
    priceTo?: number;
    colors?: string;
    sizes?: string;
    sortBy?: SortType;
  };
}) {
  //Get search params from URL like keyword, page, sizePerPage
  let keyword = searchParams?.keyword || "";
  let currentPage = Number(searchParams?.page) - 1 || 0;
  let sizePerPage = Number(searchParams?.sizePerPage) || 9;

  let categoryName = searchParams?.categoryName || "";
  let priceFrom = searchParams?.priceFrom || 0;
  let priceTo = searchParams?.priceTo || 5000000;
  let searchColors = searchParams?.colors || "";
  let searchSizes = searchParams?.sizes || "";
  let sortBy = searchParams?.sortBy;
  if (
    !["NEWEST", "POPULAR", "PRICE_ASC", "PRICE_DESC"].includes(sortBy || "")
  ) {
    sortBy = "NEWEST";
  }
  let categories: ListResponseContent<Category> | undefined,
    styleValues: ListResponseContent<StyleValue> | undefined;

  if (JSON.stringify(searchParams) !== JSON.stringify(defaultSearchParams)) {
    categories = await categoryApi.getAllCategories();
    styleValues = await styleValuesApi.getStyleValues();
  }

  //Get products, categories, colors, sizes from APIs
  const products = await productApi.getAllProducts({
    page: currentPage,
    sizePerPage: sizePerPage,
    productName: keyword,
    brandName: "",
    categoryName: categoryName,
    priceFrom: priceFrom,
    priceTo: priceTo,
    colors: searchColors,
    sizes: searchSizes,
    sortBy: sortBy,
  });

  const colors = styleValues?.result.content.filter(
    (style) => style.styleName == "Color"
  );
  const sizes = styleValues?.result.content.filter(
    (style) => style.styleName == "Size"
  );

  const { content: productContents, totalElements: productTotalElements } =
    products?.result ?? {
      content: [],
      totalElements: undefined,
    };
  const { content: categoryContents } = categories?.result ?? { content: [] };

  return (
    <MainProducts
      products={productContents}
      totalElements={productTotalElements ?? 0}
      categories={categoryContents ?? []}
      sizes={sizes || []}
      colors={colors || []}
    />
  );
}

import { categoryApi } from "@/src/app/apis/categoryApi";
import { productApi } from "@/src/app/apis/productApi";
import ProductsByCategory from "@/src/app/components/category/main";
import { SortType } from "@/src/constants/sort-by";
import { notFound } from "next/navigation";

// export const revalidate = 10;
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Sản phẩm theo danh mục",
};

export async function generateStaticParams() {
  //Getting all categories from the first loading
  const result = await categoryApi.getAllCategories();
  const categories = result?.result.content || [];
  return categories.map((category) => ({
    categoryId: `${category.categoryId}`,
  }));
}
export default async function Page({
  params,
  searchParams,
}: {
  params: { categoryName: string };
  searchParams: {
    keyword?: string;
    page?: string;
    sizePerPage?: string;
    sortBy?: SortType;
  };
}) {
  const { categoryName } = params;
  let keyword = searchParams?.keyword || "";
  let currentPage = Number(searchParams?.page) - 1 || 0;
  let sizePerPage = Number(searchParams?.sizePerPage) || 9;
  let sortBy = searchParams?.sortBy;
  if (
    !["NEWEST", "POPULAR", "PRICE_ASC", "PRICE_DESC"].includes(sortBy || "")
  ) {
    sortBy = "NEWEST";
  }

  const result = await productApi.getAllProducts({
    page: currentPage,
    sizePerPage: sizePerPage,
    productName: keyword,
    brandName: "",
    categoryName: categoryName,
    priceFrom: 0,
    priceTo: 5000000,
    colors: "",
    sizes: "",
    sortBy: sortBy,
  });

  if (!result?.success) {
    notFound();
  }

  const productsByCategory = result?.result.content || [];
  const totalElements = result?.result.totalElements || 0;

  return (
    <ProductsByCategory
      products={productsByCategory}
      totalElements={totalElements}
    />
  );
}

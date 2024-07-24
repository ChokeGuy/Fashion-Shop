import { productApi } from "@/src/app/apis/productApi";
import ProductDetail from "@/src/app/components/product/detail";
import { Product, ProductItem } from "@/src/models";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Chi tiết sản phẩm",
};
// export const revalidate = 10;
export const dynamic = "force-dynamic";

// Return a list of `params` to populate the [productId] dynamic segment
export async function generateStaticParams() {
  //Getting 30 products from the first loading
  const result = await productApi.getAllProducts({
    page: 0,
    sizePerPage: 1000,
    productName: "",
    brandName: "",
    categoryName: "",
    priceFrom: 0,
    priceTo: 5000000,
    colors: "",
    sizes: "",
    sortBy: "NEWEST",
  });
  const products = result?.result.content || [];
  return products
    .filter((product) => product.priceMin !== null)
    .map((product) => ({
      productId: `${product.productId}`,
    }));
}

async function Page({
  params,
  searchParams,
}: {
  params: { productId: string };
  searchParams: { size: number };
}) {
  const { productId } = params;
  const size = searchParams.size;
  // Fetch product detail and items in parallel
  const [
    productDetailResult,
    productItemsResult,
    relateProductsResult,
    countFollowProductsResult,
    ratingsResult,
  ] = await Promise.all([
    productApi.getProductById(productId),
    productApi.getProductItemsById(productId),
    productApi.getRelatedProducts(productId),
    productApi.countFollowProducts(productId),
    productApi.getAllRatings(productId, size),
  ]);

  if (
    !productDetailResult?.success ||
    !productItemsResult?.success ||
    !relateProductsResult?.success ||
    !countFollowProductsResult?.success ||
    !ratingsResult?.success
  ) {
    notFound();
  }

  const productDetail = productDetailResult?.result || ({} as Product);
  const productItems =
    productItemsResult?.result.content || ([] as ProductItem[]);
  const relatedProducts = relateProductsResult?.result || ([] as Product[]);
  const followProducts = countFollowProductsResult?.result || 0;
  const ratings = ratingsResult?.result.ratingResponseList || [];
  const totalRatings = ratingsResult?.result.totalRatings || 0;

  return (
    <ProductDetail
      productDetail={productDetail}
      productItems={productItems}
      relatedProducts={relatedProducts}
      follows={followProducts}
      comments={ratings}
      totalRatings={totalRatings}
    />
  );
}
export default Page;

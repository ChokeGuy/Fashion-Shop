import dynamic from "next/dynamic";
import { bannerApi } from "../apis/bannerApi";
import { categoryApi } from "../apis/categoryApi";
import { productApi } from "../apis/productApi";
import Accessories from "../components/homepage/Accessories";
import Banner from "../components/homepage/Banner";
import Collection from "../components/homepage/Collection";
// import FeaturedProduct from "../components/homepage/FeaturedProduct";
import Introduction from "../components/homepage/Introduction";
// import RecommendProduct from "../components/homepage/RecommendProduct";
import Service from "../components/homepage/Service";
import CircleLoading from "../components/Loading";

const Category = dynamic(() => import("../components/homepage/Category"), {
  ssr: false,
  loading: () => (
    <section className="lg:container mt-0 md:mt-8 transition-all p-8 grid place-content-center">
      <CircleLoading />
    </section>
  ),
});

const FeaturedProduct = dynamic(
  () => import("../components/homepage/FeaturedProduct"),
  {
    ssr: false,
    loading: () => (
      <section className="lg:container mt-0 md:mt-8 transition-all p-8 grid place-content-center">
        <CircleLoading />
      </section>
    ),
  }
);

const RecommendProduct = dynamic(
  () => import("../components/homepage/RecommendProduct"),
  {
    ssr: false,
    loading: () => (
      <section className="lg:container mt-0 md:mt-8 transition-all p-8 grid place-content-center">
        <CircleLoading />
      </section>
    ),
  }
);

export default async function HomePage() {
  const [bannersRes, categoryRes] = await Promise.all([
    bannerApi.getAllBanners(),
    categoryApi.getAllCategories(),
  ]);

  const banners = bannersRes?.result.content || [];
  const categories = categoryRes?.result.content || [];

  // Get 4 accessories products from 2 arrays of acessories1 and accessories2
  const allBanners = banners;
  return (
    <>
      {/* Banner Section */}
      <Banner banners={allBanners} />
      <Category categories={categories} />
      {/* Featured Products Section */}
      <FeaturedProduct />
      {/* Accessories Section */}
      <Accessories />
      {/* Collection Section */}
      <Collection />
      {/* Recommend Product Section */}
      <RecommendProduct />
      {/* Introduction Section */}
      <Introduction />
      {/* Service Section */}
      <Service />
    </>
  );
}

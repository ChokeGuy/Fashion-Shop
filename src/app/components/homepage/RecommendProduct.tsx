"use client";
import React, { useEffect, useState } from "react";
import Carousel from "react-multi-carousel";
import { responsive } from "@/src/utilities/carouselResponsive";
import Image from "next/image";
import { formatPrice } from "@/src/utilities/price-format";
import { Product } from "@/src/models";
import Link from "next/link";
import Rating from "@mui/material/Rating";
import { productApi } from "../../apis/productApi";
import CircleLoading from "../Loading";
import { getCookie } from "cookies-next";
import customerBehavior from "@/src/utilities/customer-behavior";
import { useRouter } from "next/navigation";

export default function RecommendProduct() {
  const { replace } = useRouter();
  const [products, setProduct] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getAllProducts = async () => {
      setLoading(true);
      const accessToken = getCookie("accessToken");
      const refreshToken = getCookie("refreshToken");
      if (accessToken && refreshToken) {
        const result = await productApi.getRecommentProducts();
        setProduct(result?.result.content || []);
      } else {
        const result = await productApi.getDefaultRecommentProducts();
        setProduct(result?.result.content || []);
      }

      setLoading(false);
    };
    getAllProducts();
  }, []);

  if (loading) {
    return (
      <section className="lg:container">
        {/* title */}
        <div className="flex justify-between items-start max-lg:flex-col gap-x-32 gap-y-1 p-4">
          <h2 className="text-lg md:text-3xl font-medium lg:flex-[0_0_35%] lg:max-w-[35%] transition-all">
            Có thể bạn sẽ thích
          </h2>
          <p className="text-sm md:text-lg text-left transition-all text-text-color">
            Sản phẩm thời trang mà chúng tôi đề xuất là một bộ sưu tập hoàn toàn
            mới, đem đến sự phong cách và phá cách cho người tiêu dùng. Với sự
            kết hợp của chất liệu cao cấp, kiểu dáng đa dạng và sự chăm sóc tỉ
            mỉ trong từng chi tiết, bộ sưu tập này sẽ khiến người sử dụng nổi
            bật và tự tin hơn.
          </p>
        </div>
        <div className="w-full grid place-content-center pb-4 md:pb-12 pt-6">
          <CircleLoading />
        </div>
      </section>
    );
  }

  return (
    <section className="lg:container mt-0 md:mt-16 transition-all">
      {/* title */}
      <div className="flex justify-between items-start max-lg:flex-col gap-x-32 gap-y-1 p-4">
        <h2 className="text-lg md:text-3xl font-medium lg:flex-[0_0_35%] lg:max-w-[35%] transition-all">
          Có thể bạn sẽ thích
        </h2>
        <p className="text-sm md:text-lg text-left transition-all text-text-color">
          Sản phẩm thời trang mà chúng tôi đề xuất là một bộ sưu tập hoàn toàn
          mới, đem đến sự phong cách và phá cách cho người tiêu dùng. Với sự kết
          hợp của chất liệu cao cấp, kiểu dáng đa dạng và sự chăm sóc tỉ mỉ
          trong từng chi tiết, bộ sưu tập này sẽ khiến người sử dụng nổi bật và
          tự tin hơn.
        </p>
      </div>
      <div className="pb-4 md:pb-12">
        <Carousel
          swipeable={true}
          draggable={false}
          // ssr={true}
          responsive={responsive}
          infinite={true}
          autoPlaySpeed={3000}
          keyBoardControl={true}
          transitionDuration={500}
          removeArrowOnDeviceType={["mobile"]}
          arrows={true}
          deviceType={"desktop"}
          containerClass="carousel-container"
          itemClass="carousel-item"
        >
          {products &&
            products.map((p) => (
              <Link
                onClick={async () => {
                  await customerBehavior(p.productId);
                }}
                href={`/product/${p.productId}`}
                className="relative hover:cursor-pointer group animate-fadeIn"
                key={p.productId}
              >
                <div className="group-hover:shadow-md transition-all">
                  <div className="relative border border-border-color">
                    <Image
                      width={300}
                      height={300}
                      className="size-full"
                      src={p.image}
                      alt="product"
                    />
                  </div>
                  <div className="bg-white bg-opacity-80 py-3 px-2 space-y-2">
                    <div className="flex gap-x-2 items-center">
                      <Rating
                        name="read-only"
                        precision={0.2}
                        size="small"
                        value={p && p.rating ? Number(p.rating.toFixed(1)) : 0}
                        readOnly
                      />
                      <span className="text-sm font-medium">
                        {p.totalRatings} đánh giá
                      </span>
                    </div>
                    <h3 className="text-sm md:text-base font-normal truncate">
                      {p.name}
                    </h3>
                    <div className="flex items-center gap-x-2">
                      {p.priceMin !== p.promotionalPriceMin && (
                        <p className="text-base font-light line-through text-text-light-color">
                          {formatPrice(p.priceMin)}
                        </p>
                      )}
                      <p className={`text-base font-medium`}>
                        {formatPrice(p.promotionalPriceMin) + " VNĐ"}
                      </p>
                    </div>
                  </div>
                </div>
                {p.priceMin !== p.promotionalPriceMin && (
                  <label
                    className="absolute top-2 left-2 text-white text-ssm 
              font-bold text-center bg-red-500 px-2 py-0.5 rounded-sm"
                  >
                    {(
                      -((p.priceMin - p.promotionalPriceMin) / p.priceMin) *
                      100
                    ).toFixed(0)}
                    %
                  </label>
                )}
              </Link>
            ))}
        </Carousel>
      </div>
      <div className="mx-4 border-b border-border-color"></div>
    </section>
  );
}

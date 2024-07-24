"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Carousel from "react-multi-carousel";
import { responsive } from "@/src/utilities/carouselResponsive";
import { formatPrice } from "@/src/utilities/price-format";
import { Product } from "@/src/models";
import Link from "next/link";
import Rating from "@mui/material/Rating";
import { productApi } from "../../apis/productApi";
import CircleLoading from "../Loading";
import customerBehavior from "@/src/utilities/customer-behavior";
import { useRouter } from "next/navigation";

const FeaturedProduct = () => {
  const { replace } = useRouter();
  const [products, setProduct] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getAllProducts = async () => {
      setLoading(true);

      const result = await productApi.getAllProducts({
        page: 0,
        sizePerPage: 8,
        productName: "",
        brandName: "",
        categoryName: "",
        priceFrom: 0,
        priceTo: 5000000,
        colors: "",
        sizes: "",
        sortBy: "POPULAR",
      });
      setProduct(result?.result.content || []);
      setLoading(false);
    };
    getAllProducts();
  }, []);

  if (loading) {
    return (
      <section className="lg:container">
        <div className="flex justify-between items-start max-lg:flex-col gap-x-32 gap-y-1 p-4">
          <h2 className="text-lg md:text-3xl font-medium lg:flex-[0_0_35%] lg:max-w-[35%] transition-all">
            Sản phẩm phổ biến
          </h2>
          <p className="text-sm md:text-lg text-left transition-all text-text-color">
            Bằng sự kết hợp tinh tế giữa chất liệu cao cấp và kiểu dáng độc đáo,
            mỗi mẫu thiết kế đều tạo sự thoải mái. Hãy khám phá bộ sưu tập sản
            phẩm thời trang nổi bật của chúng tôi để tìm ra những điểm nhấn đặc
            biệt cho phong cách thời trang cá nhân của bạn.
          </p>
        </div>
        <div className="w-full grid place-content-center pb-4 md:pb-12 pt-6">
          <CircleLoading />
        </div>
      </section>
    );
  }

  // Implement the FeaturedProduct component logic here
  return (
    <section className="lg:container mt-0 md:mt-8 transition-all">
      {/* title */}
      <div className="flex justify-between items-start max-lg:flex-col gap-x-32 gap-y-1 p-4">
        <h2 className="text-lg md:text-3xl font-medium lg:flex-[0_0_35%] lg:max-w-[35%] transition-all">
          Sản phẩm phổ biến
        </h2>
        <p className="text-sm md:text-lg text-left transition-all text-text-color">
          Bằng sự kết hợp tinh tế giữa chất liệu cao cấp và kiểu dáng độc đáo,
          mỗi mẫu thiết kế đều tạo sự thoải mái. Hãy khám phá bộ sưu tập sản
          phẩm thời trang nổi bật của chúng tôi để tìm ra những điểm nhấn đặc
          biệt cho phong cách thời trang cá nhân của bạn.
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
          containerClass="carousel-container-2"
          itemClass="carousel-item2"
        >
          {products &&
            products.slice(0, 4).map((p) => (
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
                    {/* <div
                      className="absolute bottom-2 mx-3 left-0 right-0 group-hover:animate-appearFromBottom bg-background
                     p-2 opacity-0 rounded-lg text-center hover:bg-secondary-color hover:text-white transition-all"
                    >
                      Thêm vào giỏ hàng
                    </div> */}
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
    </section>
  );
};

export default FeaturedProduct;

import { responsive } from "@/src/utilities/carouselResponsive";
import React from "react";
import Carousel from "react-multi-carousel";
import Image from "next/image";
import { Product } from "@/src/models";
import Link from "next/link";
import StarIcon from "@mui/icons-material/Star";
import { formatPrice } from "@/src/utilities/price-format";
import Rating from "@mui/material/Rating";
import customerBehavior from "@/src/utilities/customer-behavior";
type RelatedProductProps = {
  products: Product[];
  // Define the props for the component here
};

const RelatedProduct = ({ products }: RelatedProductProps) => {
  if (products.length === 0) {
    return (
      <section className="w-full mt-8">
        <h1 className="font-bold text-lg pb-4 text-left">Sản phẩm liên quan</h1>
        <div className="my-8 flex items-center justify-center text-lg font-semibold text-primary-color">
          Không có sản phẩm liên quan nào
        </div>
      </section>
    );
  }

  return (
    // JSX code for the component's UI goes here
    <section className="w-full mt-8">
      <h1 className="font-bold text-lg border-b border-border-color pb-4 text-left">
        Sản phẩm liên quan
      </h1>
      <div className="mt-2">
        <Carousel
          swipeable={true}
          draggable={false}
          ssr={true}
          responsive={responsive}
          infinite={true}
          autoPlaySpeed={3000}
          keyBoardControl={true}
          transitionDuration={500}
          removeArrowOnDeviceType={["mobile"]}
          arrows={true}
          deviceType={"desktop"}
          containerClass="carousel-container"
          itemClass="carousel-item3"
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
                  </div>
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
                        {p.priceMin && formatPrice(p.priceMin)}
                      </p>
                    )}
                    <p className={`text-base font-medium`}>
                      {p.promotionalPriceMin &&
                        formatPrice(p.promotionalPriceMin) + " VNĐ"}
                    </p>
                  </div>
                </div>
                {p.priceMin !== p.promotionalPriceMin && (
                  <label
                    className="absolute top-2 left-2 text-white text-ssm 
              font-bold text-center bg-red-500 px-2 py-0.5 rounded-sm"
                  >
                    {(
                      -((p.priceMin - p.promotionalPriceMin) / p.priceMin) * 100
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

export default RelatedProduct;

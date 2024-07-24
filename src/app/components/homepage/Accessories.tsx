"use client";
import { accessories } from "@/src/assests";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { formatPrice } from "@/src/utilities/price-format";
import Link from "next/link";
import { Product } from "@/src/models";
import Rating from "@mui/material/Rating";
import Carousel from "react-multi-carousel";
import { responsiveForAccessories } from "@/src/utilities/carouselResponsive";
import { productApi } from "../../apis/productApi";
import CircleLoading from "../Loading";
import { useRouter } from "next/navigation";
import customerBehavior from "@/src/utilities/customer-behavior";

const Accessories = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getProducts = async () => {
      setLoading(true);
      const result = await productApi.getFashionAccessories(8);
      setProducts(result?.result.content || []);
      setLoading(false);
    };
    getProducts();
  }, []);

  if (loading) {
    return (
      <section className="lg:container">
        <div>
          <div className="px-0 lg:px-2">
            <Image
              width={1230}
              height={900}
              className="w-full h-56 md:h-64 object-cover xl:h-96 transition-all"
              src={accessories}
              alt="Accessories"
            ></Image>
          </div>
        </div>
        <div className="w-full grid place-content-center pb-4 md:pb-12 pt-6">
          <CircleLoading />
        </div>
      </section>
    );
  }

  return (
    <section className="lg:container">
      <div>
        <div className="px-0 lg:px-2">
          <Image
            width={1230}
            height={900}
            className="w-full h-56 md:h-64 object-cover xl:h-96 transition-all"
            src={accessories}
            alt="Accessories"
          ></Image>
        </div>
        <div className="pb-4 md:pb-12 pt-6">
          <Carousel
            swipeable={true}
            draggable={false}
            // ssr={true}
            responsive={responsiveForAccessories}
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
              products.map((p) => (
                <Link
                  onClick={async () => {
                    await customerBehavior(p.productId);
                  }}
                  href={`/product/${p.productId}`}
                  className={`relative hover:cursor-pointer group animate-fadeIn ${
                    p.productId === 4 ? "md:hidden xl:block" : "block"
                  }`}
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
                      {/* <div className="flex gap-x-2 items-center">
                      {["red", "pink", "green"].map((color, i) => {
                        //   products[p.productId - 1].active === color
                        //   ? "bg-white border-black"
                        //   : "bg-white border-border-color"
                        return (
                          <div
                            key={i}
                            onClick={() => {}}
                            className={`rounded-full border p-0.5`}
                          >
                            <div
                              key={color}
                              className="rounded-full size-5"
                              style={{ backgroundColor: `${color}` }}
                            ></div>
                          </div>
                        );
                      })}
                    </div> */}
                      <div className="flex gap-x-2 items-center">
                        <Rating
                          name="read-only"
                          precision={0.2}
                          size="small"
                          value={Math.round(p.rating)}
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

        {/* <div className="grid place-items-center pb-12 border-b border-border-color mx-4">
          <Link
            href={"/product"}
            className=" bg-black text-white py-3 px-8 rounded-lg hover:bg-primary-color flex items-center gap-x-2"
          >
            <span>Xem thêm</span>
            <EastIcon />
          </Link>
        </div> */}
      </div>
    </section>
  );
};

export default Accessories;

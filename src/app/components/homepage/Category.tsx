"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Carousel from "react-multi-carousel";
import { responsive8 } from "@/src/utilities/carouselResponsive";
import { Category as CategoryType } from "@/src/models";
import { useRouter } from "next/navigation";
const Category = ({ categories }: { categories: CategoryType[] }) => {
  const [cateList, setCateList] = useState<CategoryType[]>([]);

  useEffect(() => {
    if (categories && categories.length > 0) {
      setCateList(categories);
    }
  }, []);

  return (
    <section className="lg:container mt-0 md:mt-8 transition-all">
      <div className="flex justify-between items-start max-lg:flex-col gap-x-32 gap-y-1 p-4">
        <h2 className="text-lg md:text-3xl font-medium lg:flex-[0_0_35%] lg:max-w-[35%] transition-all">
          Danh mục sản phẩm
        </h2>
      </div>
      <Carousel
        swipeable={true}
        draggable={false}
        ssr={true}
        responsive={responsive8}
        // autoPlay={true}
        // infinite={true}
        autoPlaySpeed={3000}
        keyBoardControl={true}
        transitionDuration={500}
        arrows={true}
        deviceType={"desktop"}
        containerClass="carousel-container"
      >
        {cateList &&
          cateList.length > 0 &&
          cateList.map((category) => {
            return (
              <div
                key={category.categoryId}
                className=" text-text-color col-span-1 grid grid-cols-1 place-content-center
                     hover:cursor-pointer border border-border-color p-4 hover:shadow-hd"
              >
                <Link href={`/category/${category.name}`}>
                  <div className="grid place-content-center">
                    <Image
                      priority
                      width={400}
                      height={0}
                      className="w-[6rem] h-[6rem] rounded-full
                         border-2 border-border-color"
                      alt="categoryImage"
                      src={category.image}
                    ></Image>
                  </div>
                  <p className="p-4 grid place-content-center truncate">
                    {category.name}
                  </p>
                </Link>
              </div>
            );
          })}
      </Carousel>
    </section>
  );
};

export default Category;

"use client";
import { banner1, banner26 } from "@/src/assests";
import Image from "next/image";
import React, { useState } from "react";
import { Carousel } from "react-responsive-carousel";
import { MyArrowNext, MyArrowPrev } from "../Arrows";
import { MyIndicator } from "../Indicator";
import Link from "next/link";
import { Banner as BannerType } from "@/src/models";

const Banner = ({ banners }: { banners: BannerType[] }) => {
  const [arrows, setArrowsStatus] = useState(false);

  return (
    <section className="xl:px-[6.25rem]">
      <div
        onMouseEnter={() => setArrowsStatus(true)} // Added line
        onMouseLeave={() => setArrowsStatus(false)} // Added line
      >
        <Carousel
          showThumbs={false}
          showStatus={false}
          infiniteLoop={true}
          showArrows={false} // Modified line
          renderArrowPrev={arrows ? MyArrowPrev : undefined}
          renderArrowNext={arrows ? MyArrowNext : undefined}
          renderIndicator={MyIndicator}
        >
          {banners.slice(0, 3).map((banner, index) => {
            if (index == 0) {
              return (
                <article
                  key={banner.bannerId}
                  className="h-48 lg:h-96 max-h-144"
                >
                  <div className="relative">
                    <Image
                      priority
                      className="shadow-sm w-full h-48 lg:h-96 max-h-144 object-cover object-top"
                      alt="banner-img"
                      src={banner1}
                    ></Image>
                  </div>
                  <div
                    className="absolute bottom-[10%] md:bottom-[20%] lg:bottom-[30%] xl:bottom-[20%]
               left-[5.5%] flex flex-col items-start gap-y-4 text-text-color transition-all duration-300 ease-in-out"
                  >
                    <h1 className="font-bold text-ssm uppercase text-primary-color">
                      Winter Collection 2024
                    </h1>
                    <p className="text-2xl md:text-4xl lg:text-6xl capitalize flex flex-col text-left font-medium md:font-light">
                      <span>Valentin Paul</span>
                      <span>Essential Collection</span>
                    </p>
                    <Link
                      href={"/product"}
                      className="my-button w-32 hover:bg-primary-color "
                    >
                      Xem thêm
                    </Link>
                  </div>
                </article>
              );
            }
            if (index == 2) {
              return (
                <article
                  key={banner.bannerId}
                  className="h-48 lg:h-96 max-h-144"
                >
                  <div className="relative">
                    <Image
                      priority
                      className="shadow-sm w-full h-48 lg:h-96 max-h-144 object-cover object-top"
                      alt="banner-img"
                      src={banner26}
                    ></Image>
                  </div>
                  <div
                    className="absolute bottom-[10%] md:bottom-[20%] lg:bottom-[30%] xl:bottom-[20%]
               left-[5.5%] flex flex-col items-start gap-y-4 text-text-color transition-all duration-300 ease-in-out"
                  >
                    <h1 className="font-bold text-ssm uppercase text-primary-color">
                      Winter Collection 2024
                    </h1>
                    <p className="text-2xl md:text-4xl lg:text-6xl capitalize flex flex-col text-left font-medium md:font-light">
                      <span>Valentin Paul</span>
                      <span>Essential Collection</span>
                    </p>
                    <Link
                      href={"/product"}
                      className="my-button w-32 hover:bg-primary-color "
                    >
                      Xem thêm
                    </Link>
                  </div>
                </article>
              );
            }
            return (
              <article key={banner.bannerId} className="h-48 lg:h-96 max-h-144">
                <div className="relative">
                  <Image
                    width={1080}
                    height={300}
                    priority
                    className="shadow-sm w-full h-48 lg:h-96 max-h-144 object-cover object-center"
                    alt="banner-img"
                    src={banner.image}
                  ></Image>
                </div>
                {/* <div
                className="absolute bottom-[10%] md:bottom-[20%] lg:bottom-[30%] xl:bottom-[15%]
             left-[5.5%] flex flex-col items-start gap-y-4 text-text-color transition-all duration-300 ease-in-out"
              >
                <h1 className="font-bold text-ssm uppercase text-primary-color">
                  Winter Collection 2024
                </h1>
                <p className="text-2xl md:text-4xl lg:text-6xl capitalize flex flex-col text-left font-medium md:font-light">
                  <span>Valentin Paul</span>
                  <span>Essential Collection</span>
                </p>
                <Link
                  href={"/product"}
                  className="my-button w-32 hover:bg-primary-color "
                >
                  Xem thêm
                </Link>
              </div> */}
              </article>
            );
          })}
        </Carousel>
      </div>
    </section>
  );
};

export default Banner;

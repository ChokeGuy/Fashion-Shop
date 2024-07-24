"use client";
import { Product } from "@/src/models";
import usePath from "@/src/utilities/link";
import {
  Link,
  Pagination,
  Rating,
  SelectChangeEvent,
  Slider,
} from "@mui/material";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { banner26 } from "@/src/assests";
import { formatPrice } from "@/src/utilities/price-format";
import TemporaryDrawer from "../Drawer";
import CircleLoading from "../Loading";
import { CategoryFilter, ColorFilter, SizeFilter } from "../product/Filter";
import PaginationInfo from "../product/paginationInfo";
import ItemsSelect from "../product/Select";
import FilterListIcon from "@mui/icons-material/FilterList";
import StarIcon from "@mui/icons-material/Star";
import { SortType } from "@/src/constants/sort-by";
import customerBehavior from "@/src/utilities/customer-behavior";

type ProductsByCategoryProps = {
  products: Product[];
  totalElements: number;
};

const ProductsByCategory = ({
  products,
  totalElements,
}: ProductsByCategoryProps) => {
  const path = usePath();
  const pathname = usePathname();
  const { replace, push } = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 0;
  const currentSizePerPage = Number(searchParams.get("sizePerPage")) || 9;
  const currentSortBy: SortType =
    (searchParams.get("sortBy") as SortType) || "NEWEST";

  const [isLoading, setIsLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [page, setPage] = useState(0);
  // Default size per page is 9
  const [sizePerPage, setSizePerPage] = useState(9);

  // [1: Newest, 2: Most popular, 3: Price low to high, 4: Price high to low]
  const [sortBy, setSortBy] = useState(1);
  //Default prices from 0 to 5.000.000
  const [prices, setPrices] = useState([0, 5000]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.delete("sizePerPage");
    params.delete("page");
    replace(`${pathname}?${params.toString()}`);
  }, []);
  useEffect(() => {
    setIsLoading(false);
    setPage(currentPage);
  }, [currentPage]);

  useEffect(() => {
    setIsLoading(false);
    setSizePerPage(currentSizePerPage);
  }, [currentSizePerPage]);

  useEffect(() => {
    setIsLoading(false);
    const sortBy = getSortTypeFromEnum(currentSortBy);
    setSortBy(sortBy);
  }, [currentSortBy]);

  const handleChangePrice = (event: Event, newValue: number | number[]) => {
    setPrices(newValue as number[]);
  };

  //Handle change page event
  const handleChangePage = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("page", value.toString());
    } else params.delete("page");
    replace(`${pathname}?${params.toString()}`);
    setIsLoading(true);
    setPage(value);
  };

  const getSortType = (sortBy: number): SortType => {
    switch (sortBy) {
      case 1:
        return "NEWEST";
      case 2:
        return "POPULAR";
      case 3:
        return "PRICE_ASC";
      case 4:
        return "PRICE_DESC";
      default:
        return "NEWEST";
    }
  };

  const getSortTypeFromEnum = (sortBy: SortType): number => {
    switch (sortBy) {
      case "NEWEST":
        return 1;
      case "POPULAR":
        return 2;
      case "PRICE_ASC":
        return 3;
      case "PRICE_DESC":
        return 4;
      default:
        return 1;
    }
  };

  const handleSortBy = (sortBy: number) => {
    const sortType = getSortType(sortBy);
    const params = new URLSearchParams(searchParams);
    if (sortBy) {
      params.set("sortBy", sortType);
    } else params.delete("sortBy");
    replace(`${pathname}?${params.toString()}`, { scroll: false });
    setSortBy(sortBy);
    setIsLoading(true);
    setPage(0);
  };

  const handleChangeSelect = (event: SelectChangeEvent<number>) => {
    const value = event.target.value as number;
    if (value >= 1 && value <= 4) {
      handleSortBy(value);
      return;
    } else {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set("sizePerPage", value.toString());
        params.set("page", "1");
      } else params.delete("sizePerPage");

      replace(`${pathname}?${params.toString()}`);
      setPrices([0, 5000]);
      setIsLoading(true);
      setPage(0);
      setSizePerPage(value);
    }
  };

  return (
    <section className="px-4 lg:container">
      <div className="grid grid-cols-12">
        <Breadcrumbs
          separator="/"
          className="col-span-full pt-4 pb-8 capitalize text-base text-text-light-color"
          aria-label="breadcrumb"
        >
          {path.map((value, index) => {
            if (index === path.length - 1) {
              return (
                <Typography
                  className={`px-3 text-text-color font-medium`}
                  key={index}
                  color="text.primary"
                >
                  {decodeURIComponent(value)}
                </Typography>
              );
            }
            if (value === "category") {
              return (
                <div key={index} className={`${index == 0 ? "pr-3" : "px-3"}`}>
                  {`${value}`}
                </div>
              );
            }
            return (
              <Link
                key={index}
                className={`${index == 0 ? "pr-3" : "px-3"} hover:opacity-55`}
                underline="hover"
                color="inherit"
                href={`${value === "home" ? "/" : `/${value}`}`}
              >
                {value}
              </Link>
            );
          })}
        </Breadcrumbs>
      </div>
      <div className="grid grid-cols-12">
        <div className="col-span-12 relative flex flex-col">
          <div className="relative mb-[1.875rem] max-lg:order-2">
            <Image
              className="w-full h-64 md:w-full md:h-64 object-cover object-center"
              src={banner26}
              alt="banner"
            ></Image>
            <div
              className="absolute bottom-[35%] md:bottom-[20%] lg:bottom-[25%] xl:bottom-[35%]
             left-[5.5%] flex flex-col items-start gap-y-4 text-text-color transition-all duration-300 ease-in-out"
            >
              <h1 className="text-3xl lg:text-4xl flex flex-col ">
                Nhiều sản phẩm với đủ kiểu dáng
                <span>cho mọi người</span>
              </h1>
              <p className="text-ssm md:text-base text-white capitalize flex flex-col text-left font-medium md:font-light max-w-96">
                Bạn có muốn thay đổi phong cách của mình không? Hãy thử ngay
              </p>
            </div>
          </div>
          <div
            className="flex items-center justify-between lg:mb-[1.875rem] max-lg:fixed 
          max-lg:left-0 max-lg:right-0 max-lg:border max-lg:border-border-color max-lg:border-t-0 max-lg:shadow-sm
          top-[126px] ssm:top-[136px] sm:top-[134px] md:top-[140px] lg:top-[154px] max-lg:z-20 max-lg:p-4 bg-white max-lg:order-1"
          >
            <div className="flex items-center gap-x-3 text-sm max-lg:hidden">
              <div>
                <PaginationInfo
                  page={page}
                  itemsPerPage={sizePerPage}
                  totalItems={totalElements}
                />{" "}
              </div>
            </div>
            <div className="flex items-center gap-x-3 text-sm invisible">
              <TemporaryDrawer
                children={
                  <div className="flex gap-x-2 items-center cursor-pointer hover:opacity-55 transition-opacity">
                    <FilterListIcon />{" "}
                    <p className="font-semibold max-ssm:hidden">
                      Tìm kiếm sản phẩm
                    </p>
                  </div>
                }
                content={
                  <div className="p-4 overflow-hidden">
                    <div className="flex flex-col space-y-2">
                      <h1 className="font-medium text-lg capitalize">
                        Danh mục sản phẩm
                      </h1>
                      <CategoryFilter
                        setLoading={setIsLoading}
                        categories={[]}
                      />
                    </div>
                    <div className="flex flex-col space-y-4">
                      <h1 className="font-medium text-lg capitalize">
                        {" "}
                        Lọc theo giá
                      </h1>
                      <div className="flex items-end justify-between">
                        <div>
                          <p>
                            Giá:{" "}
                            {`${prices[0] == 0 ? "0" : prices[0] + "K"} - ${
                              prices[1]
                            }K`}
                          </p>
                        </div>
                        <button
                          className="bg-background px-4 py-1 hover:bg-primary-color hover:text-white transition-colors
                text-center"
                        >
                          Lọc
                        </button>
                      </div>
                      <div className="px-1">
                        <Slider
                          step={5}
                          size={"small"}
                          getAriaLabel={() => "Price range"}
                          value={prices}
                          onChange={handleChangePrice}
                          valueLabelDisplay="auto"
                          valueLabelFormat={(value) => (
                            <div className="p-1">{`${value}K`}</div>
                          )}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col space-y-4">
                      <h1 className="font-medium text-lg capitalize">
                        {" "}
                        Lọc theo màu sắc
                      </h1>
                      <ColorFilter setLoading={setIsLoading} colors={[]} />
                    </div>
                    <div className="flex flex-col space-y-4">
                      <h1 className="font-medium text-lg capitalize">
                        {" "}
                        Lọc theo kích cỡ
                      </h1>
                      <SizeFilter setLoading={setIsLoading} sizes={[]} />
                    </div>
                  </div>
                }
                anchor={"left"}
                drawerOpen={drawerOpen}
                toggleDrawerOpen={setDrawerOpen}
              />
            </div>
            <div className="flex items-center gap-x-3 text-sm">
              <div className="border-r border-border-color max-lg:hidden">
                <ItemsSelect
                  display={"Hiển thị"}
                  sizePerPage={sizePerPage}
                  handleChangeSelect={handleChangeSelect}
                  items={[
                    {
                      label: "09 sản phẩm",
                      value: 9,
                    },
                    {
                      label: "18 sản phẩm",
                      value: 18,
                    },
                    {
                      label: "36 sản phẩm",
                      value: 36,
                    },
                    {
                      label: "72 sản phẩm",
                      value: 72,
                    },
                  ]}
                />
              </div>
              <div>
                <ItemsSelect
                  display={"Sắp xếp theo"}
                  items={[
                    {
                      label: "Mới nhất",
                      value: 1,
                    },
                    {
                      label: "Phổ biến nhất",
                      value: 2,
                    },
                    {
                      label: "Giá thấp đến cao",
                      value: 3,
                    },
                    {
                      label: "Giá cao đến thấp",
                      value: 4,
                    },
                  ]}
                  sortBy={sortBy}
                  handleChangeSelect={handleChangeSelect}
                />
              </div>
            </div>
          </div>
          {isLoading ? (
            <div className="container h-[40vh] grid place-items-center pb-4 mt-8 max-lg:order-3">
              <CircleLoading />
            </div>
          ) : products && products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 pb-4 border-b border-border-color max-lg:order-3">
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
                            height={400}
                            className="w-full h-56 ssm:h-64 sm:h-96 md:h-[480px] lg:h-96 object-cover object-center"
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
                              return (
                                <div
                                  key={color}
                                  onClick={() => {}}
                                  className={`rounded-full border p-0.5`}
                                >
                                  <div
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
                            -(
                              (p.priceMin - p.promotionalPriceMin) /
                              p.priceMin
                            ) * 100
                          ).toFixed(0)}
                          %
                        </label>
                      )}
                    </Link>
                  ))}
              </div>
              <div className="grid place-items-center mt-4 max-lg:order-4">
                <Pagination
                  count={Math.ceil(totalElements / sizePerPage)}
                  page={page == 0 ? 1 : page}
                  onChange={handleChangePage}
                  variant="outlined"
                  color="primary"
                  size="large"
                />
              </div>
            </>
          ) : (
            <div className="text-xl text-center font-semibold p-4 grid place-items-center w-full h-[15vh] text-primary-color">
              Không tìm thấy sản phẩm nào
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductsByCategory;
